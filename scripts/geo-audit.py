#!/usr/bin/env python3
"""Rawaj's AI-search (GEO/AEO) check: ask AI assistants the questions clients ask and record
whether Hayakkom is named in the answer, cited as a source, and in what position.

Runs only from a Claude Code session whose environment holds the OpenRouter network secret
(the proxy adds the key; nothing secret is in this file). Sends ONLY generic question text,
never client, partner or Hub data.

Usage: python3 scripts/geo-audit.py scripts/geo-questions.json out.json [--max-usd 1.0]
"""
import concurrent.futures as cf
import json
import re
import sys
import urllib.request

MODELS = ["openai/gpt-4o-mini:online", "perplexity/sonar", "google/gemini-2.5-flash:online"]
BRAND = re.compile(r"hayakk?om|حياكم", re.I)


def ask(model, q):
    body = {"model": model, "max_tokens": 800, "messages": [{"role": "user", "content": q}]}
    req = urllib.request.Request("https://openrouter.ai/api/v1/chat/completions", data=json.dumps(body).encode(),
                                 headers={"Authorization": "Bearer via-proxy", "content-type": "application/json"})
    try:
        r = json.load(urllib.request.urlopen(req, timeout=150))
    except Exception as e:  # 402 = no OpenRouter credit
        return {"error": str(e)[:160]}
    msg = r["choices"][0]["message"]
    text = msg.get("content") or ""
    urls = [a.get("url_citation", {}).get("url", "") for a in msg.get("annotations") or []] + list(r.get("citations") or [])
    m = BRAND.search(text)
    return {
        "mentioned": bool(m),
        "position_chars": m.start() if m else None,
        "cited": any("hayakkom.com" in u for u in urls),
        "sources": urls[:12],
        "answer": text[:4000],
        "cost": r.get("usage", {}).get("cost", 0) or 0,
    }


def main():
    qs = json.load(open(sys.argv[1], encoding="utf-8"))
    out = sys.argv[2]
    cap = float(sys.argv[sys.argv.index("--max-usd") + 1]) if "--max-usd" in sys.argv else 1.0
    jobs = [(m, q) for q in qs for m in MODELS]
    res, spent = [], 0.0
    with cf.ThreadPoolExecutor(6) as ex:
        for (m, q), r in zip(jobs, ex.map(lambda a: ask(a[0], a[1]["q"]), jobs)):
            spent += r.get("cost", 0)
            res.append({"model": m, **q, **r})
    json.dump(res, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    ok = [r for r in res if "error" not in r]
    print(f"answers {len(ok)}/{len(res)} · named {sum(r['mentioned'] for r in ok)} · cited {sum(r['cited'] for r in ok)} · ${spent:.3f} (cap ${cap})")
    for r in res:
        flag = "ERR" if "error" in r else ("✅" if r["mentioned"] else "❌") + ("📎" if r.get("cited") else "")
        print(flag, r["model"].split("/")[1][:20], "|", r["q"][:70])


if __name__ == "__main__":
    main()

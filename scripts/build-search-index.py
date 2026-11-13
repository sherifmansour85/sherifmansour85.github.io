#!/usr/bin/env python3
"""Build the site search index (assets/search-index.json) used by the HK-SEARCH block in assets/hk-share.js.

Run after adding or editing pages:  python3 scripts/build-search-index.py
Each live page (not redirects, not noindex) becomes one entry with its title, description, language, a category
used by the search filters, the first indicative price range found on it, and its questions and answers
(from FAQPage structured data), so the search also works as a knowledge base.
"""
import glob
import html
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP = ('graphify-out/', 'node_modules/', 'scripts/', '.claude/')

# category by slug (first path segment after an optional /ar/)
TREAT = {'dental', 'dental-care-package', 'dentist-urgent', 'hair-transplant', 'cosmetic-surgery', 'weight-loss', 'eyes-lasik',
         'orthopedics', 'physiotherapy', 'full-checkup', 'medical', 'services', 'video-consultation', 'hotel-doctor', 'doctor-gp',
         'doctor-children', 'nurse-visit', 'wellness', 'treatment-with-tourism', 'medical-and-dental-cards', 'calculator'}
HOLI = {'holidays', 'sharm', 'sharm-5-star-hotels', 'hurghada', 'safaga', 'north-coast', 'north-coast-villas', 'nile-cruise',
        'nile-cruise-events', 'cairo', 'luxor', 'aswan', 'alexandria', 'marsa-alam', 'dahab', 'siwa', 'excursions', 'vip-trip',
        'honeymoon-egypt', 'first-time-in-egypt', 'cultural', 'adventure', 'religious', 'heritage', 'coastal', 'tourists',
        'wellness-retreats', 'saudi-school-holidays-egypt', 'eid-al-adha-egypt-2027', 'eid-al-fitr-egypt-2027',
        'saudi-national-day-egypt', 'ru', 'uk'}
PACK = {'packages'}
KUN = {'kunooz'}


def category(slug):
    first = slug.split('/')[0] if slug else ''
    if first in KUN:
        return 'kunooz'
    if first in PACK:
        return 'packages'
    if first in TREAT:
        return 'treatments'
    if first in HOLI:
        return 'holidays'
    if first == 'blog' or first in ('travel-guide', 'how-to-choose', 'who-we-are', 'about', 'saudi-arabia', 'uae', 'kuwait'):
        return 'guides'
    return 'company'


def text(s):
    return ' '.join(html.unescape(re.sub(r'<[^>]+>', ' ', s or '')).split())


def main():
    out = []
    for f in sorted(glob.glob(os.path.join(ROOT, '**', 'index.html'), recursive=True)):
        rel = os.path.relpath(f, ROOT).replace(os.sep, '/')
        if rel.startswith(SKIP):
            continue
        h = open(f, encoding='utf-8').read()
        if 'http-equiv="refresh"' in h[:4000] or re.search(r'<meta name="robots" content="noindex', h):
            continue
        url = '/' + rel[:-len('index.html')]
        ar = url.startswith('/ar/')
        slug = (url[4:] if ar else url[1:]).strip('/')
        lang = 'ar' if ar else ('ru' if slug == 'ru' else 'en')
        title = text(re.search(r'<title>(.*?)</title>', h, re.S).group(1)) if '<title>' in h else url
        title = re.split(r'\s[|–]\s(?:Hayakkom|حياكم)\b', title)[0].strip()
        m = re.search(r'<meta name="description" content="([^"]*)"', h)
        desc = text(m.group(1)) if m else ''
        h1 = re.search(r'<h1[^>]*>(.*?)</h1>', h, re.S)
        qa = []
        for b in re.findall(r'<script type="application/ld\+json">(.*?)</script>', h, re.S):
            try:
                d = json.loads(b)
            except Exception:
                continue
            for node in (d.get('@graph', [d]) if isinstance(d, dict) else d):
                if isinstance(node, dict) and node.get('@type') == 'FAQPage':
                    for q in node.get('mainEntity', [])[:8]:
                        a = text((q.get('acceptedAnswer') or {}).get('text', ''))
                        qa.append([text(q.get('name', ''))[:160], a[:320]])
        body = text(re.sub(r'<script.*?</script>|<style.*?</style>', ' ', h, flags=re.S))
        main_body = text(re.sub(r'<script.*?</script>|<style.*?</style>', ' ', h[h.find('<main'):h.find('</main>')] if '<main' in h else '', flags=re.S)) or body
        if slug in ('ru', 'uk'):
            pm = re.search(r'([$£]\d[\d,]*\s?[–-]\s?[$£]?\d[\d,]*)', main_body)
        else:
            pm = re.search(r'(\d[\d,]*\s?[–-]\s?\d[\d,]*\s?(?:SAR|ريال)(?:\s(?:per room|per person|per tooth|للشخص|للغرفة))?)', main_body) or re.search(r'(\d[\d,]*\s?[–-]\s?\d[\d,]*\s?(?:SAR|ريال))', body)
        heads = [text(x)[:80] for x in re.findall(r'<h2[^>]*>(.*?)</h2>', h, re.S)[:10]]
        out.append({'u': url, 'l': lang, 'c': category(slug), 't': title[:110], 'h': text(h1.group(1))[:140] if h1 else '',
                    'd': desc[:260], 'p': pm.group(1).rstrip(',.، ') if pm else '', 'k': ' · '.join(heads)[:400], 'q': qa})
    path = os.path.join(ROOT, 'assets', 'search-index.json')
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(out, fh, ensure_ascii=False, separators=(',', ':'))
    print('search index: %d pages, %d answers, %d KB' % (len(out), sum(len(x['q']) for x in out), os.path.getsize(path) // 1024))


if __name__ == '__main__':
    main()

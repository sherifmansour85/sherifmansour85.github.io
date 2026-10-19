#!/usr/bin/env python3
"""Site integrity checks for hayakkom.com (static HTML, no dependencies).

Run from anywhere:  python3 scripts/check-site.py
Exits 1 and lists every problem if a check fails.
"""
import os
import re
import sys
from urllib.parse import urlparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {'.git', '.claude', 'graphify-out', 'scripts', 'node_modules'}
ASSET = re.compile(r'\.(css|js|png|jpe?g|svg|webp|ico|json|txt|xml|webmanifest|pdf|mp4|woff2?)$')
# Wording the legal notice must keep on every page (see agents.md, "What Hayakkom is not").
LEGAL = {'en': 'registered Egyptian tourism companies', 'ar': 'شركات سياحة'}


def load_pages():
    pages = {}
    for d, dirs, files in os.walk(ROOT):
        dirs[:] = [x for x in dirs if x not in SKIP_DIRS]
        for f in files:
            if f.endswith('.html'):
                rel = '/' + os.path.relpath(os.path.join(d, f), ROOT).replace(os.sep, '/')
                url = rel[:-len('index.html')] if rel.endswith('/index.html') else rel
                with open(os.path.join(d, f), encoding='utf-8') as fh:
                    pages[url] = fh.read()
    return pages


def root_span(h):
    """Start/end offsets of <div id="root">…</div>, or None."""
    k = h.find('id="root"')
    if k < 0:
        return None
    s = h.rfind('<div', 0, k)
    depth = 0
    for m in re.finditer(r'<(/?)div\b[^>]*>', h[s:]):
        depth += -1 if m.group(1) else 1
        if depth == 0:
            return s, s + m.end()
    return None


def link_target(href, base):
    if href.startswith(('mailto:', 'tel:', 'javascript:', '#', 'data:', 'whatsapp:', 'sms:')):
        return None
    u = urlparse(href)
    if u.netloc and not u.netloc.endswith('hayakkom.com'):
        return None
    path = u.path
    if not path:
        return None
    if not path.startswith('/'):
        path = os.path.normpath(os.path.join(base if base.endswith('/') else os.path.dirname(base), path))
    if ASSET.search(path):
        return None
    if not os.path.splitext(path)[1] and not path.endswith('/'):
        path += '/'
    return path


def main():
    pages = load_pages()
    redirects = {u for u, h in pages.items() if 'http-equiv="refresh"' in h}
    real = sorted(u for u in pages if u not in redirects and u != '/404.html')
    problems = []

    with open(os.path.join(ROOT, 'sitemap.xml'), encoding='utf-8') as fh:
        sitemap = {urlparse(x).path for x in re.findall(r'<loc>([^<]+)</loc>', fh.read())}
    with open(os.path.join(ROOT, 'llms.txt'), encoding='utf-8') as fh:
        # llms.txt links pages with or without the trailing slash; the bare domain is the homepage.
        llms = {p.rstrip('/') + '/' for p in re.findall(r'https://www\.hayakkom\.com(/?[^\s)\]>"#?]*)', fh.read())}

    share_versions = set()
    for u in real:
        h = pages[u]
        ar = u.startswith('/ar/') or u == '/ar/'
        # 1. English/Arabic twins
        twin = u[3:] if ar else '/ar' + u
        if twin not in pages:
            problems.append(f'{u}: no {"English" if ar else "Arabic"} twin page {twin}')
        # 2. Sitemap and llms.txt coverage
        if u not in sitemap:
            problems.append(f'{u}: missing from sitemap.xml')
        if not ar and u not in llms:
            problems.append(f'{u}: missing from llms.txt')
        # 3. Legal notice
        if 'hk-legal-foot' not in h or LEGAL['ar' if ar else 'en'] not in h:
            problems.append(f'{u}: legal footer notice missing or reworded')
        # 4. Broken internal links
        for href in re.findall(r'''href=["']([^"']+)["']''', h):
            t = link_target(href, u)
            if t and t not in pages:
                problems.append(f'{u}: broken link {href}')
        # 5. Sections the app must not wipe sit outside #root
        span = root_span(h)
        for m in re.finditer(r'<section[^>]*data-hk-keep[^>]*>', h):
            if span and span[0] < m.start() < span[1]:
                problems.append(f'{u}: data-hk-keep section inside #root (the app will remove it)')
        share_versions.update(re.findall(r'hk-share\.js\?v=([\w.]+)', h))

    for s in sorted(sitemap):
        if s not in pages or s in redirects:
            problems.append(f'sitemap.xml lists {s}, which is not a live page')
    # 6. One cache-busting version of hk-share.js everywhere
    if len(share_versions) > 1:
        problems.append(f'hk-share.js is loaded with several versions: {", ".join(sorted(share_versions))}')

    problems = sorted(set(problems))
    if problems:
        print(f'check-site: {len(problems)} problem(s)', file=sys.stderr)
        for p in problems:
            print('  - ' + p, file=sys.stderr)
        return 1
    print(f'check-site: OK ({len(real)} pages, {len(redirects)} redirects)')
    return 0


if __name__ == '__main__':
    sys.exit(main())

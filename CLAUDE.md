# Hayakkom website (www.hayakkom.com)

Static site served by GitHub Pages. There is no build step and no package.json: every page is a
committed `index.html`, edited directly. `agents.md` and `llms.txt` describe the company for AI
answer engines; read `agents.md` before writing any copy.

## How pages work

- Each English page has an Arabic twin under `/ar/` (`/dental/` ↔ `/ar/dental/`). Change both.
- English pages are pre-rendered React output. `assets/app.js` re-renders `<div id="root">` on load,
  so **any static HTML you add inside `#root` disappears for visitors**. Put new static sections
  after `#root` closes, as `<section data-hk-keep="" id="…">`; the HK-KEEP block in
  `assets/hk-share.js` then shows them above the footer.
- Site-wide behaviour lives in `assets/hk-share.js`. After editing it, bump its `?v=` number in
  every page (all pages must use the same version).
- Folders such as `contact-us/`, `tours/` and `dental-care/` are redirects from old URLs. Keep them.

## Rules for content

- Hayakkom coordinates; it is not a healthcare provider, insurer, travel agency or tour operator.
  Never write that Hayakkom treats, diagnoses, operates trips or sells units. Treatment is by
  licensed medical institutions; trips, stays and transport are by registered Egyptian tourism
  companies. Every page keeps the legal footer notice (`hk-legal-foot`).
- Prices are indicative and in SAR unless stated; keep the "indicative / excluding flights" wording.
- A new or removed page must be reflected in `sitemap.xml`, `llms.txt` and `llms-full.txt`.

## Checks

`python3 scripts/check-site.py` checks English/Arabic twins, sitemap and llms.txt coverage, the legal
notice, broken internal links, `data-hk-keep` placement and the hk-share.js version. A hook runs it
after every page edit; fix anything it reports.

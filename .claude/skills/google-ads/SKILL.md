---
name: google-ads
description: Google Ads toolkit for hayakkom.com — look up competitors' running ads (Ad Library Scraper), write on-brand ad copy (Ad Writer), and research keyword volume and competition (Keyword Tool). Use when the user types /google-ads, asks to check competitor ads, write Google Ads copy, or research Google Ads keywords.
---

# Google Ads toolkit

Three sub-tools, chosen by what the user asks for or named explicitly in the command
(e.g. `/google-ads ad library <competitor>`, `/google-ads write ad copy for <service>`,
`/google-ads keywords <seed terms>`). If the user just runs `/google-ads` with nothing else,
ask which of the three they want, or do all three for the service/page they named.

**Never activate, launch, or spend on an actual Google Ads campaign without the owner explicitly
saying "activate it"** — these tools only research and draft; they do not touch the live Google Ads
account (account 7246270370, connected via Supermetrics).

## 1. Ad Library Scraper — see competitors' running ads

Google's free, public **Ads Transparency Center** (adstransparency.google.com) lists every ad
currently running through Google Ads for a given advertiser or domain. No login or account needed.

1. Scrape `https://adstransparency.google.com/?region=anywhere&domain=<competitor-domain>`
   (or `&advertiser=<name>` if searching by company name instead of domain) using the `firecrawl_scrape`
   tool (`mcp__Firecrawl__firecrawl_scrape`), format `markdown`.
2. If it says "This domain includes results for multiple advertiser accounts," list the advertiser
   names shown and scrape each one's filtered URL to see their ads individually.
3. If "No ads found," say so plainly — don't guess that a competitor is not advertising on other grounds.
4. Summarize what's found: ad count, formats (text/image/video), and any visible headline/body copy.
   Do not screenshot or republish a competitor's actual ad creative as original content.

Good first targets for Hayakkom: Egyptian medical-tourism coordinators and Red Sea/Nile holiday
packagers competing for Gulf traffic — ask the user which competitor domains to check, or suggest a
short list if they have none in mind.

## 2. Ad Writer — draft on-brand Google Ads copy

Write Responsive Search Ad headlines (≤30 chars each) and descriptions (≤90 chars each) for the page
or service named. Before writing, read this repo's `agents.md` and `CLAUDE.md` for the house rules
that must hold in every line:

- Hayakkom **coordinates**; it never treats, diagnoses, operates trips, or sells units. Treatment is
  by licensed medical institutions; trips are by registered Egyptian tourism companies.
- No "best doctor," no guarantees, no before/after claims, no discounts, no testimonials (health-ad rules).
- Prices, if mentioned, are indicative, in SAR, and exclude flights.
- Call visitors citizens/families of the GCC countries — never "Gulf" or "خليجيين."
- Slogan available if it fits: "Beyond the Egypt you know" / «مصر كما لم تعرفها من قبل».

Give the user several headline options and a couple of description options, in English and Arabic if
the ad targets both, and say which landing page on hayakkom.com each set points to.

## 3. Keyword Tool — search volume and competition

Use `mcp__Supermetrics_Marketing_Analytics__campaign_and_resource_get` with `ds_id: "AW"`,
`account_id: "7246270370"`, `resource_type: "keyword_ideas"`, and `params: {"keywords": [...seed
terms...], "language": "en" (or "ar"), "location": "<country code, e.g. SA, AE, KW>"}`.

Report each keyword's average monthly searches and competition level (LOW/MEDIUM/HIGH). Group results
by theme (e.g. treatment type, destination) and flag the highest-volume, lowest-competition terms as
the best candidates for new ad groups or on-page SEO. Run it once per market the user cares about
(Saudi Arabia, UAE, Kuwait are the core ones) since volumes differ by country.

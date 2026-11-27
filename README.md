[![Black Friday Deal Finder](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![Rank](https://make.fun/badge/black-friday-deal-finder-01/Nghyuu/black-friday-deal-finder-01-entry/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![Reward](https://make.fun/badge/black-friday-deal-finder-01/Nghyuu/black-friday-deal-finder-01-entry/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01)

# Bargain Beacon — Black Friday Deal Finder

A real Black Friday deal finder: 40 deals from Amazon, Best Buy, Walmart, Target, Disney+ and Apple TV, each with its sale price, usual price, discount, check time and source — plus an honest signal of whether it is really a deal (new low, strong price, or routine sale, with the evidence).

Every price was read from a store page or a deals roundup that names the store, on Black Friday morning, 27 Nov 2026. Nothing is invented.

## The site

Static files under `app/` — no build step, no network request. Open `app/index.html` in a browser.

- **All deals** (`#/`) — search plus live filters by category, store and discount, sortable by biggest discount, biggest saving, lowest price or name.
- **Best of the best** (`#/best`) — the new lows and strong prices only.
- **Categories** (`#/categories`, `#/category/<name>`) — 14 categories.
- **Stores** (`#/stores`, `#/store/<name>`) — per-store deal pages.
- **Deal detail** (`#/deal/<id>`) — full price facts, the honest call, check time, source and sale end date, with related deals.
- **How we check** (`#/about`) — the method: find it at the store, record the numbers, name the source, call it honestly.

## Files

- `app/index.html` — the shell
- `app/style.css` — the look
- `app/data.js` — the 40 checked deals
- `app/views.js` — the page renderers
- `app/main.js` — the hash router and live filtering
- `main.ts` — hands the site in: copies `app/` and `screenshots/` to `$MAKEFUN_OUTPUT_DIR` and writes `dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`
- `screenshots/` — real headless-Chromium renders of the site

## Run it

```sh
MAKEFUN_OUTPUT_DIR=/tmp/bf-out node main.ts
```

Requires Node 22. `MAKEFUN_OUTPUT_DIR` must be set; there is no fallback output directory.

# Najibullo Portfolio — Production v4

Current production URL: https://najibullo-portfolio.onrender.com

## Architecture

Maintainable sources live in:

- `src/js/` — behavior modules
- `src/styles/` — style modules
- `hero-3d.js` — dependency-free progressive 3D canvas enhancement
- `i18n.js` — EN / TG / RU localization and URL language handling

`script.js` and `styles.css` at the repository root are compatibility snapshots for the already-created Render static service. Generate them from source modules; do not edit the snapshots by hand.

## Full verification

```bash
python3 sync_snapshots.py
tsc -p tsconfig.json
python3 qa.py
python3 build.py
python3 qa.py dist
```

Or, if npm is available:

```bash
npm run check
```

No npm install is required by the portfolio itself. `tsc` must already be available in the development environment for type-checking.

## Local production preview

```bash
python3 build.py
python3 -m http.server 8000 -d dist
```

Open `http://localhost:8000/?lang=en`, `?lang=tg`, or `?lang=ru`.

## Render

`render.yaml` describes the intended production service: build command, `dist` publish directory, CSP/security headers, HSTS, cache rules and the `/index.html` redirect.

The currently live Render service was originally created manually. Until it is migrated/recreated from the Blueprint or its dashboard settings are made equivalent, the root compatibility snapshots keep the existing service functional. Do not claim Blueprint-only headers are live until they are verified on the public response.

For a later custom domain, set the build environment variable:

```text
SITE_URL=https://your-domain.example
```

`build.py` rewrites the production URL in canonical links, Open Graph metadata, sitemap, robots, runtime config and structured data.

## Contact

Contact and Project Concierge submit through the configured FormSubmit AJAX endpoint and have a `mailto:` fallback. FormSubmit requires the owner to complete its one-time verification email before real delivery is guaranteed. Success is shown only after the provider returns a successful response.

## Analytics / Core Web Vitals

LCP, CLS and INP are measured in-browser. The current snapshot is exposed as `window.PORTFOLIO_METRICS` and can be logged with `?perf=1`.

Central collection is deliberately disabled until a real GA4 ID, Cloudflare Web Analytics token, or first-party analytics endpoint is provided in `config.js`. No analytics credential is fabricated.

## Verification-only data

- GitHub is shown because the verified profile URL is known.
- LinkedIn and a domain email stay hidden until exact working values are supplied.
- Telegram stays hidden until a verified profile URL is supplied.
- Testimonials are never invented; without authorized client quotes, the site shows a verified-proof card instead.
- Unverified user/order/traffic counts remain unpublished.

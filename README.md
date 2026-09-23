# Najibullo Portfolio — Production Build

## Run locally
```bash
python3 -m http.server 8000
open http://localhost:8000
```

## Verified-data policy
The portfolio publishes only source-verified product facts. `assets/verified-metrics.json` intentionally keeps users/orders/masters/traffic as `null` until a real analytics export or database count is supplied. Do not replace these with estimates.

## GitHub / LinkedIn / domain email
Edit `config.js` and set exact verified URLs / address:
```js
social: { github: "https://github.com/...", linkedin: "https://www.linkedin.com/in/..." },
contact: { domainEmail: "hello@najibulloh.tj" }
```
Empty values stay hidden automatically.

## Analytics
`analytics.js` is production-ready but disabled until a real provider credential is set in `config.js`.
Supported options:
- Cloudflare Web Analytics: `cloudflareBeaconToken`
- GA4: `ga4Id`
- first-party endpoint: `endpoint`

It also captures LCP/CLS/INP through the browser PerformanceObserver API and only sends when analytics is actually configured. Do Not Track is respected.

## Verified testimonials
Add only real client feedback to `assets/testimonials.json`. The section remains hidden while the verified array is empty.

## HTTPS / security headers
`_headers`, `_redirects` and `.well-known/security.txt` are included for Cloudflare Pages / compatible static hosting. Attach the custom domain `najibulloh.tj` in the hosting dashboard and enable HTTPS there; DNS/SSL cannot be completed from this static ZIP alone.

## Final production checks
- Test TG / RU / EN
- Test mobile menu and case-study modal
- Verify Ustohona/TajLife external links
- Fill GitHub/LinkedIn only with exact profile URLs
- Add real usage metrics only from analytics/database exports
- Add real iOS screenshots only after a verified iOS build is available


## Strategy V3 interactions
- `Cmd/Ctrl + K`: Command Palette
- Theme button: dark / warm-light theme (saved locally)
- Demo Mode: interactive portfolio simulations, explicitly not live production data
- Three.js hero: desktop-only, performance-gated, automatic fallback on mobile/reduced motion/import failure
- Project Concierge: structured project brief flow

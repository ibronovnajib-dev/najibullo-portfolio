# Localization Audit — TJ / RU / EN

## Result
The portfolio now uses one complete localization system across the full interface.

### Languages
- **TJ** — Tajik (`html lang="tg"`)
- **RU** — Russian (`html lang="ru"`)
- **EN** — English (`html lang="en"`)

## What was fixed
- Replaced the previous partial EN/TJ hero-only toggle with explicit **TJ / RU / EN** controls.
- Added **167 translation keys per language**.
- Localized navigation, hero, metrics, project cards, About, Process, technology section labels, contact section, footer and both case-study modals.
- Localized accessibility text: skip link, `aria-label`s, image `alt` text and iframe title.
- Localized page title, meta description and Open Graph copy.
- Language selection persists in `localStorage`.
- Optional QA URLs are supported: `?lang=tg`, `?lang=ru`, `?lang=en`.
- Case-study labels update immediately even when a modal is already open.
- TajLife source-backed iframe now switches between three language-specific catalogs.

## TajLife source-backed catalog
Three catalog files are generated from the real TajLife source package:
- `assets/tajlife-services-tg.html`
- `assets/tajlife-services-ru.html`
- `assets/tajlife-services-en.html`

Each catalog contains **34 documented service areas** in the selected language.

## Copy review
### Tajik
- Removed mixed English UI copy from the Tajik experience where a natural Tajik equivalent exists.
- Kept only proper product/technology names and technical acronyms when translation would be misleading (for example Ustohona.tj, TajLife.tj, React, AWS, AI/SEO).
- Reworked awkward mixed wording from the earlier hero and product descriptions into natural Tajik prose.

### English
- Refined awkward phrases such as “End Product Ownership” to “End-to-End Ownership”.
- Refined “Open live” to “Visit live site”.
- Improved About copy to read naturally for a professional portfolio.

### Russian
- Added a complete Russian translation rather than a partial overlay.
- Removed unnecessary English UI wording while keeping product/technology names intact.

## Automated QA
- Translation dictionaries: **167 keys × 3 languages — PASS**
- Localization references resolved — **PASS**
- Desktop + mobile language selectors contain TJ/RU/EN — **PASS**
- Duplicate IDs — **0**
- Broken internal anchors — **0**
- Missing local assets — **0**
- TajLife catalogs — **34 entries × 3 languages — PASS**
- Unbound human-language UI text — **0**
- English/Cyrillic purity checks — **PASS**
- Tajik/Russian core-English leakage checks — **PASS**
- `script.js` syntax — **PASS**
- `i18n.js` syntax — **PASS**

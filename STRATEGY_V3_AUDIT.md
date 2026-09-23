# Strategy V3 — Expert Portfolio Upgrade

## Narrative order
ENTER → WHO YOU ARE → WHAT YOU BUILT → HOW YOU BUILT IT → PROOF → WHY IT MATTERS → CONTACT

Implemented DOM order:
1. Hero / Enter
2. About / Who you are
3. Capabilities + Projects / What you build and built
4. Process + System Map / How you build it
5. Real Product Proof + Demo Lab / Proof
6. Testimonials (verified-only) + Atelier / Why it matters
7. Contact + Project Concierge / Conversion

## Added
- Performance-gated Three.js cinematic hero layer with canvas fallback.
- Particle system, controlled parallax, glass layers and section transitions.
- Skills rebuilt as Frontend → Backend → Database → DevOps → AI system map.
- Case studies rewritten to Challenge → Architecture → Decisions → Difficulties → Solution → Outcome.
- Interactive Demo Mode for Ustohona request flow and TajLife service explorer.
- Cmd/Ctrl+K command palette for Projects, About, Tech Stack, Demo and Contact.
- Dark / warm-light theme system with saved preference.
- Existing magnetic buttons, cursor feedback, counters, hover states and loading skeletons retained/enhanced.
- Three.js loads only on desktop fine-pointer devices and is disabled for reduced-motion/mobile.
- Mobile-specific bottom action bar and single-column demo/system-map layouts.
- Contact form upgraded to name + email + project + message validation with explicit status; mailto remains honest static fallback.
- Footer now exposes stack/version while GitHub/LinkedIn remain configuration-driven and hidden when unverified.

## Performance constraints
- Three.js dynamic import is pinned to 0.180.0 and only requested when viewport ≥ 901px, pointer is fine, and reduced motion is off.
- Renderer pixel ratio capped at 1.35.
- 3D scene uses one low-detail wireframe + 260 points, pauses off-screen/hidden, and runs through requestAnimationFrame.
- Mobile uses existing lightweight canvas/CSS fallback.
- Below-fold motion sections use content-visibility.
- Existing WebP/lazy-loading/reduced-motion protections remain.

## QA
- **duplicate_ids**: `[]`
- **broken_anchors**: `[]`
- **missing_local_files**: `[]`
- **strategy_order_ok**: `true`
- **has_hero-three**: `true`
- **has_command-palette**: `true`
- **has_demo-lab**: `true`
- **has_tech-stack**: `true`
- **has_project-concierge**: `true`
- **has_contact-form**: `true`
- **theme_toggles**: `3`
- **command_triggers**: `2`
- **i18n_missing_en**: `[]`
- **i18n_missing_tg**: `[]`
- **i18n_missing_ru**: `[]`
- **i18n_key_counts**: `{"en": 408, "tg": 408, "ru": 408}`
- **css_brace_balance**: `0`
- **csp_allows_jsdelivr**: `true`
- **three_pinned**: `true`
- **mobile_three_guard**: `true`
- **lower_asset_count**: `5`

## Type-check
- Baseline legacy JS errors before this upgrade: **66**.
- New typed modules (`experience.js`, `three-scene.js`, config/i18n + globals): **0 errors**.
- Full legacy-aware check after upgrade: **48 errors** — all remain in older dynamic DOM/analytics code; the feature pass did not add type debt and reduced the baseline.
- All JavaScript files pass `node --check`.

## Runtime smoke test
Local HTTP server returned **200** for index, CSS, core JS, experience JS, Three scene loader, i18n, CV and hero asset.

## Browser rendering note
A Chromium screenshot regression run was attempted in this container, but the environment's headless GPU/ANGLE stack failed to initialize. The browser render was therefore **not** falsely marked PASS. Static DOM, asset, i18n, syntax, type-check and HTTP regressions did pass.

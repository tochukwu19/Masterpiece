# Roadmap

Phases follow Shopify's review stages, so each one leaves the theme closer to passing the
next gate. Each phase ends with Theme Check clean and a preview-store pass.

## Phase 0 — Decisions + tooling (blocking)
- [x] Stack: vanilla CSS on tokens, no Tailwind. **Alpine kept** (vendored, pinned) for interactions. Ajax Cart + Section Rendering APIs where needed.
- [x] Target industry: jewelry / fine accessories
- [x] Theme name: **Vermeil** (2026-10-12; replaced the placeholder "Jewls". No Theme Store theme by that name)
- [x] Fonts: Gloock (headings) + Figtree (body) via `font_picker`. Bodoni Moda + Manrope is the alternative pairing.
- [x] Shopify CLI installed (4.9.3, global + pinned devDependency)
- [ ] 👤 Connect a development store: `shopify theme dev --store <store>.myshopify.com` (owner logs in through the browser)
- [x] `.theme-check.yml`, `package.json` (dev/check/vendor scripts), `.gitignore` fixed, `.shopifyignore` updated
- [x] Removed wishlist (nav links + snippet), Judge.me badge + app embed, CDN Alpine, dead snippets/assets, Tailwind config/source, `collection.list` template
- [x] Theme Check baseline: **7 errors / 25 warnings** (from 9 / 33). All remaining errors are in files scheduled for rewrite.
- [ ] Lighthouse script (deferred to Phase 6, needs the dev store URL)

## Phase 1 — Foundation
- [x] `settings_schema.json`: theme_info, logo, favicon, 4 color schemes, typography (Gloock + Figtree), layout, buttons/inputs, product cards and badges, animations, cart type, search, currency, social links
- [x] `css-variables`, `base.css` (reset, type scale with distinct h0–h6, RTE, focus ring, buttons, forms, quantity, badges, media, price, pagination, reduced motion)
- [x] `layout/theme.liquid` + `layout/password.liquid`, `meta-tags` snippet (SEO, OG, Twitter), skip link, `lang`
- [x] Header and footer moved into section groups (legacy sections inside until Phase 2)
- [x] Core snippets: `image`, `icon`, `price`, `card-product`, `card-collection`, `card-article`, `section-heading`, `pagination`, `loading-spinner`
- [x] Legacy sections switched to the new cards and pagination (fixes audit A1–A3, A15, A21); old card snippets deleted
- [x] `global.js` (fetch, Section Rendering, events) and `cart.js` (`quickAdd`, legacy drawer store in cart currency, fixing A10)
- [x] Password template + section (moved up from Phase 5)
- [x] Locales: `en.default.json` + `en.default.schema.json`
- [ ] Drawer primitive with focus trap: moved to Phase 2 with its first consumer

## Phase 2 — Header, footer, cart
- [x] Drawer primitive on native `<dialog>` (focus trap, Escape, focus return, inert background); left, right and top variants
- [x] `header-group.json`: announcement bar (blocks, prev/next, no autoplay) + header (center/left logo, dropdown or mega menu, mobile drawer with nested accordions, search modal with predictive search, compact localization, `<shopify-account>`, cart count, sticky on scroll up)
- [x] `footer-group.json`: footer (menu, text, email signup, social and app blocks), localization, Follow on Shop, payment icons, policies, fitted wordmark
- [x] Cart drawer + `main-cart` + `cart.json`: line and order discounts, selling plans, unit price, properties, notes, tax/duties note, dynamic checkout buttons, empty state; Section Rendering updates of drawer, page and count in one request; no-JS fallback
- [x] Social icons generated from Simple Icons (CC0)
- [x] Legacy navbar, footer, sidebar cart, `templates/cart.liquid` and their icons removed
- [x] Kit: header, drawers and footer specimens
- [ ] 👤 Dev store connection (CLI signed in with an account that can't access `vermeil-6sitmu3d`)
- [x] Store pass: 3-level menu, Canada/France + English/French selectors, cart with `VERMEIL10` discount, drawer open/close/quantity
- [ ] Store pass still open: selling plan + unit price in cart, Follow on Shop, editor live preview of every setting

## Phase 3 — Product
- [x] `main-product` with blocks; gallery (stacked/grid, mobile carousel, lightbox), rich media (image, video, external video, 3D + AR), variant images
- [x] Variant picker (native swatches, buttons, dropdown) via Section Rendering `option_values`; price, compare-at, unit price, sold-out handling; combined listings
- [x] Buy buttons (`payment_button`), Shop Pay Installments, gift card recipient form, quantity rules
- [x] `product-recommendations` (related + complementary) and complementary block
- [x] Structured data
- [x] Store pass: 9 ring variants incl. sold-out combination, sale, sold-out product, gift card, 3D model, video, add to cart + discount
- [ ] Pickup availability renders nothing on the dev store (backlog B1)
- [ ] `featured-product` section moved to Phase 4 (backlog B2)

## Phase 4 — Discovery
Branch `phase-4-discovery`. Four commits, in this order. Each one is store-tested with real clicks and has kit specimens before the next starts.

**4a. Collection page**
- [x] `collection-banner` section: title, description, optional image; settings for alignment, image ratio, scheme and padding. It's a separate section so merchants can move or remove it.
- [x] `main-collection` section: toolbar (results count, sort, filter button), product grid (`card-product`), desktop and mobile column settings, products per page, pagination, empty and "no results for these filters" states.
- [x] `facets` snippet in a native `<dialog>` drawer:
  - real checkboxes for list filters
  - swatch and image presentation for `filter.presentation`
  - price range with min and max inputs
  - boolean filters; active-filter pills with remove links; Clear all
  - a plain GET form, so it works without JS
- [x] Alpine `facets` component:
  - serializes the form and fetches the grid with `section_id`
  - swaps the grid, count and pills
  - pushes the URL to history and restores on `popstate`
  - aborts stale requests; announces the result count in a live region
- [x] `templates/collection.json` rebuilt from these sections

**4b. Search and collection list**
- [x] `main-search` section:
  - search form, with results that mix products, articles and pages (a new `card-page` snippet)
  - the same `facets` and toolbar
  - empty-query and no-results states; pagination
- [x] `main-list-collections` section: `card-collection` grid, image ratio, product count, pagination (no sort setting: `paginate` only works on the unsorted `collections` drop)
- [x] Predictive search: already shipped in Phase 2; only the roadmap tick is left

**4c. Home sections**
- [x] Shared theme blocks in `blocks/`: `heading`, `text`, `button`, `custom-liquid`, and a private `_slide`; sections list exactly which blocks they accept, plus `@app`
- [x] Generic Alpine `carousel` component (`assets/components.js`): CSS scroll-snap, outlined prev/next buttons, loop and autoplay with pause, RTL-aware. Swiper 11 removed
- [x] Shared primitives in `base.css`: `.banner` (frame, heights, content positions), `.on-media` (text over images), `.content-stack`, `.deferred-media`
- [x] Sections: `hero`, `slideshow`, `featured-collection` (grid or carousel), `collection-list` (grid or carousel), `editorial-split`, `image-with-text`, `rich-text`, `multicolumn`, `logo-list`, `testimonials`, `video` (hosted video uses the `video-player` snippet, YouTube/Vimeo use the platform player), `blog-posts`, `newsletter`, `custom-liquid`
- [x] `featured-product` (B2): the product URL plus the section's own ID re-renders a home section in that product's context, so `productInfo` works unchanged. Price, quantity and buy buttons are shared snippets with `main-product`
- [x] `templates/index.json` rebuilt: settings-driven content, placeholders where blank, no bundled images, only resources every store has (`all` collection, `news` blog)
- [x] Carousel end-of-track behavior re-checked with real clicks at 1280px and 375px (Phase 5). Fixed two bugs: the product card's quick-add button overflowed the card by 10px, so the last snap point never reached the end and Next stayed enabled; and looping carousels disabled their buttons at the ends (`canPrev` / `canNext` now respect `loop`)

**4d. Clean-up and verification**
- [x] Delete the `template-*` sections plus `filter`, `collection` and the `icon-*` legacy snippets (only these sections use them). Drop Swiper from `docs/third-party.md`.
- [x] `application.css` and `legacy-bridge.css` stayed until Phase 5 removed the last templates that used Tailwind classes (deleted in 5d)
- [x] B5 moved up from Phase 6: `npm run lighthouse` (pinned devDependency) for home, collection and product, mobile and desktop
- [x] Lighthouse (owner-run DevTools on the dev theme preview, 2026-10-12): mobile perf 84 / a11y 95, desktop perf 91 / a11y 95 averages across home, collection, product. Fixed from the reports: collection CLS from the late `no-js` swap, legacy CSS on every page, card heading order, dynamic checkout contrast
- [ ] Theme Store checklist ticks; kit specimens for facets, toolbar, carousel, hero and the content sections

**Owner prep for 4a and 4b** (dev store, not theme):
- Search & Discovery filters: Availability, Price, Product type, and Metal (option, shown as swatches)
- 8 or more products in one collection, so grid and pagination can be tested with a low per-page setting
- One blog with 3 or more articles, with images, for `blog-posts` and search results
- One or two pages with body text, for page results in search

## Phase 5 — Content and accounts
Branch `phase-5-content`. Each commit removed its templates from the layout's legacy CSS list; 5d removed the list.
- [x] 5a. `main-blog` (tag filter, featured first post, pagination, empty state) and `main-article` (blocks, comments with pagination and messages, previous and next links). Shared `.pill` primitive; `share` moved to `components.js`
- [x] 5b. `main-page`, `contact-form` section (addable anywhere), `main-404` with search
- [x] 5c. Gift card rewrite (`main-gift-card` section, `gift-card.js`); password re-checked. Translated strings read by JS are decoded once in `global.js` (`t` HTML-escapes them)
- [x] 5d. Deleted `customers/*`, `application.css` and `legacy-bridge.css`; the layout loads only `base.css`. RTE pass; kit specimens for blog, article, comments, pages, contact, 404 and gift card. Theme Check: 0 offenses including warnings
- [x] ~~Customer templates~~ Not required: legacy customer accounts are deprecated and the legacy `customers/*` templates are no longer a Theme Store requirement (changelog, July 2026). Delete them, rely on new customer accounts + `<shopify-account>`

## Phase 6 — Hardening
Branch `phase-6-hardening`.
- [x] 6a. Requirements checklist re-audited against the code; stale entries from the original audit rewritten. Gap fixed: `@app` blocks in `featured-product`
- [x] 6b. Editor live preview: carousels scroll to the selected slide or quote and pause autoplay while their section is selected; selecting a section opens only the cart drawer (it used to open the header's menu drawer, the product lightbox or the filter drawer). Real-editor walkthrough is backlog B10
- [x] 6c. Settings copy review (all 763 strings); `validate-schema.mjs` now also fails on missing or untranslated labels, missing keys, lorem ipsum defaults, British spellings and "&"
- [x] 6d. Accessibility and HTML: `html-validate` on 19 rendered pages, axe-core (WCAG 2.2 AA + best practice) on every template and open drawer, focus-ring and keyboard pass. Fixed: font preload `crossorigin`, duplicate "Main" nav label, focusable static carousels, landmark elements, password page title, search field focus. Right-to-left support (B9): `dir` from the locale, logical properties, mirrored arrows and drawers
- [ ] 6e. Browser compatibility audit
- [x] Lighthouse ≥ 60 perf / ≥ 90 a11y on home, product and collection (mobile + desktop): measured in Phase 4 (mobile 84 / 95, desktop 91 / 95); not re-run
- [ ] Browser matrix + Instagram, Facebook and Pinterest webviews
- [ ] Settings copy review (style + terminology rules), editor live-preview pass on every section
- [ ] Install-parity check on a fresh store

## Phase 7 — Pre-launch (mostly owner actions)
- [ ] Demo store(s) via Dev Dashboard client-transfer store; real copy and licensed imagery; Bogus Gateway
- [ ] Documentation site + support contact form
- [ ] Listing assets, version 1.0.0, release notes, `CHANGELOG.md`
- [ ] Submit via the Partner Dashboard

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
- [ ] Store pass: menus with 3 levels, Markets with 2+ countries and languages, cart with discount + selling plan + unit price, Follow on Shop, editor live preview of every setting

## Phase 3 — Product
- [ ] `main-product` with blocks; gallery with rich media (image, video, external video, 3D), variant images, sticky info column
- [ ] Variant picker (buttons, swatches, dropdown) via Section Rendering; price, compare-at, unit price, sold-out handling
- [ ] Buy buttons (`payment_button`), pickup availability, Shop Pay Installments, gift card recipient form
- [ ] `featured-product` section, `product-recommendations` (related + complementary)
- [ ] Structured data

## Phase 4 — Discovery
- [ ] `main-collection` (banner, grid, facets drawer, sort, sale/sold-out badges, price ranges, unit price, empty state)
- [ ] `main-list-collections`, `main-search` (mixed object types + facets), predictive search
- [ ] Home sections: hero/slideshow, featured products, collection carousel, editorial split, logo list, testimonials, image with text, rich text, video, multicolumn, blog posts, newsletter, custom liquid

## Phase 5 — Content and accounts
- [ ] `main-blog`, `main-article` (comments + pagination + messages), `main-page`, contact form, 404, password, gift card
- [ ] ~~Customer templates~~ Not required: legacy customer accounts are deprecated and the legacy `customers/*` templates are no longer a Theme Store requirement (changelog, July 2026). Delete them, rely on new customer accounts + `<shopify-account>`

## Phase 6 — Hardening
- [ ] Lighthouse ≥ 60 perf / ≥ 90 a11y on home, product and collection (mobile + desktop)
- [ ] Browser matrix + Instagram, Facebook and Pinterest webviews
- [ ] Settings copy review (style + terminology rules), editor live-preview pass on every section
- [ ] Install-parity check on a fresh store

## Phase 7 — Pre-launch (mostly owner actions)
- [ ] Demo store(s) via Dev Dashboard client-transfer store; real copy and licensed imagery; Bogus Gateway
- [ ] Documentation site + support contact form
- [ ] Listing assets, version 1.0.0, release notes, `CHANGELOG.md`
- [ ] Submit via the Partner Dashboard

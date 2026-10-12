# Roadmap

Phases follow Shopify's review stages, so each one leaves the theme closer to passing the
next gate. Each phase ends with Theme Check clean and a preview-store pass.

## Phase 0 — Decisions + tooling (blocking)
- [x] Stack: vanilla CSS on tokens, no Tailwind. **Alpine kept** (vendored, pinned) for interactions. Ajax Cart + Section Rendering APIs where needed.
- [x] Target industry: jewelry / fine accessories
- [x] Theme name: **Jewls** (see the naming risk in `theme-store-requirements.md` §18)
- [ ] ⚠️ Fonts: owner wants Calvino Grande + General Sans, but neither is in Shopify's font library, which §15 requires. **Must be resolved before Phase 1 typography.**
- [x] Shopify CLI installed (4.9.3, global + pinned devDependency)
- [ ] 👤 Connect a development store: `shopify theme dev --store <store>.myshopify.com` (owner logs in through the browser)
- [x] `.theme-check.yml`, `package.json` (dev/check/vendor scripts), `.gitignore` fixed, `.shopifyignore` updated
- [x] Removed wishlist (nav links + snippet), Judge.me badge + app embed, CDN Alpine, dead snippets/assets, Tailwind config/source, `collection.list` template
- [x] Theme Check baseline: **7 errors / 25 warnings** (from 9 / 33). All remaining errors are in files scheduled for rewrite.
- [ ] Lighthouse script (deferred to Phase 6, needs the dev store URL)

## Phase 1 — Foundation
- [ ] `settings_schema.json`: theme_info, logo, favicon, color schemes (≥ 4), typography, layout, buttons, cards, cart type, social links, search
- [ ] `css-variables`, `base.css` (reset, type scale, h1–h6, RTE, focus ring, buttons, forms, badges)
- [ ] `layout/theme.liquid` + `layout/password.liquid`, `meta-tags` snippet (SEO, OG, Twitter), skip link, `lang`
- [ ] Core snippets: `image`, `icon`, `price`, `card-product`, `card-collection`, `card-article`, `section-heading`, `pagination`, `loading-spinner`
- [ ] `global.js`: pub/sub, fetch helpers, focus trap, `drawer-panel` element
- [ ] Locales: `en.default.json` + `en.default.schema.json`

## Phase 2 — Header, footer, cart
- [ ] `header-group.json`: announcement bar (blocks), header (logo, main menu with dropdowns and mega menu, mobile drawer, `<shopify-account>`, predictive search, localization, cart count)
- [ ] `footer-group.json`: footer (menu, text, newsletter, social blocks), localization, payment icons, wordmark, Follow on Shop
- [ ] Cart drawer + `main-cart` (discounts, selling plans, unit price, notes, taxes note, accelerated checkout, empty state)

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
- [ ] Customer templates: login, register, account, order, addresses (CRUD with country/province), activate, reset

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

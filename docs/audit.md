# Codebase audit — 2026-10-12

Scope: every file in the repo (75 files, about 195 KB), read by hand, plus a Theme Check run
(`@shopify/theme-check-node`, recommended config): **42 offenses, including 9 errors**. Theme Check
catches less than a third of what's below.

## Verdict

The **visual direction is worth keeping** and is the most valuable asset here. The **code is
a prototype**: about 70% of what the Theme Store needs doesn't exist yet, and much of what does
exist has to change shape. The main product section has to be rebuilt from blocks, a dozen
templates have to become JSON, and settings, color schemes and fonts have to come from the editor.

The realistic plan is a **structured rebuild that keeps the design language**, not an incremental
patch. Most files get rewritten. A few snippets (icons, filter logic, pagination markup) carry over
in spirit.

---

## A. Live bugs (broken today)

| # | Where | Bug | Effect |
|---|---|---|---|
| A1 | `snippets/product-card.liquid:88` | The add-to-cart `<script>` is emitted **once per card**, and each copy binds every `.add_to_cart` button on the page. `related-products.liquid` then binds them again. | With N cards on a page, one click sends N+ `/cart/add.js` requests, so the cart gets N items. |
| A2 | `snippets/product-card.liquid:51` | Every card is `<form id="product-form">`, which duplicates the PDP form's ID. | Invalid HTML. `getElementById('product-form')` on the PDP can resolve to the wrong form. |
| A3 | `snippets/product-card.liquid:80` | Quick-add uses `product.variants.first.id`, not the first *available* variant. | Quick-add fails on products whose first variant is sold out. Then it hard-redirects to `/cart` instead of opening the drawer. |
| A4 | `sections/template-product.liquid:551` | `getElementById('price-display')`, but no such element exists. | `TypeError` on every PDP load. Every quantity click throws. |
| A5 | `sections/template-product.liquid:532` | Variant change fetches the section and looks for `#price-{section.id}`, which doesn't exist. | **The price never updates when a variant changes.** |
| A6 | `sections/template-product.liquid:462-466` | `VariantSelector` listens for `change` (never fired by the div pickers) and queries `.custom-select .custom-select2 .option-item` (matches nothing). | Dead code. It only works because the inline scripts call `onVariantChange()` directly. |
| A7 | `sections/template-product.liquid` (option loop) | The `product.variants \| json` script is emitted **once per option**. | Payload is duplicated, which hurts performance on large products. |
| A8 | `sections/template-product.liquid` (color branch) | Swatches use the option *value* as a CSS color (`background-color: {{ value }}`). | "Rose Gold", "Champagne", etc. render as transparent. Must use `swatch.color` / `swatch.image`. |
| A9 | `sections/template-product.liquid:447` | Calls `new Drift(...)`, but the Drift library is never loaded. | Inert, but it's leftover code. |
| A10 | `layout/theme.liquid:54-68` | Cart drawer formats money as hardcoded `en-US` / `USD`. | Wrong currency for every non-USD store and every Markets currency. |
| A11 | `snippets/sidebar-cart.liquid:6` | Drawer is a fixed `w-[500px]` with no backdrop, focus trap, Escape key or scroll lock. | Overflows phones narrower than 500px. Keyboard users get stuck outside it. |
| A12 | `sections/navbar.liquid:154` | `</nav>` sits inside the `{% for %}` / `{% if link.links %}` branch. | Mobile nav DOM breaks as soon as a menu has nested links. (Theme Check error.) |
| A13 | `sections/navbar.liquid` | `link.active` is used outside the loop on Search/Account/Cart links, and "English($)" links to `/`. | No active state. A fake language selector. |
| A14 | `sections/navbar.liquid` (mobile) | The mobile search `<input>` has no form, no name and no handler. | Typing + Enter does nothing. |
| A15 | `snippets/search-result.liquid:41` | References `product` (undefined in this scope) and assumes every result is a product. | No "NEW IN" logic. Articles and pages in results render blank prices. |
| A16 | `snippets/filter.liquid:63+` | Checkboxes are `class="hidden"`, and the checkmark `<svg>` uses `peer-checked:` but isn't a sibling of the peer. | Filters can't be reached by keyboard, and the checkmark never appears. |
| A17 | `sections/template-categories.liquid` | Uses `document.querySelector('swiper-container')` (the first one on the page) and a global `prevButton`/`nextButton`. | Adding a second carousel section, or reordering sections, binds the wrong slider. Declaring top-level `const` twice in the editor throws. |
| A18 | `templates/customers/addresses.liquid` | Self-closing `<select />`, with no country/province data and no submit button. | Customers can't add addresses. |
| A19 | `templates/gift_card.liquid` | No `<html>` open tag, no code displayed, no shop name. | Invalid HTML and an unusable gift card page. |
| A20 | `templates/article.liquid` | Prints `created_at`. `comment` is undefined. There's no success message after posting. | Wrong date, and a broken comment flow. |
| A21 | Pagination | Collections paginate by **3** and collection list by 3. These are dev values. | |

## B. Fragile patterns to replace

1. **Background-image media everywhere.** Product, collection, blog, hero and newsletter images are CSS `background-image` with `img_url: 'master'`. That means no alt text, no `srcset`, no lazy loading, no focal points, no aspect-ratio control, and full-resolution downloads. Replace with an `image` snippet built on `image_url` + `image_tag` (widths, sizes, lazy/eager, focal point).
2. **Hardcoded content and resources.** Collections (`featured`, `weekly-picks`, `summer-collection`), `blogs.news`, theme files (`hero_img.png`, `vogue.png`, …), every heading and button label, the announcement bar, and the "Language/Currency" text. None of it is editable. On a fresh install it renders empty or broken.
3. **No translation layer.** Every storefront string is hardcoded English. Only `general.404` is in `locales/`.
4. **Inline `<script>` per section, global names, `DOMContentLoaded`.** Scripts run once per render and break on re-render in the theme editor (`shopify:section:load`). Move to `assets/*.js` custom elements that initialize in `connectedCallback`.
5. **Three runtime libraries from public CDNs.** Alpine `3.x.x` (floating version), Swiper 7 (product page) and Swiper 11 (home page). That's two Swiper versions on one site. The CSS reads `@import`ed fonts from `fonts.cdnfonts.com`, which is render-blocking and a third-party font host.
6. **Lost build pipeline.** `package.json` is **gitignored**, so the Tailwind build can't be reproduced from this repo. `application.css` (36 KB) is a committed build artifact with no recorded command, and `tailwind.config.js` has no tokens.
7. **Arbitrary-value Tailwind as a design system.** Hex codes (`text-[#6B7280]`, `bg-[#000]`), magic sizes (`text-[100px]`, `h-[90vh]`) and `[&>div>div]:mb-0` selectors are scattered inline. None of it can respond to theme settings (colors, fonts) without CSS variables.
8. **Duplicated components.** `collection.liquid` and `collection-card.liquid` share about 80% of their code and re-emit the same `{% style %}` per render. `product-card` and `search-result` are near-copies. Two arrow-button implementations and two pickers (`custom-select` and `custom-select2`) do the same thing.
9. **Non-semantic interactive elements.** `<div role="button">`, clickable `<li>` and `<p>` used as close buttons. `outline-none` is used without a focus replacement. `<h1>` is used for the logo, footer column titles and newsletter heading (several h1s per page).
10. **Dead or orphaned files** (Theme Check): `blogpost.liquid` (empty), `homepage-text.liquid` ("Thank you for taking the course…"), `heart.liquid`, `cart.liquid` icon (orphaned), `hamburger.liquid`, `button-wishlist.liquid`, `assets/weeklyhow-logo.png` (43 KB, tutorial leftover), the empty `assets/application.js`, and `templates/collection.list.liquid`.

## C. Theme Store blockers that need decisions

| Blocker | Why | Proposed resolution |
|---|---|---|
| **Wishlist** | Explicitly named as a prohibited app-like feature (§8). | Remove the nav links and the snippet. Wishlist is a merchant app concern. |
| **Judge.me** | Themes can't depend on apps. | Remove the hardcoded badge. Ship `@app` blocks so merchants place any review app themselves. Delete the block from `settings_data.json`. |
| **Fonts** | Custom fonts aren't accepted (§15), and Calvino Grande *Trial* isn't licensed for commercial use. | Pick the closest Shopify font-library faces via `font_picker`. See `design-language.md`. |
| **Theme name** | "Master" is already on the Theme Store, and the name must be distinct. | Choose a new 1–2 word name before demo-store and docs work starts. |
| **Tailwind + Alpine** | Not prohibited, but they work against settings-driven theming, the missing build pipeline, Lighthouse, and merchant code-editability. | **Recommendation:** vanilla CSS on design tokens (CSS custom properties fed by settings) + small vanilla custom elements in `assets/`. See `AGENTS.md`. |

## D. File inventory and disposition

| File | Disposition |
|---|---|
| `layout/theme.liquid` | **Rewrite**: lang, meta/SEO/OG snippet, CSS variables from settings, section groups, deferred JS, cart drawer, skip link |
| `layout/password.liquid` | **New** |
| `config/settings_schema.json` | **Rewrite**: theme_info, logo, favicon, color schemes, typography, layout, buttons, cards, cart type, social, search |
| `config/settings_data.json` | **Reset**: remove the app block, add defaults |
| `locales/en.default.json` + `en.default.schema.json` | **Rewrite / new**: all storefront strings and all schema labels |
| `sections/navbar.liquid` | **Rewrite** as `header.liquid` in `header-group.json` (logo, menus with multi-level dropdowns, `<shopify-account>`, predictive search, localization, cart count) |
| `sections/footer.liquid` | **Rewrite** in `footer-group.json`; keep the justified wordmark as the signature move; add blocks (menu, text, newsletter, social), localization and payment icons |
| `sections/template-hero.liquid` | **Rewrite** as `hero` (image/video, focal point, heading, text, button, overlay, height) |
| `sections/template-categories.liquid` | **Rewrite** as `collection-carousel` (collection_list setting, shared carousel element) |
| `sections/template-client.liquid` | **Rewrite** as `logo-list` (+ optional quote/testimonial blocks) |
| `sections/template-selection.liquid` | **Rewrite** as `collection-split` / `editorial-split` (2 collection blocks) |
| `sections/template-arrivals.liquid` | **Rewrite** as `featured-products` (collection setting, carousel/grid) |
| `sections/template-blog.liquid` | **Rewrite** as `blog-posts` (blog setting actually used) |
| `sections/template-newsletter.liquid` | **Rewrite** as `newsletter` (image, heading, text, success/error states, labeled input) |
| `sections/template-product.liquid` | **Rewrite** as `main-product` with blocks + new `featured-product` |
| `sections/related-products.liquid` | **Rewrite** as `product-recommendations` (related + complementary) |
| `sections/template-collection.liquid` | **Rewrite** as `main-collection` (banner + product grid + facets) |
| `sections/template-collections.liquid` | **Rewrite** as `main-list-collections` |
| `sections/template-search.liquid` | **Rewrite** as `main-search` (mixed result types) |
| `templates/*.liquid` (cart, blog, article, page, contact, 404) | **Replace** with JSON templates + `main-*` sections |
| `templates/customers/*.liquid` | **Rewrite** (styled; addresses CRUD with country/province). New customer accounts cover most stores, but classic templates are still required. |
| `templates/gift_card.liquid` | **Rewrite** |
| `snippets/filter.liquid` | **Rewrite** as `facets` (keep the drawer UX; real checkboxes, live counts, active-filter pills) |
| `snippets/pagination.liquid` | **Refactor** (accessible labels, contrast) |
| `snippets/product-card.liquid`, `search-result.liquid` | **Merge** into `card-product` (+ `card-article`, `card-page`) |
| `snippets/collection.liquid`, `collection-card.liquid` | **Merge** into `card-collection` |
| `snippets/sidebar-cart.liquid` | **Rewrite** as `cart-drawer` (section-rendering API, not client-side templating) |
| `snippets/icon-*.liquid`, `user.liquid`, `cart.liquid`, `hamburger.liquid` | **Consolidate** into one `icon` snippet (`{% render 'icon', name: 'cart' %}`) with consistent stroke width |
| `blogpost`, `homepage-text`, `heart`, `button-wishlist`, `weeklyhow-logo.png`, `main.css`, `application.js`, `tailwind.config.js`, `src/` | **Delete** |

## E. What's good and worth keeping

- The **editorial voice**: eyebrow label + oversized display heading, generous whitespace, black/white with one warm accent.
- The **justified wordmark footer**: distinctive and cheap.
- **Off-canvas drawers** for filters and cart. That's the right UX, it just needs proper a11y.
- The facet logic in `filter.liquid` already handles boolean, list and price-range filter types correctly on the Liquid side.
- Product recommendations are already lazy-loaded via the Section Rendering API.

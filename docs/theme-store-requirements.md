# Shopify Theme Store requirements — tracking checklist

Source of truth: <https://shopify.dev/docs/storefronts/themes/store/requirements>
(retrieved 2026-10-12). Submission flow: <https://shopify.dev/docs/storefronts/themes/store/review-process/submit-theme>.
Re-check the source before submitting — Shopify revises this page.

Status key: ✅ met · ⚠️ partial / needs work · ❌ missing or failing · 👤 owner action (not code)

The reviewers grade in **five stages**, and a theme must clear every item in a stage before it moves on:

1. Features + Online Store 2.0 compatibility (§4, §5)
2. Lighthouse performance + accessibility (§6)
3. Technical: pages, consistency, browsers, assets, SEO, a11y, social (§7–§13)
4. Design + UX: settings, font picker, color system, responsive images (§3, §14–§17)
5. Pre-launch: exclusivity, naming, demo stores, docs, support (§1, §18–§22)

---

## 1. Exclusivity
- [ ] 👤 Distributed only on the Theme Store (no other marketplaces).
- [x] ✅ No designer credits or affiliate links in theme files. `theme_info` now reads Vermeil / Tochukwu Onwunali. Keep it free of marketing links.

## 2. Uniqueness
- [ ] ⚠️ Fundamentally different from every Theme Store theme. Identity must come from **architecture**: header/nav system, product card, media treatment, page structure — not colors/fonts/spacing. Owner judgment before submission; the distinctive systems are listed below.
- [x] ✅ Not derived from Dawn or Horizon. **Note:** Shopify's Skeleton theme is the only approved base; otherwise code must be 100% original. As of 2026-10 Skeleton has moved to a sections-less `{% block %}` architecture that conflicts with the JSON-template rules in §5, so we write **original OS 2.0 code** rather than rebase. Every template, section and snippet was rewritten from scratch in Phases 1–5; no Themekit boilerplate remains.
- [x] ✅ Distinctive systems, each a shared primitive: eyebrow + display `section-heading`, the fitted full-width wordmark footer, full-bleed `editorial-split`, drawer-first commerce on native `<dialog>` with text "Close" controls, the caption-row product card with inline quick add, the featured-first editorial blog grid.

## 3. Design and UX
- [x] ✅ Distinct design for a specific merchant type: **jewelry and fine accessories** (confirmed; demo store `vermeil-6sitmu3d`).
- [x] ✅ High-quality, correctly sized imagery: every image goes through `snippets/image.liquid` (`image_url` + `image_tag`, `srcset`, `sizes`, focal point, lazy below the fold).
- [x] ✅ Cohesive palette from four color schemes (black, white, warm neutral, terracotta accent); controls use `accent-color` from the scheme.
- [x] ✅ Logical grid + consistent spacing: `.page-width` with the page-width setting, `.layout-grid` with the grid-spacing setting, section padding settings on every section.
- [x] ✅ Layout stays balanced with varying content and image counts: aspect-ratio media with image ratio settings, height presets that grow with content, text panels for image-less articles, placeholders for empty pickers.
- [x] ✅ Limited, paired fonts: Gloock (headings) + Figtree (body) from the Shopify font library.
- [x] ✅ Consistent buttons, links, forms: primary, secondary (fill-up hover) and tertiary buttons; one field, input, select and textarea system in `base.css`.
- [x] ✅ Merchant-friendly theme editor: every section has settings, presets and translated labels; copy reviewed (6c); live preview handled (6b).
- [x] ✅ Clear path home → discovery → PDP → cart → checkout (Phases 2–4, store-tested).
- [ ] ⚠️ 👤 Demo store with real, industry-fitting content. `vermeil-6sitmu3d` has original copy and stock imagery (Pexels); licensed imagery and final copy are Phase 7.

## 4. Required features
| Feature | Status | Notes |
|---|---|---|
| Sections Everywhere (OS 2.0) | ✅ | Every template is JSON except `gift_card.liquid` (which Shopify requires as Liquid; it renders a section) |
| Discounts (line + order level) in cart | ✅ | Line allocations + cart-level applications in drawer and cart page (Phase 2) |
| Accelerated checkout buttons (product + cart) | ✅ | Product (`payment_button`, on by default, styled to the theme) and cart (`content_for_additional_checkout_buttons`) |
| Faceted filtering (availability, price, type, vendor, options) on collection + search | ✅ | Collection (4a) and search (4b): native `<dialog>` drawer, real checkboxes, swatch and image presentations, price range, pills, Section Rendering updates with history, no-JS GET form |
| Gift card template | ✅ | Phase 5c: logo or shop name, code with copy, balance, initial value, expiry and inactive states, sender message, QR code (Shopify-hosted `qrcode.js`), Apple Wallet, print styles |
| Image focal points | ✅ | `image_tag` (used by the `image` snippet) applies the focal point as `object-position` automatically |
| Social sharing image (`page_image`) | ✅ | `meta-tags` snippet: Open Graph + Twitter card with `page_image` |
| Country/currency selector | ✅ | `localization-form` in header (desktop), menu drawer and footer |
| Language selector | ✅ | Same component; renders only when more than one option exists |
| Multi-level menus | ✅ | Desktop dropdown or mega menu (3 levels); mobile drawer with nested accordions |
| Newsletter form | ✅ | `newsletter-form` snippet (footer block, password page) |
| Pickup availability | ⚠️ | Product block built on `store_availabilities`; renders nothing on the dev store (backlog B1) |
| Related product recommendations | ✅ | `product-recommendations` section (Phase 3) |
| Complementary product recommendations | ✅ | Product block, `intent=complementary` (Phase 3) |
| Rich product media (3D, video, YouTube/Vimeo) | ✅ | Gallery with images, hosted video (theme player), external video, 3D + AR (Phase 3) |
| Search + **predictive search** | ✅ | Predictive search (Phase 2), `main-search` (Phase 4b), also on the 404 page |
| Selling plans in cart | ✅ | Selling plan name per line item |
| Shop Pay Installments banner on PDP | ✅ | `form \| payment_terms` in `product-price` |
| Unit pricing (collection, product, cart) | ✅ | Cards, product price, cart |
| Variant images | ✅ | Gallery jumps to `variant.featured_media` on selection (Phase 3) |
| Follow on Shop (`login_button`) | ✅ | Footer, behind `shop.features.follow_on_shop?` |
| `<shopify-account>` component in header (desktop + mobile) | ✅ | Themed via its CSS custom properties; menu setting defaults to `customer-account-main-menu` |

## 5. Templates, sections, blocks
Required templates (✅ exists as JSON · ❌):
- [x] ✅ `layout/theme.liquid` (rewritten)
- [x] ✅ `404.json`
- [x] ✅ `article.json`
- [x] ✅ `blog.json`
- [x] ✅ `cart.json`
- [x] ✅ `collection.json`
- [x] ✅ `index.json`
- [x] ✅ `list-collections.json`
- [x] ✅ `page.json`
- [x] ✅ `page.contact.json`
- [x] ✅ `password.json` + `layout/password.liquid`
- [x] ✅ `product.json`
- [x] ✅ `search.json`
- [x] ✅ `gift_card.liquid` (renders the `main-gift-card` section)
- [x] ✅ `config/settings_schema.json` (logo, colors, typography, layout, buttons, cards, animations, cart, search, currency, social), `settings_data.json` (one preset, "Vermeil"; no app blocks)
- [x] ✅ Custom Liquid **section** available on all templates (`custom-liquid`, no template restrictions)
- [x] ✅ Header + footer in **section groups** (announcement bar + header; footer)
- [x] ✅ Main product section built from **blocks** (title, price, vendor, description, variant picker, quantity, buy buttons, pickup, installments, collapsible tabs, share, complementary, custom Liquid, apps)
- [x] ✅ `@app` blocks in main product + featured product sections (featured product added in Phase 6a), plus hero, rich text, image with text, article and footer
- [x] ✅ Custom Liquid **blocks** wherever app blocks make sense (shared `custom-liquid` theme block in content sections; main product; article)
- [x] ✅ No `config/markets.json`

## 6. Lighthouse (benchmark dataset, sections must contain real content)
- [x] ✅ Performance ≥ **60** average across home, product, collection — desktop **and** mobile. Phase 4 measurement: mobile 84, desktop 91. Re-check on the demo store before submission.
- [x] ✅ Accessibility ≥ **90** average across the same pages. Phase 4 measurement: 95 mobile and desktop.

## 7. Pages
**Layout**
- [x] ✅ `<html lang="{{ request.locale.iso_code }}" dir="…">` (`text-direction` snippet; layout CSS uses logical properties, so right-to-left languages mirror)
- [x] ✅ `routes.*` or resource `.url` for all URLs (no hardcoded paths in Liquid or JS; verified by grep in Phase 6a).
- [x] ✅ `content_for_header` not modified.
- [x] ✅ Payment icons via `enabled_payment_types` + `payment_type_svg_tag` (footer).

**Product** — title (untruncated), `variant.price`, `unit_price`, compare-at, description, option names/values; all images viewable with mixed ratios; variant image on select; `cart.taxes_included`; separate option selectors; quantity; ATC disabled when sold out; JS callback updating price/compare/sold-out; first available variant loaded; recommendations; rich media; accelerated checkout (on by default); pickup availability; installments; gift-card recipient form (`form.email`, `form.name`, `form.message`, `gift_card.send_on`); swatches via `swatch.color` / `swatch.image`.
- Status: ✅ Phase 3 `main-product` (all of the above; variant changes re-render price, media, picker and buttons through Section Rendering; swatches from `swatch.color` / `swatch.image`).

**Collection** — title, description, image; grid with title→url, price, image, unit price; mixed ratios OK; sale badge; sorting; empty message; `price_varies` range; pagination.
- Status: ✅ Phase 4a: `collection-banner` (title, description, image beside or behind text) + `main-collection` (cards with unit price, sale/sold-out badges, `price_varies` "From", sorting, products per page, pagination, empty and filtered-empty states).

**Collection list** — title, `collection.featured_image` fallback, pagination. Status: ✅ Phase 4b `main-list-collections` (`card-collection` with `featured_image`, placeholder fallback, pagination).

**Cart** — line title, `unit_price`, image, `final_price`, quantity, `options_with_values`; `total_price`; taxes note; checkout button submits form; totals refresh on qty change; per-line qty; empty state; cart notes; selling plans; automatic discounts; accelerated checkout.
- Status: ✅ Phase 2: `main-cart` + `cart-drawer` sharing `cart-items`/`cart-summary`, Section Rendering refresh of every cart surface, no-JS form fallback. Verify on the dev store.

**Page** — title + content; contact alternate template. Status: ✅ Phase 5b `main-page` (width and alignment settings) and a `contact-form` section (name, email, phone, message; posted and error states; addable to any page). Sending the form is an owner check.

**Blog** — `blog.title`; per article: title→url, `article.image`, `article.excerpt_or_content`; pagination. Status: ✅ Phase 5a `main-blog` (article cards with image or a text panel, tag filter, optional featured first post, pagination, empty state).

**Article** — title, `article.comments`, `published_at` (not `created_at`), paginated comments, comment success/error messages. Status: ✅ Phase 5a `main-article` (blocks: title, featured image, content, tags, share, custom Liquid, apps; paginated comments with posted, awaiting-moderation and error messages; previous and next post links; structured data). Posting a comment is an owner check.

**Search** — empty message; products + articles + pages via `object_type`; pagination. Status: ✅ Phase 4b `main-search` (product, article and page cards, filters, sort, empty-query, no-results and filtered-empty states, pagination).

**404** — clear message + next step (search / home link). Status: ✅ Phase 5b `main-404`: message, search with suggestions, link to all products.

**Gift card** — Apple Wallet, code, QR ≥ 120×120, logo or shop name. Status: ✅ Phase 5c.

**Password** — logo/shop name, `shop.password_message`, password form. Status: ✅ Phase 1 (plus email signup).

## 8. Consistency and functionality
- [x] ✅ RTE styles (h1–h6, blockquote, ul, ol) consistent across product/collection/article/page. One `.rte` set in `base.css` (headings, lists and nested lists, blockquote, tables that wrap at 320px, embeds, rules, figure captions); the legacy Tailwind reset that stripped list bullets is gone (Phase 5d).
- [x] ✅ Scripts hosted on Shopify. Alpine is vendored and pinned; Swiper was removed in Phase 4 (see `third-party.md`). The gift card QR code uses Shopify's own `vendor/qrcode.js`.
- [x] ✅ No JS interfering with the editor/admin.
- [x] ✅ Shopify-domain links have `rel="nofollow"` (the only one is `powered_by_link`, verified in rendered HTML).
- [x] ✅ Asset URLs come from `asset_url`, `image_url` and `shopify_asset_url`; the only `https:` prefixes are on Open Graph image URLs, which must be absolute.
- [x] ✅ All third-party assets licensed: fonts from the Shopify font library, Alpine (MIT), social icons from Simple Icons (CC0). See `third-party.md`.
- [x] ✅ No app dependency. Judge.me badge and app embed removed (2026-10-12). `@app` blocks come in Phase 3.
- [x] ✅ No app-like features. Wishlist links and snippet removed (2026-10-12).
- [x] ✅ No fake urgency/stock/viewer counts.

## 9. Browser compatibility
Phase 6e feature audit: every platform feature the theme uses is supported by the oldest browser in the matrix. The newest ones and their minimums: `:has()` (Firefox 121, Safari 15.4), `:dir()` (Chrome 120, Safari 16.4), `color-mix()` (Safari 16.2, Firefox 113), `svh`/`dvh` (Safari 15.4), `<dialog>` + `showModal()` (Safari 15.4), `accent-color` (Safari 15.4), `scrollbar-width` (Safari 18.2, with a `::-webkit-scrollbar` fallback). Optional APIs are feature-checked (`navigator.share` falls back to the clipboard, the clipboard falls back to a select-the-code message). Instagram, Facebook and Pinterest use WKWebView on iOS and Android System WebView, so they share the Safari and Chrome engines above. Chrome was exercised throughout Phases 2–6 in the in-app browser.
- [ ] 👤 Desktop: Safari (last 2), Chrome (last 3), Firefox (last 3), Edge (last 2). Real-browser pass: backlog B11.
- [ ] 👤 Mobile: iOS Safari (last 2), Chrome Mobile (last 3), Samsung Internet (last 2). Real-device pass: backlog B11.
- [ ] 👤 In-app webviews: Instagram, Facebook, Pinterest (open a store link from each app). Backlog B11.

## 10. Assets
- [x] ✅ No Sass.
- [x] ✅ No minified CSS/JS of our own. Tailwind's `application.css` and `legacy-bridge.css` deleted in Phase 5d.

## 11. SEO
- [x] ✅ Title, description and canonical in the `meta-tags` snippet, with page-number and tag suffixes in the title.
- [x] ✅ Structured data: `product | structured_data` on product pages, `article | structured_data` on articles. 👤 Run Google's Rich Results test on the demo store before submission.
- [x] ✅ No `robots.txt.liquid`.

## 12. Accessibility
- [x] ✅ Everything keyboard-operable: native controls throughout. Phase 6d keyboard pass: header dropdown (Enter opens, Tab enters, Escape closes and returns focus), variant swatches by arrow keys (price and URL update, focus kept), drawers and search modal open, trap and close with Escape; carousels without links are focusable scroll regions.
- [x] ✅ Visible focus states: every focusable element on the audited pages shows a ring under keyboard focus (scripted check after a real Tab); the search field's underline thickens to 2px in full contrast (Phase 6d).
- [x] ✅ Alt text on all images: real `<img>` with `image.alt`; decorative card images use `alt=""` next to their linked title (axe `image-alt` clean on every template).
- [x] ✅ Inputs have unique IDs + matching labels (axe `label` and `duplicate-id` rules clean on every template and open drawer, Phase 6d).
- [x] ✅ Valid HTML: 19 rendered pages (every template plus filtered, empty and error states and four product types) pass `html-validate` (standard ruleset) after fixing the font preload `crossorigin` value. The a11y ruleset's remaining notes are deliberate: `role="list"` on unstyled lists (Safari drops list semantics) and the `payment_terms` product form, which has no submit button by design.
- [x] ✅ Contrast 4.5:1 body / 3:1 large + UI: the kit grades every scheme; axe `color-contrast` is clean on every template, including text over media and badges.
- [x] ✅ Focus order = DOM order: no positive `tabindex` anywhere (checked in Phase 6d).
- [x] ✅ Touch targets ≥ 24×24px: axe `target-size` (WCAG 2.2) clean on every template at 375px and desktop; icon buttons are 44×44.
- [x] ✅ h1–h6 visually distinct: `.h0`–`.h6` scale in `base.css`, settings for heading scale and case.

## 13. Social media
- [x] ✅ Social icon set selectable in settings (9 platforms, CC0 brand paths).
- [x] ✅ Open Graph + Twitter card tags (`meta-tags`).
- [x] ✅ Social placeholder fields default to empty.

## 14. Settings
- [x] ✅ Sentence-case names; no "&"; American English; verbs on buttons; terminology list ("home page", "slideshow", "signup", "cart type", "show"/"enable"/"use"…). All 763 schema strings reviewed in Phase 6c; `npm run check` now fails on untranslated or missing labels, British spellings and "&".
- [x] ✅ Defaults demonstrate the setting: no lorem ipsum (checked by `npm run check`), no demo content; guidance copy instead of claims a merchant might ship unchanged (Phase 6c).
- [x] ✅ Favicon setting.
- [x] ✅ Logo upload with width setting (header, password page).
- [x] ✅ Every setting has a translated `t:` label that resolves in `en.default.schema.json` (checked by `npm run check`).
- [x] ✅ `link_list` defaults: header `main-menu`, footer menu block `footer`, account menu `customer-account-main-menu`.
- [x] ✅ Resource defaults exist in every store: no handle lookups in Liquid (verified by grep); templates reference only the `all` collection and the `news` blog.
- [x] ✅ Editor live preview works for every change: Alpine re-initializes re-rendered sections and cleans up in `destroy()`; selected slides, quotes and announcements are shown; autoplay pauses while edited; only the cart drawer opens on selection (Phase 6b). 👤 Real-editor walkthrough: backlog B10.
- [ ] ⚠️ `theme_info` updated (Vermeil 0.1.0). Documentation + support URLs temporarily point at the GitHub repo; swap in the real docs site + support form before submission.

## 15. Font picker
- [x] ✅ All fonts via `font_picker` (defaults `gloock_n4`, `figtree_n4`), with bold, italic and bold-italic via `font_modify` + `font_face`.
- [x] ✅ No custom fonts. Calvino Grande Trial and General Sans were replaced by Gloock and Figtree (Phase 1).

## 16. Color system
- [x] ✅ `color_scheme_group` with background, gradient, text, accent, button, button label and secondary button label; four schemes; every section has a scheme setting.

## 17. Responsive images
- [x] ✅ `image_url` + `image_tag` with `widths`/`sizes`, `loading="lazy"` below the fold, eager + `fetchpriority="high"` for the first image (`image` and `picture` snippets).

## 18. Naming and presets
- [x] ✅ 1–2 words, < 30 chars, unique, not an industry word. **Theme name: "Vermeil"** (gilded silver), chosen 2026-10-12. No Theme Store listing by that name. "Atelier" was preferred but is taken.
- [x] One preset, "Vermeil", carries the theme's name. No extra presets.
- [ ] 👤 Install parity: a fresh install should look like the demo store (minus images). Feature branches ship generic template defaults with placeholders; check by installing on a fresh development store (Phase 7).

## 19. Versions
- [ ] Version number + release notes on every submission (`theme_info.theme_version`, a `CHANGELOG.md`).

## 20. Demo stores 👤
- [ ] One client-transfer demo store per preset (Dev Dashboard), matching industry + catalog size.
- [ ] Bogus Gateway or Shopify Payments test mode; other checkout options off.
- [ ] Authentic text, licensed imagery (Shopify Burst suggested), no text baked into images, no apps (except free reviews/translation).
- [ ] Recommended: a sale product, a sold-out variant, a multi-variant product, a gift card.

## 21. Documentation + support form 👤
- [ ] Public docs (FAQ, support policy, settings consistent with theme, code-edit warning).
- [ ] Support form: first + last name, email, store URL (with example), problem textarea, file upload, auto-responder; no budget/phone questions.

## 22. Ongoing support 👤
- [ ] Reply within 2 business days; fix critical bugs immediately. Shopify notes this is typically a full-time commitment.

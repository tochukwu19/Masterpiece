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
- [ ] ⚠️ Fundamentally different from every Theme Store theme. Identity must come from **architecture**: header/nav system, product card, media treatment, page structure — not colors/fonts/spacing.
- [ ] ✅ Not derived from Dawn or Horizon. **Note:** Shopify's Skeleton theme is the only approved base; otherwise code must be 100% original. As of 2026-10 Skeleton has moved to a sections-less `{% block %}` architecture that conflicts with the JSON-template rules in §5, so we write **original OS 2.0 code** rather than rebase. The current customer/cart/blog templates are Themekit boilerplate and get rewritten anyway.
- [ ] ⚠️ Our distinctive moves today: oversized display headings with eyebrow labels, justified full-width wordmark footer, full-bleed editorial split collections, off-canvas drawers with text "Close" controls. These need to become first-class systems (see `design-language.md`).

## 3. Design and UX
- [ ] ⚠️ Distinct design for a specific merchant type — current direction is **jewelry / fine accessories** (to confirm).
- [ ] ❌ High-quality, correctly sized imagery — images are CSS backgrounds from `img_url: 'master'` (full-size, no `srcset`).
- [ ] ⚠️ Cohesive palette — mostly black/white/gray plus one terracotta accent; indigo leaks into filter checkboxes.
- [ ] ⚠️ Logical grid + consistent spacing — widths vary (`w-[95%]`, `w-[90%]`, `w-[96%]`), ad-hoc margins.
- [ ] ❌ Layout stays balanced with varying content/image counts — fixed heights (`h-[300px]`, `h-[400px]`, `h-[90vh]`) crop or break.
- [ ] ⚠️ Limited, paired fonts — yes (2), but they're custom fonts (fails §15).
- [ ] ❌ Consistent buttons, links, forms — at least 6 button variants, unstyled forms on most templates.
- [ ] ❌ Merchant-friendly theme editor — most sections have no schema settings.
- [ ] ⚠️ Clear path home → discovery → PDP → cart → checkout. Cart page and drawer exist but are incomplete.
- [ ] ❌ 👤 Demo store with real, industry-fitting content. Currently Lorem ipsum everywhere and copy lifted from a real brand (Les Néréides) — must go.

## 4. Required features
| Feature | Status | Notes |
|---|---|---|
| Sections Everywhere (OS 2.0) | ⚠️ | Only index/product/collection/list-collections/search are JSON |
| Discounts (line + order level) in cart | ✅ | Line allocations + cart-level applications in drawer and cart page (Phase 2) |
| Accelerated checkout buttons (product + cart) | ⚠️ | Cart page done (`content_for_additional_checkout_buttons`, on by default). Product page in Phase 3 |
| Faceted filtering (availability, price, type, vendor, options) on collection + search | ⚠️ | Collection done (Phase 4a): native `<dialog>` drawer, real checkboxes, swatch and image presentations, price range, pills, Section Rendering updates with history, no-JS GET form. Search in 4b |
| Gift card template | ⚠️ | Barebones; no code shown, no logo/shop name, invalid HTML |
| Image focal points | ❌ | Use `image.presentation.focal_point` / `image_tag` |
| Social sharing image (`page_image`) | ❌ | No OG tags |
| Country/currency selector | ✅ | `localization-form` in header (desktop), menu drawer and footer |
| Language selector | ✅ | Same component; renders only when more than one option exists |
| Multi-level menus | ✅ | Desktop dropdown or mega menu (3 levels); mobile drawer with nested accordions |
| Newsletter form | ✅ | `newsletter-form` snippet (footer block, password page) |
| Pickup availability | ❌ | |
| Related product recommendations | ✅ | Works, but duplicate add-to-cart listeners (see audit) |
| Complementary product recommendations | ❌ | |
| Rich product media (3D, video, YouTube/Vimeo) | ❌ | Media rendered as background images only |
| Search + **predictive search** | ⚠️ | Predictive search modal done (Phase 2). Search results page rewrite in Phase 4 |
| Selling plans in cart | ✅ | Selling plan name per line item |
| Shop Pay Installments banner on PDP | ❌ | `form \| payment_terms` |
| Unit pricing (collection, product, cart) | ⚠️ | Cards + cart done. Product page in Phase 3 |
| Variant images | ❌ | |
| Follow on Shop (`login_button`) | ✅ | Footer, behind `shop.features.follow_on_shop?` |
| `<shopify-account>` component in header (desktop + mobile) | ✅ | Themed via its CSS custom properties; menu setting defaults to `customer-account-main-menu` |

## 5. Templates, sections, blocks
Required templates (✅ exists as JSON · ❌):
- [x] `layout/theme.liquid` (needs rewrite)
- [ ] ❌ `404.json` (currently `.liquid`)
- [ ] ❌ `article.json`
- [ ] ❌ `blog.json`
- [x] ✅ `cart.json`
- [x] ✅ `collection.json`
- [x] ✅ `index.json`
- [x] ✅ `list-collections.json`
- [ ] ❌ `page.json`
- [ ] ❌ `page.contact.json`
- [x] ✅ `password.json` + `layout/password.liquid`
- [x] ✅ `product.json`
- [x] ✅ `search.json`
- [x] ⚠️ `gift_card.liquid` (exists, invalid)
- [x] ⚠️ `config/settings_schema.json` (only `theme_info`), `settings_data.json` (contains a Judge.me app block)
- [ ] ❌ Custom Liquid **section** available on all templates
- [x] ✅ Header + footer in **section groups** (announcement bar + header; footer)
- [ ] ❌ Main product section built from **blocks** (title, price, vendor, description, variant picker, buy buttons, …)
- [ ] ❌ `@app` blocks in main product + featured product sections
- [ ] ❌ Custom Liquid **blocks** wherever app blocks make sense
- [x] ✅ No `config/markets.json`

## 6. Lighthouse (benchmark dataset, sections must contain real content)
- [ ] ❌ Performance ≥ **60** average across home, product, collection — desktop **and** mobile. Risks: 3 CDN script libs, 2 Swiper versions, remote fonts via `@import`, full-size background images.
- [ ] ❌ Accessibility ≥ **90** average across the same pages.

## 7. Pages
**Layout**
- [x] ✅ `<html lang="{{ request.locale.iso_code }}">`
- [ ] ⚠️ `routes.*` for all URLs — hardcoded `/search`, `/cart`, `/cart/change`, `/pages/wishlist`, `/`.
- [x] ✅ `content_for_header` not modified.
- [x] ✅ Payment icons via `enabled_payment_types` + `payment_type_svg_tag` (footer).

**Product** — title (untruncated), `variant.price`, `unit_price`, compare-at, description, option names/values; all images viewable with mixed ratios; variant image on select; `cart.taxes_included`; separate option selectors; quantity; ATC disabled when sold out; JS callback updating price/compare/sold-out; first available variant loaded; recommendations; rich media; accelerated checkout (on by default); pickup availability; installments; gift-card recipient form (`form.email`, `form.name`, `form.message`, `gift_card.send_on`); swatches via `swatch.color` / `swatch.image`.
- Status: ❌ most of these. Price never updates on variant change; swatches use option value as a CSS color.

**Collection** — title, description, image; grid with title→url, price, image, unit price; mixed ratios OK; sale badge; sorting; empty message; `price_varies` range; pagination.
- Status: ✅ Phase 4a: `collection-banner` (title, description, image beside or behind text) + `main-collection` (cards with unit price, sale/sold-out badges, `price_varies` "From", sorting, products per page, pagination, empty and filtered-empty states).

**Collection list** — title, `collection.featured_image` fallback, pagination. Status: ⚠️ uses `img_url` backgrounds; hardcoded description copy.

**Cart** — line title, `unit_price`, image, `final_price`, quantity, `options_with_values`; `total_price`; taxes note; checkout button submits form; totals refresh on qty change; per-line qty; empty state; cart notes; selling plans; automatic discounts; accelerated checkout.
- Status: ✅ Phase 2: `main-cart` + `cart-drawer` sharing `cart-items`/`cart-summary`, Section Rendering refresh of every cart surface, no-JS form fallback. Verify on the dev store.

**Page** — title + content; contact alternate template. Status: ⚠️ unstyled.

**Blog** — `blog.title`; per article: title→url, `article.image`, `article.excerpt_or_content`; pagination. Status: ❌ uses `excerpt`/`content`, no image.

**Article** — title, `article.comments`, `published_at` (not `created_at`), paginated comments, comment success/error messages. Status: ❌ uses `created_at`; unstyled.

**Search** — empty message; products + articles + pages via `object_type`; pagination. Status: ⚠️ products-only card breaks on articles/pages.

**404** — clear message + next step (search / home link). Status: ⚠️ message only.

**Gift card** — Apple Wallet, code, QR ≥ 120×120, logo or shop name. Status: ⚠️ QR + wallet only.

**Password** — logo/shop name, `shop.password_message`, password form. Status: ✅ Phase 1 (plus email signup).

## 8. Consistency and functionality
- [ ] ❌ RTE styles (h1–h6, blockquote, ul, ol) consistent across product/collection/article/page.
- [ ] ⚠️ Scripts hosted on Shopify (except approved third-party libs). Alpine is now vendored and pinned (3.17.4). Swiper 7 + 11 are still on unpkg/jsdelivr until the carousel and product rewrites (see `third-party.md`).
- [x] ✅ No JS interfering with the editor/admin.
- [ ] ⚠️ Shopify-domain links need `rel="nofollow"`.
- [ ] ⚠️ Protocol-relative / CDN asset URLs (no hardcoded `https://` to assets).
- [ ] ❌ All third-party assets licensed — **Calvino Grande *Trial*** is a trial-licensed font.
- [x] ✅ No app dependency. Judge.me badge and app embed removed (2026-10-12). `@app` blocks come in Phase 3.
- [x] ✅ No app-like features. Wishlist links and snippet removed (2026-10-12).
- [x] ✅ No fake urgency/stock/viewer counts.

## 9. Browser compatibility
- [ ] Desktop: Safari (last 2), Chrome (last 3), Firefox (last 3), Edge (last 2).
- [ ] Mobile: iOS Safari (last 2), Chrome Mobile (last 3), Samsung Internet (last 2).
- [ ] In-app webviews: Instagram, Facebook, Pinterest. Known break today: cart drawer is a fixed 500px wide and overflows phones.

## 10. Assets
- [x] ✅ No Sass.
- [x] ✅ No minified CSS/JS of our own (Tailwind output is unminified — keep it that way if we keep Tailwind).

## 11. SEO
- [ ] ⚠️ Title/description/canonical exist in layout; move to a meta snippet, add page-number and tag suffixes to the title.
- [ ] ❌ Product structured data (`{{ product | structured_data }}`), verified with Google Rich Results test.
- [x] ✅ No `robots.txt.liquid`.

## 12. Accessibility
- [ ] ❌ Everything keyboard-operable incl. dropdowns — variant pickers are `<div role="button">` / `<li>` with click handlers; accordions are divs; filter checkboxes are `display:none`.
- [ ] ❌ Visible focus states — `outline-none` used throughout with no replacement.
- [ ] ❌ Alt text on all images — product/collection/blog images are CSS backgrounds (no alt possible); client logos have no alt.
- [ ] ❌ Inputs have unique IDs + matching labels — newsletter, mobile search, quantity, customer forms.
- [ ] ❌ Valid HTML — 3 parser errors (navbar, addresses, gift_card), `<li>` inside `<a>`, duplicate `id="product-form"`, multiple `<h1>` per page.
- [ ] ⚠️ Contrast 4.5:1 body / 3:1 large + UI — `#9CA3AF` on white (2.5:1) used for pagination numbers and arrows fails.
- [ ] ⚠️ Focus order = DOM order.
- [ ] ⚠️ Touch targets ≥ 24×24px — quantity +/- icons in the drawer are 12.8px.
- [ ] ❌ h1–h6 visually distinct — no heading scale.

## 13. Social media
- [x] ✅ Social icon set selectable in settings (9 platforms, CC0 brand paths).
- [x] ✅ Open Graph + Twitter card tags (`meta-tags`).
- [x] ✅ Social placeholder fields default to empty.

## 14. Settings
- [ ] ❌ Sentence-case names; no "&"; American English; verbs on buttons; terminology list ("home page", "slideshow", "signup", "cart type", "show"/"enable"/"use"…). Current names to fix: "Material Template" (×2, meaningless), "Advice & Care Section Title", "Product Page Details".
- [ ] ❌ Defaults demonstrate the setting — no Lorem ipsum, no demo content.
- [x] ✅ Favicon setting.
- [x] ✅ Logo upload with width setting (header, password page).
- [ ] ❌ Every setting has a `label` (and translated `t:` labels — add `locales/en.default.schema.json`).
- [ ] ⚠️ `link_list` header default `main-menu` ✅ / footer must default `footer` (footer has no setting; reads `linklists['footer']` directly).
- [ ] ❌ Resource defaults must exist in every store — remove `collections['featured']`, `['weekly-picks']`, `['summer-collection']`, `blogs.news`, hardcoded `file_img_url` images.
- [ ] ❌ Editor live preview works for every change (`request.design_mode`; re-init JS on `shopify:section:load`).
- [ ] ⚠️ `theme_info` updated (Vermeil 0.1.0). Documentation + support URLs temporarily point at the GitHub repo; swap in the real docs site + support form before submission.

## 15. Font picker
- [ ] ❌ All fonts via `font_picker`, with a loading default (e.g. `work_sans_n6`) and bold/italic/bold-italic via `font_modify`.
- [ ] ❌ **Custom fonts not accepted.** Calvino Grande Trial and General Sans (from fonts.cdnfonts.com) must be replaced by Shopify font-library faces. **Open: the owner prefers to keep them; unresolved.**

## 16. Color system
- [ ] ❌ ≥ 4 `color` settings; every background color paired with a foreground color. (Recommendation: Shopify `color_scheme_group` with ≥ 4 schemes.)

## 17. Responsive images
- [ ] ❌ `image_url` + `image_tag` with `widths`/`sizes`, `loading="lazy"` below the fold, eager + `fetchpriority="high"` for the LCP image.

## 18. Naming and presets
- [x] ✅ 1–2 words, < 30 chars, unique, not an industry word. **Theme name: "Vermeil"** (gilded silver), chosen 2026-10-12. No Theme Store listing by that name. "Atelier" was preferred but is taken.
- [ ] One preset must carry the theme's name. Extra presets need their own templates in `/listings/<preset>/`.
- [ ] Install parity: a fresh install should look like the demo store (minus images).

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

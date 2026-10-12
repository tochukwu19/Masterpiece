# Third-party code

Every library shipped in `assets/` must be pinned in `package.json`, vendored with `npm run vendor`,
and listed here with its license (Theme Store §8: properly licensed, hosted on Shopify).

| Library | Version | File | License | Source |
|---|---|---|---|---|
| Alpine.js | 3.17.4 | `assets/alpine.min.js` (from `alpinejs/dist/cdn.min.js`) | MIT | https://github.com/alpinejs/alpine |

## Legacy, still loaded from public CDNs (to remove)

| Library | Where | Removed in |
|---|---|---|
| Swiper 11 (`cdn.jsdelivr.net`) | `sections/template-categories.liquid` | Phase 4 (carousel rewrite) |
| Swiper 7 (`unpkg.com`) | `sections/template-product.liquid` | Phase 3 (product rewrite) |
| Calvino Grande Trial + General Sans (`fonts.cdnfonts.com`) | `assets/main.css` | Phase 1 (typography). See the font decision in `design-language.md` |

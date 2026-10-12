# Backlog

Known issues and deferred work that sit outside the current phase. Each item says what's known and what
would close it.

| # | Item | Status | Notes |
|---|---|---|---|
| B1 | **Pickup availability shows nothing on the dev store** | Open | Block follows Shopify's documented lookup (`variant.store_availabilities \| where: 'pick_up_enabled', true`) and renders nothing through both the product URL and `/variants/{id}` Section Rendering. Store has local pickup enabled on "Shop location" (Canada, address shows country only). Next: confirm the location has a full address and stocked inventory for the test variants; render-test on a second store before touching the theme. |
| B2 | **Featured product section** (moved from Phase 3) | Phase 4 | Needs a confirmed way to re-render variants outside the product template (Section Rendering resolves section IDs against the requested URL's template). Research before building. |
| B3 | `customer-account-main-menu` missing on the dev store | Store setup | `<shopify-account>` falls back to default menu items and logs an error until the menu exists. |
| B4 | CLI `auth-alias` not read from `shopify.theme.toml` | Upstream | CLI 4.9 ignores it. The owner switches the active account with `npx shopify auth login`. Re-check on CLI upgrades. |
| B5 | Lighthouse scripts | Phase 6 | Add `npm run lighthouse` against the dev store once home, collection and product pages are rebuilt. |
| B6 | YouTube/Vimeo product and section videos keep the platform player UI | Decided | Theming them needs each platform's player SDK, which is third-party code. Shopify-hosted video uses the theme's own `videoPlayer` controls. |

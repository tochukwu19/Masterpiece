# Design language

Part 1 records the language **as built** (extracted from the code, 2026-10-12). Part 2 lists
what it is **missing** for a complete, editor-driven Theme Store theme. Part 3 is the proposed
token system that replaces the hardcoded values.

## 1. As built

**Character:** quiet luxury, editorial. Mostly black and white with one warm accent. Big
type does the talking, and there's lots of air. The voice and assets (Vogue/JCK logos,
"Discover glimmer", earring copy) point at **jewelry and fine accessories**.

### Typography
| Role | Current | Notes |
|---|---|---|
| Display (`.calvino`) | Calvino Grande **Trial**, 500–700 | Section headings at 50px mobile / **100px** desktop, collection titles, drawer titles, logo, footer wordmark |
| Body / UI | General Sans 400–600 | Everything else |
| Eyebrow | Body 500, UPPERCASE, 14/16px | Sits above every display heading ("SEE WHAT'S NEW" / **New Arrivals**) |
| Product title | Body 500 UPPERCASE 18px (PDP), 16px (card) | |
| Logo | Display 600 UPPERCASE 24px | `shop.name` only, no image upload |

Signature pattern: **eyebrow + giant display heading, left-aligned**, used on every
home page section. The collection header variant is centered: *Our* in italic display
over the title in display 600.

### Color
| Token (proposed) | Value | Used for |
|---|---|---|
| ink | `#000000` | Primary buttons, announcement bar, text |
| paper | `#FFFFFF` | Backgrounds, inverse text |
| accent | `#CB8161` (terracotta) | Active nav link (only use today) |
| neutral-900 | `#111827` / `#1F2937` / `#343330` | Headings, icons (three near-duplicates) |
| neutral-600 | `#4B5563` / `#6B7280` | Secondary text, prices |
| neutral-400 | `#9CA3AF` | Arrows, dividers (**fails contrast for text**) |
| neutral-200 | `#E5E7EB` / `#F3F4F6` / `#F9FAFB` | Rules, inactive pagination |
| stray | `indigo-600`, `red-500` | Filter checkbox, remove icons (off-system) |

### Shape, space and motion
- **Square corners** (`rounded-sm` ≈ 2px at most). Exceptions: circular nav arrows, circular pagination, circular swatches.
- Page gutters are percentage-based (`w-[95%]`/`w-[90%]`). Sections are separated by big vertical gaps (`mt-32`, `mt-48`).
- Media is **full-bleed or tall**: hero at 90vh, editorial split at 90vh, collection cards at 400px, product cards at 300px.
- Motion: media zoom on hover (`scale(1.1)`, 0.5s), drawers slide in from the right (300ms), accordions animate `max-height`.

### Components that exist
Announcement bar · header (centered logo, text links desktop / icons mobile) · full-bleed hero with centered copy + black button · collection carousel (outlined circular arrows, bottom right) · logo strip + pull quote · two-up editorial collection split with white button · product carousel · blog grid with zoom · newsletter over darkened image with underline input · justified wordmark footer · product card (image, "NEW IN" tag, title, price, + quick add) · PDP (scrolling image column, uppercase title, swatches, dropdown selects, boxed quantity + full-width black ATC, accordions) · filter drawer · cart drawer · pill pagination.

## 2. Gaps to fill

These are the Theme Store expectations plus the interfaces that don't exist yet:

1. **Fonts must come from `font_picker`.** Calvino Grande Trial and General Sans aren't in Shopify's library, and the trial font isn't licensed. Closest library candidates (all confirmed available):
   - Display: **Gloock** (closest to Calvino's high-contrast, wide build), then *Fraunces*, *DM Serif Display*, *Bodoni Moda*, *Gilda Display*.
   - Body: **Figtree** (closest to General Sans), then *Host Grotesk*, *Instrument Sans*, *Manrope*, *Plus Jakarta Sans*.
   - Defaults need bold, italic and bold-italic via `font_modify`. **To decide:** pick the pair by eye on a preview store.
2. **Color schemes.** At least 4 colors with paired background/foreground. Proposed default schemes: *Paper* (white/black), *Ink* (black/white, for announcement, newsletter, footer option), *Stone* (warm off-white `#F5F1EC`/black), *Clay* (accent-tinted). Every section gets a `color_scheme` setting.
3. **A real type scale with distinct h1–h6.** Today there are only "giant" and "small". The 100px display needs a responsive `clamp()` and a settings-driven scale multiplier.
4. **Button system.** Primary (solid ink), secondary (outline), tertiary/link (underline), and icon button (24px minimum target). Each needs hover, focus-visible, disabled and loading states. Today there are six ad-hoc variants.
5. **Form system.** Text inputs (the underline style from the newsletter becomes the house style), select, checkbox, radio, quantity stepper, textarea, error/success messages, labels. Customer, contact, cart note and comment forms are currently unstyled.
6. **Focus ring.** A visible 2px focus ring with offset that works on every scheme. Today `outline-none` removes all focus indication.
7. **Badges.** Sale, sold out, new and custom (product tag or metafield). Square, small, uppercase. This replaces the ad-hoc "NEW IN".
8. **Media treatment.** Aspect-ratio setting (portrait / square / landscape / natural) for cards and galleries, focal points, and a secondary-image-on-hover option. This replaces fixed pixel heights.
9. **Swatches.** Circle swatches from `swatch.color`/`swatch.image`, with selected, disabled and unavailable (struck through) states.
10. **Empty, loading and error states.** Empty cart, empty collection, no search results, 404, filter loading, ATC loading/error (replaces the `alert()`).
11. **RTE typography** for product, collection, page and article content (headings, lists, blockquote, links, tables).
12. **Navigation.** Desktop dropdowns and a mega menu for 3-level menus, a mobile drawer with nested panels, predictive search overlay, localization (country + language) selectors, `<shopify-account>`.
13. **Missing page layouts:** cart page, blog, article (with comments), page, contact, 404, password, gift card, all customer account pages.
14. **Icon set.** One snippet with consistent 1.5px stroke icons plus social icons.

## 3. Proposed tokens

Everything above comes out of settings as CSS custom properties in `snippets/css-variables.liquid`,
so no hex code or font name is hardcoded in components.

```css
:root {
  /* type: from font_picker + scale settings */
  --font-display-family; --font-display-weight; --font-display-style;
  --font-body-family;    --font-body-weight;    --font-body-weight-bold;
  --type-scale: 1;                         /* settings.type_scale / 100 */
  --text-xs: .75rem; --text-sm: .875rem; --text-md: 1rem; --text-lg: 1.125rem;
  --display-sm: clamp(2rem, 4vw, 3rem);
  --display-md: clamp(2.5rem, 6vw, 4.5rem);
  --display-lg: clamp(3.125rem, 8vw, 6.25rem);   /* today's 50px → 100px */
  --eyebrow-tracking: .08em;

  /* space */
  --page-width: 1440px; --page-gutter: clamp(1rem, 2.5vw, 2.5rem);
  --section-gap: clamp(4rem, 10vw, 8rem);
  --space-1: .25rem; --space-2: .5rem; --space-3: .75rem; --space-4: 1rem;
  --space-6: 1.5rem; --space-8: 2rem; --space-12: 3rem; --space-16: 4rem;

  /* shape + motion */
  --radius: 0px;  /* settings: 0 / 2 / 6 */  --radius-pill: 999px;
  --ease-out: cubic-bezier(.2,.7,.2,1); --dur-fast: 150ms; --dur: 300ms; --dur-slow: 500ms;
  --media-zoom: 1.06;   /* softer than today's 1.1 */
}

/* one block per scheme, generated from settings.color_schemes */
.color-scheme-1 { --color-bg; --color-fg; --color-fg-muted; --color-accent;
                  --color-border; --color-button-bg; --color-button-fg; }
```

Motion respects `prefers-reduced-motion`. That means no zoom and no slide, only opacity changes.

## 4. Uniqueness levers

The reviewers judge architecture, not paint. These are the moves to make **structural**:

- **The eyebrow + display-heading header** as a shared `section-heading` used by every section, with alignment and size options.
- **The wordmark footer** (justified `shop.name` or logo, filling the full width).
- **Editorial split and full-bleed media** as the default page rhythm, rather than boxed grids.
- **Drawer-first commerce**: filters, cart and mobile nav share one drawer component with the text "Close" control in display type.
- *To add:* a distinctive product card, for example a caption row under the image with an inline quick-add "+" and hover reveal of a secondary image and swatches. The PDP should be a sticky info column beside a vertical full-height gallery, which today's layout already approximates.

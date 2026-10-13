# Theme Store listing

Copy and selections for the Vermeil 1.0.0 submission (Partner Dashboard → Themes → Submit theme). Field
rules come from Shopify's listing guide (shopify.dev/docs/storefronts/themes/store/review-process/listings),
checked 2026-10-13. Character counts are noted next to each limited field; recount after edits.

## Theme

| Field | Value |
|---|---|
| Theme name | Vermeil (from `theme_name`; can't change after the ZIP upload) |
| Preset | Vermeil (one preset, named after the theme) |
| ZIP | `Vermeil-1.0.0.zip` from `npm run package` |
| Price | $180 (range $100–$500 in $10 steps). See [Price](#price) |
| Documentation | https://doc-vermeil-store.tochukwu.dev/ |
| Contact form | https://doc-vermeil-store.tochukwu.dev/contact/ |
| Demo store | `vermeil-6sitmu3d.myshopify.com`, password-protected; the password goes in the demo store password field |

## Preset: Vermeil

### Tagline (70 characters max)

> Quiet, editorial storefronts for jewelry and fine accessories

61 characters. The tagline can't describe features or lean on words like "stunning".

Alternatives:
- Editorial calm for jewelry and fine accessories (47)
- Room for every piece to be seen up close (40)

### Industry and catalog size

- Industry: **Jewelry and accessories**
- Catalog size: **Some (11-100+)**

### Key highlights (title 30 max, description 140 max, image 1600 x 1200px)

No Shopify name or logo in the images, and no animated GIFs.

**1. Type that sets the tone** (23)

> Large serif headings, square edges and generous space put the work first. Four color schemes and two font pickers make it your own. (137)

Image: the home page hero and the "New arrivals" heading on desktop, cropped to show the scale of the type
against the photography.

Alt text: Vermeil home page with a full-width jewelry photo under a large serif heading.

**2. Every detail, up close** (22)

> Hover zoom, a full-screen gallery, video and 3D models let shoppers study each stone and clasp. Swatches show every metal and finish. (139)

Image: a product page with the gallery in two columns, the zoom active on one image, and the color swatches
visible beside it.

Alt text: Vermeil product page with a zoomed ring photo next to metal color swatches.

**3. From browsing to bag** (20)

> Filters, predictive search, quick add and a slide-out cart keep shoppers moving, with local pickup and installment messages built in. (139)

Image: a collection page with the filter drawer open on the left half and the cart drawer open on the right
half, or the collection grid with the cart drawer open.

Alt text: Vermeil collection page with the filter drawer open and the cart sliding in.

### Screenshots

Home page only. Desktop 1000 x 1248px or 2000 x 2496px; mobile 750 x 1334px. No browser window, added text or
desktop background, and the mobile shot can't repeat the desktop one (start it lower on the page, at the
"New arrivals" carousel, or show the open menu drawer).

| Shot | Alt text |
|---|---|
| Desktop | Vermeil home page on desktop: a full-width jewelry photo with a large serif heading, then a row of new arrivals. |
| Mobile | Vermeil home page on a phone, showing the new arrivals carousel with product photos and prices. |

Adjust the alt text to what each final image shows.

### Metadata description (SEO)

> Vermeil is an editorial theme for jewelry and fine accessories, with large type, close-up product galleries, color swatches, filters and a slide-out cart.

Grammatical sentence, no keyword list.

## Features

Select only what the theme does without extra code. Each tag below is checked against the theme.

| Category | Tag | Where it is |
|---|---|---|
| Image display | Image galleries | Product gallery, stacked or two columns |
| Image display | Image rollover | Product cards show the second image on hover |
| Image display | Image zoom | Hover zoom and full-screen view on product media |
| Image display | Slideshow | Slideshow section |
| Product details | Color swatches | Variant picker swatches from product options |
| Product details | Product tabs | Collapsible row blocks on the product page |
| Product details | Product videos | Hosted, YouTube and Vimeo video in the gallery |
| Product details | Size chart | A collapsible row block can show a page (for example a ring size guide) |
| Conversion optimization | Cross-selling (complete the look) | Complementary products block |
| Conversion optimization | Recommended products | Product recommendations section |
| Promotional content | Blogs | Blog with tag filter and reader comments |
| Promotional content | Press coverage | Logo list and testimonials sections |
| Promotional content | Product badges | Sale and sold-out badges on cards, with their own color schemes and position |
| Promotional content | Promo banners | Announcement bar, hero and slideshow |
| Carts and checkout | Cart notes | Order note in the cart drawer and cart page |
| Carts and checkout | In-store pickups | Pickup availability block |
| Carts and checkout | Quick buy | Quick add on product cards |
| Carts and checkout | Slide-out cart | Cart drawer |
| Navigation and filtering | Enhanced search | Predictive search |
| Navigation and filtering | Mega menu | Header "Desktop menu type: Mega menu" |
| Navigation and filtering | Product filtering and sorting | Filter drawer and sort on collection and search |
| Navigation and filtering | Sticky header | Header "Sticky header" setting |
| Product highlights | Recommended products | Product recommendations section |

Left out on purpose: Quick view (quick add adds straight to the cart, no popup), Sticky cart (the product
info column sticks on desktop only), Product options on collection pages, Customizable contact form (only a
phone field toggle), FAQ page, Animation, Breadcrumbs, Back-to-top button, Infinite scroll, Product reviews,
Stock counter, Recently viewed, and everything else not built.

The demo store's header uses the dropdown menu. If Mega menu stays selected, either switch the demo header
to "Mega menu" or point reviewers to the setting in the testing instructions (below, it's the latter).

## Price

$180, chosen by the owner (2026-10-13) to test the market. Partner themes can't be free: the listing guide
only allows $100 to $500 in $10 steps, so $175 isn't valid. Theme Store prices can't include paid support.
Shopify's docs don't say how to change the price after submission; ask the review team if it's needed.

## Testing instructions

> The demo store is password-protected; the password is in the demo store password field.
>
> Payments use the Bogus Gateway: at checkout, enter 1 as the card number for a successful order.
>
> Where to find the main features:
> - Home page: hero, featured collection carousel, editorial split, collection list, image with text, featured product with variant swatches, testimonials, multicolumn, blog posts and email signup.
> - Collection pages (open any collection from the menu): the Filter button opens the filter drawer; results and sorting update without a reload, and also work with JavaScript off.
> - Product pages: gallery with hover zoom and full-screen view, variant swatches, pickup availability, complementary products, collapsible rows and share.
> - Product cards: second image on hover; the plus button adds single-variant products straight to the cart drawer.
> - Header: predictive search, sticky on scroll up, and the account icon (new customer accounts). The demo uses the dropdown menu; to see the mega menu, open the theme editor and set Header → Desktop menu type to Mega menu.
> - Blog: tag filter, featured first post option, and comments on posts.
> - Right-to-left languages such as Arabic and Hebrew mirror the layout.
>
> No apps are installed and no extra admin setup is needed.

## Theme review notes (not shown to merchants)

> Vermeil is for independent jewelry and fine accessories brands: small studios and designers with a catalog of roughly 20 to 100 pieces, who sell on photography and want their store to feel like a printed lookbook rather than a marketplace.
>
> How it helps them sell: large display type and quiet layouts frame close-up product photography; the product gallery is built for inspecting detail (hover zoom, full-screen view, video, 3D); metal and stone options show as swatches; and the path to purchase stays short with filters, predictive search, quick add, a slide-out cart and local pickup for studios with a showroom.
>
> Build: original Online Store 2.0 theme, JSON templates throughout, theme blocks shared across content sections, app blocks wherever apps plug in, and no app dependencies. Vanilla CSS on settings-driven tokens; Alpine.js (vendored, MIT) for interaction; the Ajax Cart and Section Rendering APIs for cart, variant, filter and search updates, with no client-side markup or money formatting. Product, cart, filters and search work without JavaScript. Checked against WCAG 2.2 AA with axe-core and html-validate on every template; Theme Check reports no errors or warnings.
>
> [Owner: add a sentence or two on your own Shopify development experience.]

## Owner fields

- Merchant review notification email (required): alerts when a merchant reviews the theme, or a review is updated or deleted. Not the review team
- Theme submission contact email (optional; falls back to the Partner account's business email): where the review team writes during review. Allow `themes@shopify.com` and `noreply@shopify.com` as senders
- Tracking IDs (optional): GA4 measurement ID and API secret, Google remarketing conversion ID, Meta pixel ID
- Key highlight images, desktop and mobile screenshots
- Merchant stores using the theme: only after launch, up to five, 779 x 1000px, with each store's permission

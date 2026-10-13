# Changelog

All notable changes to Vermeil. Versions follow [semantic versioning](https://semver.org): major for changes
that aren't backwards compatible, minor for backwards-compatible features, patch for fixes.

Merchant-facing release notes for each Theme Store submission are on the documentation site
(`docs-site/src/content/docs/release-notes.md`).

## 1.0.0 — Submitted 2026-10-13 (in review)

First Theme Store release. Vermeil is an Online Store 2.0 theme for jewelry and fine accessories, rebuilt from
scratch on vanilla CSS, Alpine.js and Shopify's Ajax Cart and Section Rendering APIs.

### Templates
- JSON templates for the home page, product, collection, collections list, search, cart, blog, blog post, page,
  contact page, page not found and password page. The gift card page is a Liquid template that renders the
  `main-gift-card` section.
- Header and footer in section groups; announcement bar in the header group.
- Customer accounts use new customer accounts through the `<shopify-account>` component; there are no legacy
  `customers/*` templates.

### Sections
- Content: hero, slideshow, rich text, image with text, editorial split, multicolumn, logo list, testimonials,
  video (hosted video with the theme's own controls, or YouTube and Vimeo), email signup, contact form,
  custom Liquid.
- Commerce: featured collection (grid or carousel), featured product, collection list, blog posts,
  product recommendations (related or complementary).
- Shared theme blocks: heading, text, button, custom Liquid, and slides for the slideshow.
- App blocks in the hero, rich text, image with text, product, featured product, blog post and footer sections.

### Product
- Main product section built entirely from blocks: vendor, title, price, variant picker, quantity selector,
  buy buttons, pickup availability, SKU, description, text, collapsible rows, share, complementary products,
  custom Liquid and apps.
- Gallery with stacked or two-column layouts, a swipeable mobile gallery, full-screen view, hover zoom,
  variant images, hosted video, YouTube and Vimeo, and 3D models with AR.
- Variant picker as buttons or dropdowns, with color and image swatches from product options; price, media,
  availability and URL update through the Section Rendering API. Combined listings supported.
- Dynamic checkout buttons, Shop Pay Installments, unit prices, quantity rules and the gift card recipient form.
- Structured data for products and blog posts.

### Discovery
- Collection and search pages with faceted filtering in a drawer: list, swatch, image, price range and
  boolean filters, active filter pills, sorting, and results that update without a page reload while keeping
  the browser history. Filtering and sorting still work without JavaScript.
- Predictive search in the header and on the page not found template.
- Product cards with a second image on hover, quick add, sale and sold-out badges, unit prices and "From"
  prices for products with varying prices.

### Cart
- Cart drawer or cart page, kept in sync with one request through the Section Rendering API: line and order
  discounts, selling plans, unit prices, line item properties, order notes, tax and duties notes, dynamic
  checkout buttons and an empty state. The cart page works without JavaScript.

### Content pages
- Blog with a tag filter and an optional featured first post; blog posts built from blocks with paginated
  comments, posted and awaiting-moderation messages, and previous and next post links.
- Page template with width and alignment settings, a contact form section, and a page not found template with
  search.
- Gift card page with the code and a copy button, balance, initial value, expiry, sender message, QR code,
  Apple Wallet and print styles.

### Design system
- Four color schemes, fonts from the Shopify font library (Gloock and Figtree by default) with bold and italic
  variants, page width, section spacing, grid spacing, button and input radius, and card settings.
- Right-to-left languages: the layout mirrors from the storefront language.
- Full-bleed sections (hero, slideshow, editorial split, email signup): the image fills the whole section, and
  the top and bottom padding settings add space inside it, around the content.

### Accessibility and quality
- Native elements throughout: `<dialog>` drawers, `<details>` disclosures, radio swatches and real checkboxes;
  visible focus rings; keyboard support for menus, carousels, drawers and the variant picker; reduced motion
  honored.
- Checked against WCAG 2.2 AA with axe-core and `html-validate` on every template; Theme Check reports no
  errors or warnings; `npm run check` also validates setting labels, translations and copy style.
- Lighthouse averages on home, collection and product: mobile performance 84 and accessibility 95, desktop
  performance 91 and accessibility 95.
- No third-party scripts from public CDNs. The only vendored library is Alpine.js (MIT).

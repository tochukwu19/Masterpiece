---
title: "Getting started"
description: "Install Vermeil and prepare your store: menus, customer accounts, filters, swatches, pickup, gift cards and more."
---

## Install Vermeil

1. In the Shopify Theme Store, open Vermeil and select **Try theme** to preview it with your products, or
   **Add theme** to add it to your theme library.
2. In your Shopify admin, go to **Online Store > Themes**. Vermeil appears in your theme library.
3. Select **Customize** to open the theme editor. Changes you make there don't affect your live store until you
   publish the theme.
4. When you're ready, select **Publish**.

Vermeil installs with the same layout, colors and fonts as the demo store. Demo images don't transfer, so
sections that need an image show a placeholder until you choose one.

## Prepare your store

Vermeil uses Shopify features you set up in your admin. Each item below says where the setting lives and what
it changes in the theme.

### Menus

Go to **Online Store > Navigation**.

- **Main menu** (`main-menu`): the header navigation. Add up to three levels. To show the second and third
  levels as columns, set **Desktop menu type** to **Mega menu** in the header settings.
- **Footer menu** (`footer`): the default menu for the footer's **Menu** block. Add more menu blocks to the
  footer for more columns.
- **Customer account menu** (`customer-account-main-menu`): the links in the account menu that opens from
  the header's account icon. Without it, the account menu shows Shopify's default links.

### Customer accounts

The account icon in the header uses Shopify's new customer accounts. Go to **Settings > Customer accounts**
and choose **Customer accounts**. Customers sign in with a one-time code; there are no passwords to manage.

### Filters

Go to the **Search & Discovery** app (free, by Shopify) and open **Filters**. The filters you add there appear
in the filter drawer on collection and search pages. Filters for an option with color or image swatches show
as swatches.

### Product options and swatches

To show swatches in the variant picker, open a product, edit an option such as **Color**, and connect it to a
category metafield or add a swatch color or image to each value. Options without swatches show as buttons or a
dropdown, depending on the variant picker's **Style** setting.

### Complementary products

The **Complementary products** product block and the **Product recommendations** section (set to
**Complementary products**) show the products you pair in the **Search & Discovery** app under
**Product recommendations**. Related products appear automatically and improve over time.

### Pickup availability

Go to **Settings > Shipping and delivery > Local pickup** and turn on pickup for at least one location with
an address. Products stocked at that location then show pickup availability on the product page.

### Shop Pay Installments

With Shopify Payments and Shop Pay Installments turned on, the product price shows the installments message.
Turn it off in the **Price** block with **Show Shop Pay Installments**.

### Gift cards

Go to **Products > Gift cards** to create a gift card product. Its product page shows a recipient form when
**Show recipient form for gift cards** is on in the **Buy buttons** block. Customers receive a gift card page
with the code, balance, a QR code and an Apple Wallet pass.

### Policies

Go to **Settings > Policies**. Policies you add appear as links at the bottom of the footer when
**Show policy links** is on.

### Countries, currencies and languages

Go to **Settings > Markets** and **Settings > Languages**. The country/region and language selectors in the
header, menu drawer and footer appear when your store has more than one option. Languages written right to
left, such as Arabic and Hebrew, mirror the layout automatically.

### Blog comments

Go to **Online Store > Blog posts > Manage blogs**, open a blog and choose whether comments are allowed and
whether they need approval. Blog posts show comments and a comment form when comments are allowed.

### Contact page

Go to **Online Store > Pages**, create a page such as "Contact", and choose the **contact** template. The
page shows its content followed by a contact form. You can also add the **Contact form** section to any page
in the theme editor.

## Customize the theme

Open the theme editor with **Online Store > Themes > Customize**.

- Use the page selector at the top to switch between templates: home page, products, collections, blog posts
  and so on.
- Select **Add section** to add sections, drag sections to reorder them, and select a section to change its
  settings and blocks.
- Open **Theme settings** (the gear icon) for the logo, colors, fonts, layout, buttons, product cards, cart
  and search.

The [settings reference](/settings-reference/) lists every setting with its default.

### Colors

Vermeil uses four color schemes. Each scheme sets a background, text, accent, button and button label color.
Sections and blocks pick a scheme with their **Color scheme** setting, so changing a scheme in theme settings
updates every section that uses it. Text placed over images is always white, with an adjustable overlay.

### Fonts

Choose the heading and body fonts in **Theme settings > Typography**. Bold and italic versions load
automatically. **Font size scale** makes all headings or all body text larger or smaller.

### Images

Image settings list a recommended size, for example "2400 x 1350px recommended". To keep the important part
of a photo visible when it's cropped, open the image in **Content > Files** and set its focal point. Vermeil
crops around it on every page.

## Before you edit theme code

Theme code changes aren't covered by support, and theme updates replace edited files. Before you edit code,
duplicate the theme (**Actions > Duplicate**) so you can go back to the original.

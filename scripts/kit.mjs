import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), 'utf8');

const settingsData = JSON.parse(read('config/settings_data.json').replace(/^\/\*[\s\S]*?\*\//, ''));
const theme = settingsData.presets[settingsData.current] ?? Object.values(settingsData.presets)[0];
const themeName = JSON.parse(read('config/settings_schema.json'))[0].theme_name;

const acronyms = { dm: 'DM', ibm: 'IBM', pt: 'PT', eb: 'EB', ui: 'UI' };
const fontFromHandle = (handle) => {
  const parts = handle.split('_');
  const variant = parts.pop();
  const family = parts.map((p) => acronyms[p] ?? p[0].toUpperCase() + p.slice(1)).join(' ');
  return { family, weight: Number(variant.slice(1)) * 100, italic: variant.startsWith('i') };
};

const heading = fontFromHandle(theme.type_heading_font);
const body = fontFromHandle(theme.type_body_font);
const googleFamily = (font, weights) =>
  `family=${font.family.replace(/ /g, '+')}:ital,wght@${weights.map((w) => `0,${w}`).concat(weights.map((w) => `1,${w}`)).join(';')}`;
const fontsHref = `https://fonts.googleapis.com/css2?${googleFamily(heading, [heading.weight])}&${googleFamily(body, [body.weight, 500, 700])}&display=swap`;

const ratios = { square: '1 / 1', landscape: '4 / 3', adapt: 'auto', portrait: '4 / 5' };

const rootTokens = `:root {
  --font-heading-family: '${heading.family}', serif;
  --font-heading-style: normal;
  --font-heading-weight: ${heading.weight};
  --font-heading-case: ${theme.heading_case};
  --font-heading-scale: ${theme.heading_scale / 100};
  --font-body-family: '${body.family}', sans-serif;
  --font-body-style: normal;
  --font-body-weight: ${body.weight};
  --font-body-weight-medium: 500;
  --font-body-weight-bold: 700;
  --font-body-scale: ${theme.body_scale / 100};
  --page-width: ${theme.page_width / 16}rem;
  --spacing-sections: ${theme.spacing_sections}px;
  --grid-gap: ${theme.spacing_grid}px;
  --buttons-radius: ${theme.buttons_radius}px;
  --buttons-text-transform: ${theme.buttons_uppercase ? 'uppercase' : 'none'};
  --inputs-radius: ${theme.inputs_radius}px;
  --card-ratio: ${ratios[theme.card_image_ratio] ?? '4 / 5'};
  --media-zoom: ${theme.animations_media_zoom ? 1.05 : 1};
}`;

const schemes = Object.entries(theme.color_schemes);
const schemeTokens = schemes
  .map(([id, { settings: s }], i) => `${i === 0 ? ':root, ' : ''}.color-${id} {
  --color-bg: ${s.background};
  --color-bg-image: ${s.background_gradient || 'none'};
  --color-fg: ${s.text};
  --color-accent: ${s.accent};
  --color-button: ${s.button};
  --color-button-label: ${s.button_label};
  --color-secondary-button-label: ${s.secondary_button_label};
  --color-fg-muted: color-mix(in srgb, var(--color-fg) 80%, var(--color-bg));
  --color-border: color-mix(in srgb, var(--color-fg) 18%, var(--color-bg));
  --color-border-input: color-mix(in srgb, var(--color-fg) 60%, var(--color-bg));
  --color-surface: color-mix(in srgb, var(--color-fg) 5%, var(--color-bg));
}`)
  .join('\n');
const schemeBase = `${schemes.map(([id]) => `.color-${id}`).join(', ')} { background-color: var(--color-bg); background-image: var(--color-bg-image); color: var(--color-fg); }`;

const componentCss = ['snippets', 'sections', 'blocks']
  .filter((dir) => existsSync(join(root, dir)))
  .flatMap((dir) =>
    readdirSync(join(root, dir))
      .filter((f) => f.endsWith('.liquid'))
      .map((f) => {
        const match = read(`${dir}/${f}`).match(/{%-?\s*stylesheet\s*-?%}([\s\S]*?){%-?\s*endstylesheet\s*-?%}/);
        return match ? match[1].trim() : '';
      })
  )
  .filter(Boolean)
  .join('\n\n');

const iconSource = read('snippets/icon.liquid');
const icons = [...iconSource.matchAll(/when '([^']+)' -%}\s*([\s\S]*?)\s*{%-/g)].map(([, name, svg]) => ({ name, svg }));
const socialSource = read('snippets/icon-social.liquid');
const socialIcons = [...socialSource.matchAll(/when '([^']+)' -%}\s*([\s\S]*?)\s*{%-/g)].map(([, name, svg]) => ({ name, svg }));
const icon = (name) => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${icons.find((i) => i.name === name)?.svg ?? ''}</svg>`;

const luminance = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const mix = (a, b, p) =>
  '#' + [1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * p + parseInt(b.slice(i, i + 2), 16) * (1 - p)).toString(16).padStart(2, '0')).join('');
const grade = (ratio, min) => `<span class="ds-ratio ${ratio >= min ? 'ds-pass' : 'ds-fail'}">${ratio.toFixed(2)}</span>`;

const placeholder = (shade) =>
  `<svg class="placeholder" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice"><rect width="400" height="500" style="fill: color-mix(in srgb, var(--color-fg) ${shade}%, var(--color-bg))"/></svg>`;

const price = (regular, compare) =>
  `<div class="price card-product__price${compare ? ' price--on-sale' : ''}"><span class="price__regular">${regular}</span>${compare ? `<s class="price__compare">${compare}</s>` : ''}</div>`;

const productCard = ({ title, regular, compare, badge, badgeScheme, shade = 8 }) => `
<article class="card-product card-product--has-secondary">
  <div class="card-product__media media" style="--ratio: var(--card-ratio);">
    ${placeholder(shade)}
    ${badge ? `<span class="card-product__badge card-product__badge--${theme.badge_position} badge color-${badgeScheme}">${badge}</span>` : ''}
  </div>
  <div class="card-product__info">
    <div class="card-product__text">
      <h3 class="card-product__title"><a href="#" class="card-product__link">${title}</a></h3>
      ${price(regular, compare)}
    </div>
    <div class="card-product__quick-add"><button type="button" class="icon-button card-product__quick-add-button">${icon('plus')}<span class="visually-hidden">Add ${title} to cart</span></button></div>
  </div>
</article>`;

const section = (id, title, scheme, content) => `
<section id="${id}" class="ds-section color-${scheme}">
  <div class="page-width">
    <h2 class="ds-label">${title}</h2>
    ${content}
  </div>
</section>`;

const nav = [
  ['colors', 'Color schemes'],
  ['type', 'Typography'],
  ['buttons', 'Buttons'],
  ['forms', 'Forms'],
  ['badges', 'Badges and price'],
  ['icons', 'Icons'],
  ['cards', 'Cards'],
  ['heading', 'Section heading'],
  ['pagination', 'Pagination'],
  ['header', 'Header'],
  ['drawers', 'Drawers'],
  ['footer', 'Footer'],
  ['product', 'Product'],
];

const cartItem = (title, options, price, compare, shade) => `
<li class="cart-item">
  <span class="cart-item__media media" style="--ratio: 4 / 5;">${placeholder(shade)}</span>
  <div class="cart-item__details">
    <a href="#" class="cart-item__title">${title}</a>
    <dl class="cart-item__options text-small text-muted">${options.map(([k, v]) => `<div><dt>${k}:</dt> <dd>${v}</dd></div>`).join('')}</dl>
    <div class="cart-item__price price"><span class="price__regular">${price}</span>${compare ? `<s class="price__compare">${compare}</s>` : ''}</div>
    <div class="cart-item__actions">
      <div class="quantity"><button type="button" class="quantity__button">${icon('minus')}<span class="visually-hidden">Decrease</span></button><input class="quantity__input" type="number" value="1" aria-label="Quantity"><button type="button" class="quantity__button">${icon('plus')}<span class="visually-hidden">Increase</span></button></div>
      <a href="#" class="icon-button cart-item__remove">${icon('trash')}<span class="visually-hidden">Remove</span></a>
    </div>
  </div>
</li>`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${themeName} design system</title>
<link rel="stylesheet" href="${fontsHref}">
<style>
${rootTokens}
${schemeTokens}
${schemeBase}
</style>
<link rel="stylesheet" href="../../assets/base.css">
<style>
${componentCss}

.ds-header { padding-block: 3rem 2rem; border-bottom: 1px solid var(--color-border); }
.ds-header p { max-width: 40rem; margin-top: 0.75rem; }
.ds-nav { display: flex; flex-wrap: wrap; gap: 0.25rem 1.25rem; margin-top: 1.5rem; }
.ds-section { padding-block: clamp(3rem, 6vw, 5rem); }
.ds-label { margin-bottom: 2rem; font-family: var(--font-body-family); font-weight: 500; font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-fg-muted); }
.ds-row { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; }
.ds-stack { display: grid; gap: 1.5rem; }
.ds-cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr)); gap: 2.5rem; }
.ds-schemes { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr)); gap: 1rem; }
.ds-scheme { display: grid; gap: 1rem; padding: 1.5rem; border: 1px solid var(--color-border); }
.ds-scheme dl { display: grid; grid-template-columns: 1fr auto; gap: 0.35rem 1rem; font-size: 0.8125rem; }
.ds-scheme dd { margin: 0; }
.ds-chips { display: flex; gap: 0.375rem; }
.ds-chip { width: 1.75rem; height: 1.75rem; border: 1px solid var(--color-border); }
.ds-ratio { font-variant-numeric: tabular-nums; }
.ds-ratio::after { margin-left: 0.35rem; }
.ds-pass::after { content: 'AA'; }
.ds-fail::after { content: 'fail'; font-weight: 700; }
.ds-type-row { display: grid; grid-template-columns: 6rem 1fr; align-items: baseline; gap: 1rem; padding-block: 0.75rem; border-bottom: 1px solid var(--color-border); }
.ds-type-row code { font-size: 0.75rem; color: var(--color-fg-muted); }
.ds-icons { display: grid; grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr)); gap: 1rem; }
.ds-icon { display: grid; justify-items: center; gap: 0.75rem; padding: 1.25rem 0.5rem; border: 1px solid var(--color-border); font-size: 0.75rem; }
.ds-icon .icon { --icon-size: 1.5rem; }
.ds-preview { display: flex; flex-wrap: wrap; gap: 2rem; align-items: flex-start; }
.ds-preview .drawer { position: relative; inset: auto; display: block; width: 100%; max-width: 30rem; height: 40rem; margin: 0; border: 1px solid var(--color-border); animation: none; }
.ds-frame { border: 1px solid var(--color-border); }
.ds-social { display: flex; gap: 0.5rem; }
.ds-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); gap: var(--grid-gap); }
</style>
</head>
<body>
<header class="ds-header page-width">
  <p class="eyebrow">Generated from theme settings, base.css and component snippets</p>
  <h1 class="h0">${themeName}</h1>
  <p class="text-muted">The living reference for the theme's design system. Regenerate with <code>npm run kit</code> after changing tokens, base styles or components.</p>
  <nav class="ds-nav" aria-label="Sections">${nav.map(([id, label]) => `<a class="link" href="#${id}">${label}</a>`).join('')}</nav>
</header>
<main>
${section('colors', 'Color schemes', 'scheme-1', `<div class="ds-schemes">${schemes
  .map(([id, { settings: s }], i) => {
    const muted = mix(s.text, s.background, 0.8);
    const input = mix(s.text, s.background, 0.6);
    return `<div class="ds-scheme color-${id}">
      <p class="h4">Scheme ${i + 1}</p>
      <div class="ds-chips">${[s.background, s.text, s.accent, s.button, s.button_label].map((c) => `<span class="ds-chip" style="background:${c}" title="${c}"></span>`).join('')}</div>
      <dl>
        <dt>Text</dt><dd>${grade(contrast(s.text, s.background), 4.5)}</dd>
        <dt>Muted text</dt><dd>${grade(contrast(muted, s.background), 4.5)}</dd>
        <dt>Accent</dt><dd>${grade(contrast(s.accent, s.background), 4.5)}</dd>
        <dt>Input border</dt><dd>${grade(contrast(input, s.background), 3)}</dd>
        <dt>Button label</dt><dd>${grade(contrast(s.button_label, s.button), 4.5)}</dd>
      </dl>
      <div class="ds-row"><button class="button" type="button">Solid</button><button class="button button--secondary" type="button">Outline</button></div>
    </div>`;
  })
  .join('')}</div>`)}

${section('type', 'Typography', 'scheme-1', `<div class="ds-cols"><div>
  ${[
    ['h0', 'Display', 'New arrivals'],
    ['h1', 'Heading 1', 'Pieces made to last'],
    ['h2', 'Heading 2', 'Recycled 18k gold'],
    ['h3', 'Heading 3', 'Our signature hoops'],
    ['h4', 'Heading 4', 'Care and repair'],
    ['h5', 'Heading 5', 'Shipping and returns'],
    ['h6', 'Heading 6', 'Ring size guide'],
    ['eyebrow', 'Eyebrow', 'See what’s new'],
  ]
    .map(([cls, label, text]) => `<div class="ds-type-row"><code>.${cls}</code><p class="${cls}">${text}</p></div>`)
    .join('')}
  <p class="ds-type-row"><code>${heading.family}</code><span>Headings, ${heading.weight}</span></p>
  <p class="ds-type-row"><code>${body.family}</code><span>Body and UI, ${body.weight} / 500 / 700</span></p>
</div>
<div class="rte">
  <h2>Rich text</h2>
  <p>Every piece is hand-finished in our studio from <strong>recycled 18k gold</strong> and conflict-free stones. <a href="#">Read the care guide</a>.</p>
  <blockquote>Made to be worn every day and passed down.</blockquote>
  <h3>Materials</h3>
  <ul><li>Recycled 18k yellow, white and rose gold</li><li>Lab-grown and ethically mined diamonds</li></ul>
  <ol><li>Clean with warm water</li><li>Dry with a soft cloth</li></ol>
  <table><tr><th>Size</th><th>Diameter</th></tr><tr><td>6</td><td>16.5 mm</td></tr><tr><td>7</td><td>17.3 mm</td></tr></table>
</div></div>`)}

${section('buttons', 'Buttons', 'scheme-2', `<div class="ds-stack">
  <div class="ds-row">
    <button class="button" type="button">Add to cart</button>
    <button class="button button--secondary" type="button">Save for later</button>
    <button class="button button--tertiary" type="button">View all</button>
    <button class="button" type="button" aria-busy="true"><svg class="loading-spinner" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" opacity="0.25"/><path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Adding</button>
    <button class="button" type="button" disabled>Sold out</button>
  </div>
  <div class="ds-row">
    <button class="icon-button" type="button">${icon('menu')}<span class="visually-hidden">Menu</span></button>
    <button class="icon-button" type="button">${icon('search')}<span class="visually-hidden">Search</span></button>
    <button class="icon-button" type="button">${icon('bag')}<span class="visually-hidden">Cart</span></button>
    <button class="icon-button" type="button">${icon('close')}<span class="visually-hidden">Close</span></button>
  </div>
  <div style="max-width: 24rem"><button class="button button--full" type="button">Checkout</button></div>
</div>`)}

${section('forms', 'Forms', 'scheme-1', `<div class="ds-cols">
  <div class="ds-stack">
    <div class="field"><label class="field__label" for="ds-email">Email</label><input id="ds-email" class="input" type="email" placeholder="you@example.com"></div>
    <div class="field"><label class="field__label" for="ds-size">Ring size</label><div class="select-field"><select id="ds-size" class="select"><option>6</option><option>7</option><option>8</option></select>${icon('chevron-down').replace('class="icon"', 'class="icon select-field__icon"')}</div></div>
    <div class="field"><label class="field__label" for="ds-note">Order note</label><textarea id="ds-note" class="textarea" placeholder="Gift message"></textarea></div>
    <div class="field"><label class="field__label" for="ds-invalid">Email</label><input id="ds-invalid" class="input" type="email" value="you@" aria-invalid="true" aria-describedby="ds-invalid-error"><p id="ds-invalid-error" class="form-message form-message--error">${icon('error')}Enter a valid email address.</p></div>
  </div>
  <div class="ds-stack">
    <div class="field"><label class="visually-hidden" for="ds-news">Email</label><div class="field__inline"><input id="ds-news" class="input input--underline" placeholder="Email address"><button type="button" class="icon-button field__inline-button">${icon('arrow-right')}<span class="visually-hidden">Subscribe</span></button></div></div>
    <div class="ds-row">
      <div class="quantity"><button class="quantity__button" type="button" disabled>${icon('minus')}<span class="visually-hidden">Decrease quantity</span></button><input class="quantity__input" type="number" value="1" min="1" aria-label="Quantity"><button class="quantity__button" type="button">${icon('plus')}<span class="visually-hidden">Increase quantity</span></button></div>
    </div>
    <div class="ds-row">
      <label class="checkbox"><input type="checkbox" checked><span>In stock</span></label>
      <label class="checkbox"><input type="checkbox"><span>Yellow gold</span></label>
      <label class="checkbox"><input type="checkbox" disabled><span>Platinum</span></label>
    </div>
    <div class="ds-row">
      <label class="radio"><input type="radio" name="ds-sort" checked><span>Featured</span></label>
      <label class="radio"><input type="radio" name="ds-sort"><span>Price, low to high</span></label>
    </div>
    <p class="form-message">${icon('check')}Thanks for subscribing.</p>
  </div>
</div>`)}

${section('badges', 'Badges and price', 'scheme-1', `<div class="ds-stack">
  <div class="ds-row">${schemes.map(([id], i) => `<span class="badge color-${id}">Scheme ${i + 1}</span>`).join('')}</div>
  <div class="ds-row">
    <span class="badge color-${theme.badge_sale_color_scheme}">Sale</span>
    <span class="badge color-${theme.badge_sold_out_color_scheme}">Sold out</span>
  </div>
  <div class="ds-row" style="gap: 2.5rem">
    <div class="price"><span class="price__regular">$1,280.00 USD</span></div>
    <div class="price price--on-sale"><span class="price__regular">$340.00 USD</span><s class="price__compare">$420.00 USD</s></div>
    <div class="price"><span class="price__regular">From $190.00 USD</span><span class="price__unit">$4.75 / g</span></div>
    <div class="price price--sold-out"><span class="price__regular">$560.00 USD</span></div>
  </div>
</div>`)}

${section('icons', 'Icons', 'scheme-1', `<div class="ds-icons">${icons.map(({ name }) => `<div class="ds-icon">${icon(name)}<code>${name}</code></div>`).join('')}</div>`)}

${section('cards', 'Cards', 'scheme-1', `<div class="ds-stack">
  <ul class="layout-grid list-unstyled" style="--cols: 4">
    <li>${productCard({ title: 'Aurelia solitaire ring', regular: '$1,280.00 USD' })}</li>
    <li>${productCard({ title: 'Marguerite pearl drop earrings', regular: '$340.00 USD', compare: '$420.00 USD', badge: 'Sale', badgeScheme: theme.badge_sale_color_scheme, shade: 12 })}</li>
    <li>${productCard({ title: 'Fine curb chain', regular: '$560.00 USD', badge: 'Sold out', badgeScheme: theme.badge_sold_out_color_scheme, shade: 16 })}</li>
    <li>${productCard({ title: 'Petite hoops', regular: 'From $190.00 USD', shade: 10 })}</li>
  </ul>
  <div class="ds-cards">
    <a href="#" class="card-collection"><div class="card-collection__media media" style="--ratio: 4 / 5;">${placeholder(45)}</div><div class="card-collection__caption"><h3 class="card-collection__title h3">Rings</h3><p class="card-collection__count text-small">24 products</p></div></a>
    <a href="#" class="card-collection"><div class="card-collection__media media" style="--ratio: 4 / 5;">${placeholder(30)}</div><div class="card-collection__caption"><h3 class="card-collection__title h3">Earrings</h3></div></a>
    <article class="card-article"><div class="card-article__media media" style="--ratio: 4 / 5;">${placeholder(14)}</div><div class="card-article__info"><p class="card-article__meta eyebrow text-muted">October 2, 2026</p><h3 class="card-article__title h4"><a href="#" class="card-article__link">How to stack rings</a></h3><p class="card-article__excerpt text-muted">Mixing metals, widths and textures without losing the thread.</p></div></article>
  </div>
</div>`)}

${section('heading', 'Section heading', 'scheme-2', `<div class="ds-stack">
  <div class="section-heading"><div class="section-heading__text"><p class="eyebrow">See what’s new</p><h2 class="h0">New arrivals</h2></div><a href="#" class="button button--tertiary">View all</a></div>
  <div class="section-heading section-heading--center"><div class="section-heading__text"><p class="eyebrow">Join our circle</p><h2 class="h1">Early access, always</h2><div class="section-heading__subheading rte"><p>New collections first, and 10% off your first order.</p></div></div></div>
</div>`)}

${section('pagination', 'Pagination', 'scheme-1', `<nav class="pagination" aria-label="Pagination"><ul class="pagination__list list-unstyled">
  <li><span class="pagination__item pagination__item--disabled" aria-hidden="true">${icon('chevron-left')}</span></li>
  <li><span class="pagination__item" aria-current="page">1</span></li>
  <li><a class="pagination__item" href="#">2</a></li>
  <li><a class="pagination__item" href="#">3</a></li>
  <li><span class="pagination__item pagination__item--disabled">…</span></li>
  <li><a class="pagination__item" href="#">9</a></li>
  <li><a class="pagination__item" href="#">${icon('chevron-right')}<span class="visually-hidden">Next page</span></a></li>
</ul></nav>`)}

${section('header', 'Header', 'scheme-1', `<div class="ds-frame">
  <div class="announcement-bar color-scheme-3"><div class="announcement-bar__inner page-width"><button type="button" class="icon-button announcement-bar__control">${icon('chevron-left')}<span class="visually-hidden">Previous</span></button><div class="announcement-bar__slides"><p class="announcement-bar__message">Complimentary engraving on every ring</p></div><button type="button" class="icon-button announcement-bar__control">${icon('chevron-right')}<span class="visually-hidden">Next</span></button></div></div>
  <header class="header header--separator color-scheme-1"><div class="header__inner page-width">
    <div class="header__start">
      <button type="button" class="icon-button header__mobile-only">${icon('menu')}<span class="visually-hidden">Menu</span></button>
      <button type="button" class="icon-button header__mobile-only">${icon('search')}<span class="visually-hidden">Search</span></button>
      <nav class="header__nav"><ul class="header__menu list-unstyled"><li class="header__menu-item"><a class="header__menu-link" href="#" aria-current="page">New in</a></li><li class="header__menu-item"><button class="header__menu-link" type="button">Rings${icon('chevron-down')}</button></li><li class="header__menu-item"><button class="header__menu-link" type="button">Earrings${icon('chevron-down')}</button></li><li class="header__menu-item"><a class="header__menu-link" href="#">Journal</a></li></ul></nav>
    </div>
    <div class="header__logo"><a href="#" class="header__logo-link"><span class="header__wordmark">${themeName}</span></a></div>
    <div class="header__end">
      <button type="button" class="icon-button header__desktop-only">${icon('search')}<span class="visually-hidden">Search</span></button>
      <span class="header__account-icon">${icon('account')}<span class="visually-hidden">Account</span></span>
      <a href="#" class="icon-button header__cart">${icon('bag')}<span class="header__cart-count"><span class="cart-count">2</span></span><span class="visually-hidden">Cart, 2 items</span></a>
    </div>
  </div></header>
</div>`)}

${section('drawers', 'Drawers', 'scheme-2', `<div class="ds-preview">
  <div class="drawer cart-drawer color-scheme-1"><div class="drawer__inner">
    <div class="drawer__header"><p class="drawer__title h4">Your cart <span class="cart-drawer__count">(2)</span></p><form method="dialog" class="drawer__close-form"><button class="drawer__close">Close</button></form></div>
    <div class="drawer__body"><ul class="cart-items list-unstyled">
      ${cartItem('Aurelia solitaire ring', [['Metal', '18k yellow gold'], ['Size', '6']], '$1,280.00', '', 10)}
      ${cartItem('Marguerite pearl drop earrings', [['Metal', 'Vermeil']], '$340.00', '$420.00', 16)}
    </ul></div>
    <div class="drawer__footer"><div class="cart-summary">
      <div class="cart-summary__total"><span class="h5">Estimated total</span><span class="cart-summary__amount">$1,620.00 USD</span></div>
      <p class="cart-summary__taxes text-small text-muted">Taxes included. Discounts and shipping calculated at checkout.</p>
      <button type="button" class="button button--full">Check out</button>
    </div><a href="#" class="button button--tertiary cart-drawer__view">View cart</a></div>
  </div></div>
  <div class="drawer drawer--left menu-drawer color-scheme-1"><div class="drawer__inner">
    <div class="drawer__header"><p class="drawer__title h4">Menu</p><form method="dialog" class="drawer__close-form"><button class="drawer__close">Close</button></form></div>
    <nav class="drawer__body"><ul class="menu-drawer__list list-unstyled">
      <li><a href="#" class="menu-drawer__link" aria-current="page">New in</a></li>
      <li><details class="disclosure menu-drawer__details" open><summary class="menu-drawer__link">Rings${icon('chevron-down')}</summary><ul class="menu-drawer__sublist list-unstyled"><li><a href="#" class="menu-drawer__sublink">Solitaires</a></li><li><a href="#" class="menu-drawer__sublink">Bands</a></li><li><a href="#" class="menu-drawer__sublink">Stacking</a></li></ul></details></li>
      <li><details class="disclosure menu-drawer__details"><summary class="menu-drawer__link">Earrings${icon('chevron-down')}</summary></details></li>
      <li><a href="#" class="menu-drawer__link">Journal</a></li>
    </ul></nav>
    <div class="drawer__footer menu-drawer__footer">
      <div class="field"><label class="field__label" for="ds-country">Country/region</label><div class="select-field"><select id="ds-country" class="select"><option>United States (USD $)</option><option>United Kingdom (GBP £)</option></select>${icon('chevron-down').replace('class="icon"', 'class="icon select-field__icon"')}</div></div>
      <ul class="social-icons list-unstyled">${socialIcons.slice(0, 4).map(({ name, svg }) => `<li><a href="#" class="icon-button social-icons__link"><svg class="icon icon--fill icon-social" viewBox="0 0 24 24" aria-hidden="true">${svg}</svg><span class="visually-hidden">${name}</span></a></li>`).join('')}</ul>
    </div>
  </div></div>
</div>`)}

${section('footer', 'Footer', 'scheme-1', `<div class="footer"><div class="footer__blocks">
    <div class="footer__block"><h2 class="footer__heading h6">Shop</h2><ul class="footer__menu list-unstyled"><li><a href="#" class="footer__link">Rings</a></li><li><a href="#" class="footer__link">Earrings</a></li><li><a href="#" class="footer__link">Necklaces</a></li></ul></div>
    <div class="footer__block"><h2 class="footer__heading h6">Care</h2><ul class="footer__menu list-unstyled"><li><a href="#" class="footer__link">Shipping</a></li><li><a href="#" class="footer__link">Returns</a></li><li><a href="#" class="footer__link">Ring sizing</a></li></ul></div>
    <div class="footer__block footer__block--newsletter"><h2 class="footer__heading h6">Subscribe to our emails</h2><div class="rte text-muted"><p>Be the first to know about new collections.</p></div><div class="field" style="margin-top: 1rem"><label class="visually-hidden" for="ds-footer-email">Email</label><div class="field__inline"><input id="ds-footer-email" class="input input--underline" placeholder="Email address"><button type="button" class="icon-button field__inline-button">${icon('arrow-right')}<span class="visually-hidden">Subscribe</span></button></div></div></div>
  </div>
  <div class="footer__bottom">
    <div class="footer__meta"><ul class="social-icons list-unstyled">${socialIcons.map(({ name, svg }) => `<li><a href="#" class="icon-button social-icons__link"><svg class="icon icon--fill icon-social" viewBox="0 0 24 24" aria-hidden="true">${svg}</svg><span class="visually-hidden">${name}</span></a></li>`).join('')}</ul></div>
    <div class="footer__legal text-small text-muted"><p>&copy; 2026, ${themeName}</p><ul class="footer__policies list-unstyled"><li><a href="#" class="footer__link">Privacy policy</a></li><li><a href="#" class="footer__link">Terms of service</a></li></ul></div>
  </div>
  <div class="footer__wordmark" aria-hidden="true"><span class="footer__wordmark-text" data-fit>${themeName}</span></div>
</div>`)}

${section('product', 'Product', 'scheme-1', `<div class="product__layout">
  <div class="product__media"><div class="product-gallery"><ul class="product-gallery__list list-unstyled">
    <li class="product-gallery__item"><div class="product-media media" style="--ratio: 4 / 5;">${placeholder(8)}</div></li>
    <li class="product-gallery__item"><div class="product-media media" style="--ratio: 4 / 5;">${placeholder(14)}<span class="product-media__badge">${icon('play')}</span></div></li>
  </ul><p class="product-gallery__counter text-small">1 / 2</p></div></div>
  <div class="product__info">
    <p class="product__vendor eyebrow">${themeName}</p>
    <h1 class="product__title h2">Aurelia solitaire ring</h1>
    <div class="product__price"><div class="price product__price-amount price--on-sale"><span class="price__regular">$1,280.00 USD</span><s class="price__compare">$1,480.00 USD</s></div><p class="product__tax text-small text-muted">Taxes included. <a href="#">Shipping</a> calculated at checkout.</p></div>
    <div class="variant-picker">
      <fieldset class="variant-picker__option"><legend class="variant-picker__legend"><span class="variant-picker__name">Metal</span><span class="variant-picker__selected">Yellow gold</span></legend><div class="variant-picker__values">
        ${[['#D4AF37', 'Yellow gold', true, true], ['#E8E8E8', 'White gold', false, true], ['#E0A98E', 'Rose gold', false, false]].map(([c, n, checked, available], i) => `<input type="radio" class="variant-picker__input" id="ds-metal-${i}" name="ds-metal" ${checked ? 'checked' : ''}><label for="ds-metal-${i}" class="variant-picker__swatch variant-picker__swatch--circle${available ? '' : ' is-unavailable'}" title="${n}"><span class="variant-picker__swatch-fill" style="--swatch-color: ${c};"></span><span class="visually-hidden">${n}</span></label>`).join('')}
      </div></fieldset>
      <fieldset class="variant-picker__option"><legend class="variant-picker__legend"><span class="variant-picker__name">Size</span></legend><div class="variant-picker__values">
        ${['5', '6', '7', '8'].map((v, i) => `<input type="radio" class="variant-picker__input" id="ds-size-${i}" name="ds-size" ${i === 1 ? 'checked' : ''}><label for="ds-size-${i}" class="variant-picker__button${i === 3 ? ' is-unavailable' : ''}">${v}</label>`).join('')}
      </div></fieldset>
    </div>
    <div class="product__quantity field"><label class="field__label" for="ds-qty">Quantity</label><div class="quantity"><button type="button" class="quantity__button">${icon('minus')}<span class="visually-hidden">Decrease</span></button><input id="ds-qty" class="quantity__input" type="number" value="1"><button type="button" class="quantity__button">${icon('plus')}<span class="visually-hidden">Increase</span></button></div></div>
    <div class="product-form__buttons"><button type="button" class="button button--full button--secondary">Add to cart</button><button type="button" class="button button--full">Buy it now</button></div>
    <div class="pickup__summary">${icon('pin')}<div class="pickup__text"><p>Pickup available at <strong>Mercer Street studio</strong></p><p class="text-small text-muted">Usually ready in 24 hours</p><button type="button" class="button button--tertiary pickup__more">Check availability at other stores</button></div></div>
    <div class="rte"><p>A single brilliant-cut diamond in a slim four-claw setting, on a 1.8 mm band of recycled 18k gold.</p></div>
    <div>
      <details class="disclosure product__tab" open><summary class="product__tab-summary"><span>Materials</span><svg class="icon product__tab-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></summary><div class="product__tab-content rte"><p>Recycled 18k gold, 0.5 ct lab-grown diamond.</p></div></details>
      <details class="disclosure product__tab"><summary class="product__tab-summary"><span>Shipping and returns</span><svg class="icon product__tab-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></summary></details>
    </div>
    <div class="product__share"><button type="button" class="button button--tertiary">${icon('share')}Share</button></div>
  </div>
</div>`)}
</main>
<script>
  const fit = () => document.querySelectorAll('[data-fit]').forEach((text) => {
    text.style.fontSize = '100px';
    text.style.fontSize = Math.floor((text.parentElement.clientWidth / text.getBoundingClientRect().width) * 10000) / 100 + 'px';
  });
  document.fonts.ready.then(fit);
  addEventListener('resize', fit);
</script>
</body>
</html>
`;

mkdirSync(join(root, 'docs/design-system'), { recursive: true });
writeFileSync(join(root, 'docs/design-system/index.html'), html);
console.log(`docs/design-system/index.html (${icons.length} icons, ${schemes.length} schemes, ${heading.family} + ${body.family})`);

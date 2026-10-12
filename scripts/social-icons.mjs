import { writeFileSync } from 'node:fs';
import * as icons from 'simple-icons';

const brands = ['instagram', 'tiktok', 'pinterest', 'facebook', 'x', 'youtube', 'snapchat', 'tumblr', 'vimeo'];
const key = (slug) => 'si' + slug[0].toUpperCase() + slug.slice(1);

const cases = brands
  .map((slug) => `    {%- when '${slug}' -%}\n      <path d="${icons[key(slug)].path}"/>`)
  .join('\n');

const snippet = `{% doc %}
  Social media brand icon.

  @param {string} name - ${brands.join(', ')}
  @example
  {% render 'icon-social', name: 'instagram' %}
{% enddoc %}

<svg class="icon icon--fill icon-social" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  {%- case name -%}
${cases}
  {%- endcase -%}
</svg>
`;

writeFileSync(new URL('../snippets/icon-social.liquid', import.meta.url), snippet);
console.log(`snippets/icon-social.liquid (${brands.length} brands)`);

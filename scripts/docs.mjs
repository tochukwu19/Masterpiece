import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), 'utf8');
const locale = JSON.parse(read('locales/en.default.schema.json'));
const translate = (value) =>
  typeof value === 'string' && value.startsWith('t:') ? value.slice(2).split('.').reduce((node, part) => node?.[part], locale) ?? value : value;
const cell = (text) => String(text ?? '').replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim();

const typeNames = {
  checkbox: 'Checkbox',
  range: 'Range',
  select: 'Select',
  text: 'Text',
  textarea: 'Text area',
  richtext: 'Rich text',
  inline_richtext: 'Rich text (one line)',
  image_picker: 'Image',
  color_scheme: 'Color scheme',
  color_scheme_group: 'Color schemes',
  font_picker: 'Font',
  collection: 'Collection',
  product: 'Product',
  blog: 'Blog',
  page: 'Page',
  link_list: 'Menu',
  url: 'Link',
  video: 'Video',
  video_url: 'Video URL',
  liquid: 'Liquid',
};

const describeDefault = (setting) => {
  const { type, default: value } = setting;
  if (value === undefined || value === '') return '';
  if (type === 'checkbox') return value ? 'On' : 'Off';
  if (type === 'range') return `${value}${setting.unit ?? ''}`;
  if (type === 'select') return translate(setting.options?.find((option) => option.value === value)?.label) ?? value;
  if (type === 'font_picker') return value.replace(/_[ni]\d$/, '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  if (type === 'link_list') return `"${value}" menu`;
  if (type === 'color_scheme') return value.replace('scheme-', 'Scheme ');
  if (['text', 'inline_richtext', 'richtext', 'textarea'].includes(type)) return `"${String(value).replace(/<[^>]+>/g, '')}"`;
  return '';
};

const describeType = (setting) => {
  const name = typeNames[setting.type] ?? setting.type;
  if (setting.type === 'range') return `${name}, ${setting.min}–${setting.max}${setting.unit ?? ''}`;
  if (setting.type === 'select' && setting.options) return `${name}: ${setting.options.map((option) => translate(option.label)).join(', ')}`;
  return name;
};

const settingsTable = (settings = []) => {
  const lines = [];
  let open = false;
  const table = () => {
    if (!open) lines.push('', '| Setting | Type | Default | Notes |', '|---|---|---|---|');
    open = true;
  };
  for (const setting of settings) {
    if (setting.type === 'header') {
      lines.push('', `**${translate(setting.content)}**`);
      open = false;
      continue;
    }
    if (setting.type === 'paragraph') {
      lines.push('', `_${translate(setting.content)}_`);
      open = false;
      continue;
    }
    table();
    const label = setting.type === 'color_scheme_group' ? 'Color schemes' : translate(setting.label);
    lines.push(`| ${cell(label)} | ${cell(describeType(setting))} | ${cell(describeDefault(setting))} | ${cell(translate(setting.info))} |`);
  }
  return lines;
};

const schemaOf = (path) => {
  const match = read(path).match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/);
  return match ? JSON.parse(match[1]) : null;
};

const templateNames = {
  index: 'Home page',
  product: 'Product',
  collection: 'Collection',
  'list-collections': 'Collections list',
  search: 'Search',
  cart: 'Cart',
  blog: 'Blog',
  article: 'Blog post',
  page: 'Page',
  password: 'Password',
  404: 'Page not found',
};

const availability = (schema) => {
  if (schema.enabled_on?.templates) return `Only on: ${schema.enabled_on.templates.map((t) => templateNames[t] ?? t).join(', ')}`;
  if (schema.enabled_on?.groups) return `Only in the ${schema.enabled_on.groups.join(', ')} area`;
  if (schema.disabled_on?.templates) return `Any page except: ${schema.disabled_on.templates.map((t) => templateNames[t] ?? t).join(', ')}`;
  if (schema.presets) return 'Any page';
  return 'Added by the template';
};

const out = [
  '---',
  'title: "Settings reference"',
  'description: "Every Vermeil theme setting, section and block, with its type, default and notes."',
  '---',
  '',
  'Labels, defaults and notes on this page match the theme editor exactly.',
  '',
  '## Theme settings',
  '',
  'Open the theme editor and select **Theme settings** (the gear icon).',
];

for (const group of JSON.parse(read('config/settings_schema.json'))) {
  if (group.name === 'theme_info') continue;
  out.push('', `### ${translate(group.name)}`, ...settingsTable(group.settings));
}

const sections = readdirSync(join(root, 'sections'))
  .filter((f) => f.endsWith('.liquid'))
  .map((f) => [f, schemaOf(`sections/${f}`)])
  .filter(([, schema]) => schema && (schema.settings?.length || schema.blocks?.some((block) => block.settings?.length)))
  .sort(([, a], [, b]) => translate(a.name).localeCompare(translate(b.name)));

const themeBlocks = Object.fromEntries(
  readdirSync(join(root, 'blocks'))
    .filter((f) => f.endsWith('.liquid'))
    .map((f) => [f.replace('.liquid', ''), schemaOf(`blocks/${f}`)])
);

out.push('', '## Sections');
for (const [, schema] of sections) {
  out.push('', `### ${translate(schema.name)}`, '', availability(schema), ...settingsTable(schema.settings));
  const blocks = (schema.blocks ?? []).filter((block) => block.type !== '@app');
  const acceptsApps = (schema.blocks ?? []).some((block) => block.type === '@app');
  const shared = blocks.filter((block) => !block.name && themeBlocks[block.type]);
  const own = blocks.filter((block) => block.name);
  if (shared.length) out.push('', `Blocks: ${shared.map((block) => translate(themeBlocks[block.type].name)).join(', ')} (see Theme blocks).`);
  for (const block of own) {
    out.push('', `#### ${translate(block.name)} block`);
    out.push(...(block.settings?.length ? settingsTable(block.settings) : ['', 'No settings.']));
  }
  if (acceptsApps) out.push('', 'Accepts app blocks.');
}

out.push('', '## Theme blocks', '', 'These blocks are shared by the hero, slideshow, rich text and image with text sections.');
for (const [type, schema] of Object.entries(themeBlocks)) {
  if (!schema) continue;
  out.push('', `### ${translate(schema.name)}${type.startsWith('_') ? ' (slideshow only)' : ''}`, ...settingsTable(schema.settings));
}

const target = 'docs-site/src/content/docs/settings-reference.md';
mkdirSync(join(root, 'docs-site/src/content/docs'), { recursive: true });
writeFileSync(join(root, target), out.join('\n') + '\n');
console.log(`${target} (${sections.length} sections, ${Object.keys(themeBlocks).length} theme blocks)`);

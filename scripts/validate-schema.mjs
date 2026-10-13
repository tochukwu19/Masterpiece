import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const locale = JSON.parse(readFileSync(join(root, 'locales/en.default.schema.json'), 'utf8'));
const problems = [];

const translate = (key) => key.slice(2).split('.').reduce((node, part) => node?.[part], locale);
const britishSpelling = /\b(colour|favourite|centre|grey|organis|customis|personalis|optimis|behaviour|catalogue|licence)/i;

const checkText = (file, where, value) => {
  if (typeof value !== 'string') return;
  if (!value.startsWith('t:')) return problems.push(`${file}: ${where} is not translated ("${value}")`);
  const text = translate(value);
  if (typeof text !== 'string') return problems.push(`${file}: ${where} key ${value} is missing from en.default.schema.json`);
  if (britishSpelling.test(text)) problems.push(`${file}: ${where} uses British spelling ("${text}")`);
  if (text.replace(/\]\([^)]*\)/g, '').includes('&')) problems.push(`${file}: ${where} uses "&" ("${text}")`);
};

const checkRange = (file, setting) => {
  const { id, min, max, step = 1, default: value } = setting;
  const steps = (max - min) / step;
  if (!Number.isInteger(Math.round(steps * 1e6) / 1e6)) problems.push(`${file}: ${id} range ${min}-${max} is not divisible by step ${step}`);
  if (steps > 101) problems.push(`${file}: ${id} has ${steps} steps (max 101)`);
  if (value !== undefined && (value < min || value > max || Math.abs(((value - min) / step) % 1) > 1e-9)) problems.push(`${file}: ${id} default ${value} is not a step in ${min}-${max} by ${step}`);
};

const checkSettings = (file, settings = []) => {
  for (const setting of settings) {
    const where = setting.id ?? setting.type;
    if (setting.type === 'range') checkRange(file, setting);
    if (!['header', 'paragraph', 'color_scheme_group'].includes(setting.type) && !setting.label) problems.push(`${file}: ${where} has no label`);
    checkText(file, `${where} label`, setting.label);
    checkText(file, `${where} info`, setting.info);
    checkText(file, `${where} content`, setting.content);
    for (const option of setting.options ?? []) checkText(file, `${where} option ${option.value}`, option.label);
    if (typeof setting.default === 'string' && /lorem|ipsum/i.test(setting.default)) problems.push(`${file}: ${where} has a placeholder default`);
  }
};

for (const group of JSON.parse(readFileSync(join(root, 'config/settings_schema.json'), 'utf8'))) {
  if (group.name === 'theme_info') continue;
  checkText('config/settings_schema.json', 'group name', group.name);
  checkSettings('config/settings_schema.json', group.settings);
}

for (const dir of ['sections', 'blocks']) {
  let files = [];
  try { files = readdirSync(join(root, dir)).filter((f) => f.endsWith('.liquid')); } catch { continue; }
  for (const f of files) {
    const match = readFileSync(join(root, dir, f), 'utf8').match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/);
    if (!match) continue;
    const schema = JSON.parse(match[1]);
    const file = `${dir}/${f}`;
    checkText(file, 'name', schema.name);
    checkSettings(file, schema.settings);
    for (const block of schema.blocks ?? []) {
      checkText(`${file} [${block.type}]`, 'name', block.name);
      checkSettings(`${file} [${block.type}]`, block.settings);
    }
    for (const preset of schema.presets ?? []) checkText(file, 'preset name', preset.name);
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('Schema settings OK');

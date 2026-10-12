import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const problems = [];

const checkSettings = (file, settings = []) => {
  for (const setting of settings) {
    if (setting.type !== 'range') continue;
    const { id, min, max, step = 1, default: value } = setting;
    const steps = (max - min) / step;
    if (!Number.isInteger(Math.round(steps * 1e6) / 1e6)) problems.push(`${file}: ${id} range ${min}-${max} is not divisible by step ${step}`);
    if (steps > 101) problems.push(`${file}: ${id} has ${steps} steps (max 101)`);
    if (value !== undefined && (value < min || value > max || Math.abs(((value - min) / step) % 1) > 1e-9)) problems.push(`${file}: ${id} default ${value} is not a step in ${min}-${max} by ${step}`);
  }
};

for (const group of JSON.parse(readFileSync(join(root, 'config/settings_schema.json'), 'utf8'))) checkSettings('config/settings_schema.json', group.settings);

for (const dir of ['sections', 'blocks']) {
  let files = [];
  try { files = readdirSync(join(root, dir)).filter((f) => f.endsWith('.liquid')); } catch { continue; }
  for (const f of files) {
    const match = readFileSync(join(root, dir, f), 'utf8').match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/);
    if (!match) continue;
    const schema = JSON.parse(match[1]);
    const file = `${dir}/${f}`;
    checkSettings(file, schema.settings);
    for (const block of schema.blocks ?? []) checkSettings(`${file} [${block.type}]`, block.settings);
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('Schema ranges OK');

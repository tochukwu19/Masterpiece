import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const ref = process.argv[2] ?? 'HEAD';
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: 'inherit' });
const read = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, encoding: 'utf8' }).trim();

const tree = join(mkdtempSync(join(tmpdir(), 'vermeil-package-')), 'theme');
run('git', ['worktree', 'add', '--detach', tree, ref], root);

try {
  symlinkSync(join(root, 'node_modules'), join(tree, 'node_modules'));
  run('npm', ['run', '-s', 'check:all'], tree);
  run('npx', ['shopify', 'theme', 'package'], tree);

  const zip = readdirSync(tree).find((file) => file.endsWith('.zip'));
  const packaged = read('unzip', ['-Z1', zip], tree).split('\n').filter((path) => !path.endsWith('/')).sort();
  const tracked = read('git', ['ls-files', 'assets', 'blocks', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates'], tree)
    .split('\n')
    .sort();
  if (packaged.join('\n') !== tracked.join('\n')) throw new Error(`${zip} doesn't match the tracked theme files`);

  const demoContent = /shopify:\/\/shop_images|\.myshopify\.com/;
  const leaked = packaged.filter((path) => path.startsWith('templates/') && demoContent.test(readFileSync(join(tree, path), 'utf8')));
  if (leaked.length) throw new Error(`Demo content in ${leaked.join(', ')}`);

  copyFileSync(join(tree, zip), join(root, zip));
  console.log(`${zip} from ${read('git', ['rev-parse', '--short', ref], root)}: ${packaged.length} files`);
} finally {
  run('git', ['worktree', 'remove', '--force', tree], root);
}

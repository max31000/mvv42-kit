// Bundles src/styles/index.css into dist/styles.css: relative @imports are inlined, package @imports
// (the Inter font) are kept for the consumer's bundler to resolve.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const entry = resolve(root, 'src/styles/index.css');

function inline(file, seen = new Set()) {
  if (seen.has(file)) return '';
  seen.add(file);
  const css = readFileSync(file, 'utf8');
  return css.replace(/@import\s+['"](\.[^'"]+)['"];?/g, (_, rel) => inline(resolve(dirname(file), rel), seen));
}

const out = inline(entry);
const packageImports = [...out.matchAll(/@import\s+['"][^.][^'"]*['"];?\n?/g)].map((m) => m[0].trim());
const body = out.replace(/@import\s+['"][^.][^'"]*['"];?\n?/g, '');
const banner = `/* @mvv42/kit styles — import after @mantine/core/styles.css */\n`;
mkdirSync(resolve(root, 'dist'), { recursive: true });
writeFileSync(resolve(root, 'dist/styles.css'), banner + packageImports.join('\n') + '\n' + body);
console.log(`dist/styles.css (${(Buffer.byteLength(body) / 1024).toFixed(1)} KiB)`);

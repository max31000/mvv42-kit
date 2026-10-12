// Asserts one copy of react and @mantine/core in node_modules and that the build injected the colour-scheme script.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** All `node_modules/<name>` directories with a package.json, at any depth. */
function find(name) {
  const hits = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (!e.isDirectory() || e.name === '.bin' || e.name === 'dist' || e.name === 'src') continue;
      const p = join(dir, e.name);
      if (e.name === 'node_modules') {
        try {
          if (statSync(join(p, ...name.split('/'), 'package.json')).isFile()) hits.push(join(p, name));
        } catch {
          /* absent */
        }
      }
      walk(p);
    }
  };
  walk('.');
  return hits;
}

let failed = false;
for (const pkg of ['react', 'react-dom', '@mantine/core', '@mantine/hooks']) {
  const hits = find(pkg);
  console.log(`${pkg}: ${hits.length} copy(ies)${hits.length > 1 ? ' -> ' + hits.join(', ') : ''}`);
  if (hits.length !== 1) failed = true;
}
const html = readFileSync('dist/index.html', 'utf8');
if (!html.includes('mvv42-color-scheme')) {
  console.error('colour-scheme script missing from dist/index.html');
  failed = true;
}
const css = readdirSync('dist/assets').filter((f) => f.endsWith('.css'));
const cssText = css.map((f) => readFileSync(join('dist/assets', f), 'utf8')).join('');
if (!cssText.includes('--mvv-bg')) {
  console.error('kit tokens missing from the CSS bundle');
  failed = true;
}
if (!readdirSync('dist/assets').some((f) => f.endsWith('.woff2'))) {
  console.error('Inter font files missing from the bundle');
  failed = true;
}
process.exit(failed ? 1 : 0);

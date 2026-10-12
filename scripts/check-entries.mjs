// Verifies that each built entry, following its whole chunk import closure, only reaches allowed bare imports:
// the core and platform never pull react-router / recharts, the vite entry never pulls React or Mantine.
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const FORBIDDEN = {
  'index.js': [/^react-router(-dom)?$/, /^recharts$/],
  'platform.js': [/^react-router(-dom)?$/, /^recharts$/, /^@mantine\//],
  'vite.js': [/^react(-dom)?(\/.*)?$/, /^@mantine\//, /^react-router(-dom)?$/, /^recharts$/],
};
const IMPORT = /(?:^|[\s;])(?:import|export)\s*(?:[^'"]*?\sfrom\s*)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;

function closure(entry) {
  const seen = new Set();
  const bare = new Map();
  const visit = (file) => {
    if (seen.has(file)) return;
    seen.add(file);
    const code = readFileSync(file, 'utf8');
    for (const m of code.matchAll(IMPORT)) {
      const spec = m[1] ?? m[2];
      if (spec.startsWith('.')) visit(join(dirname(file), spec));
      else if (!bare.has(spec)) bare.set(spec, file);
    }
  };
  visit(join(dist, entry));
  return { files: seen.size, bare };
}

let failed = false;
for (const [entry, rules] of Object.entries(FORBIDDEN)) {
  const { files, bare } = closure(entry);
  const bad = [...bare].filter(([spec]) => rules.some((r) => r.test(spec)));
  console.log(`${entry}: ${files} file(s), imports ${[...bare.keys()].sort().join(', ') || '—'}`);
  for (const [spec, file] of bad) {
    console.error(`  ✗ ${spec} (via ${file.slice(dist.length + 1)})`);
    failed = true;
  }
}
process.exit(failed ? 1 : 0);

// Fails when the provider + Button app grows past the budget (minified JS, all chunks).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const BUDGET_KB = Number(process.env.SIZE_BUDGET_KB ?? 420);
const dir = 'dist-size/assets';
const js = readdirSync(dir).filter((f) => f.endsWith('.js'));
const bytes = js.reduce((n, f) => n + readFileSync(join(dir, f)).length, 0);
const gz = js.reduce((n, f) => n + gzipSync(readFileSync(join(dir, f))).length, 0);
const kb = (n) => (n / 1024).toFixed(1);
console.log(`provider + Button: ${kb(bytes)} kB min, ${kb(gz)} kB gzip (budget ${BUDGET_KB} kB min)`);
process.exit(bytes / 1024 > BUDGET_KB ? 1 : 0);

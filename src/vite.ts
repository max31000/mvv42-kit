/**
 * `@mvv42/kit/vite` (Node): `mvv42Html()` injects the anti-flash colour-scheme script into `index.html`.
 *
 *   import { mvv42Html } from '@mvv42/kit/vite';
 *   export default defineConfig({ plugins: [react(), mvv42Html()] });
 */
import type { Plugin } from 'vite';
import { colorSchemeInlineScript, colorSchemeInlineScriptSha256 } from './colorScheme/inline';

export { colorSchemeInlineScript, colorSchemeInlineScriptSha256 };
export { COLOR_SCHEME_KEY } from './colorScheme/constants';

export interface Mvv42HtmlOptions {
  /** Also add `<meta name="color-scheme" content="light dark">` if missing. Default true. */
  colorSchemeMeta?: boolean;
}

const CHARSET_META = /<meta\s+charset=["']?[^"'>\s]+["']?\s*\/?>/i;
const COLOR_SCHEME_META = /<meta[^>]+name=["']color-scheme["']/i;

/**
 * Puts `<script data-mvv42="color-scheme">` (and the color-scheme meta) right after `<meta charset>` — the
 * charset must stay first in <head>, the script must run before any stylesheet paints. Without a charset meta
 * the tags go into <head>. For a CSP, allow `colorSchemeInlineScriptSha256` in `script-src`.
 */
export function mvv42Html(options: Mvv42HtmlOptions = {}): Plugin {
  const withMeta = options.colorSchemeMeta ?? true;
  return {
    name: 'mvv42-html',
    transformIndexHtml(html) {
      const addMeta = withMeta && !COLOR_SCHEME_META.test(html);
      const script = `<script data-mvv42="color-scheme">${colorSchemeInlineScript}</script>`;
      const meta = addMeta ? '<meta name="color-scheme" content="light dark">' : '';
      const match = CHARSET_META.exec(html);
      if (match) {
        const at = match.index + match[0].length;
        return `${html.slice(0, at)}\n    ${meta}${meta ? '\n    ' : ''}${script}${html.slice(at)}`;
      }
      const tags: Array<{ tag: string; attrs?: Record<string, string>; children?: string; injectTo: 'head' }> = [
        { tag: 'script', attrs: { 'data-mvv42': 'color-scheme' }, children: colorSchemeInlineScript, injectTo: 'head' },
      ];
      if (addMeta) tags.push({ tag: 'meta', attrs: { name: 'color-scheme', content: 'light dark' }, injectTo: 'head' });
      return tags;
    },
  };
}

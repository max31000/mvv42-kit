/**
 * `@mvv42/kit/vite` (Node): `mvv42Html()` injects the anti-flash colour-scheme script into `index.html`.
 *
 *   import { mvv42Html } from '@mvv42/kit/vite';
 *   export default defineConfig({ plugins: [react(), mvv42Html()] });
 */
import type { Plugin } from 'vite';
import { colorSchemeInlineScript } from './colorScheme/inline';

export { colorSchemeInlineScript };
export { COLOR_SCHEME_KEY } from './colorScheme/constants';

export interface Mvv42HtmlOptions {
  /** Also add `<meta name="color-scheme" content="light dark">` if missing. Default true. */
  colorSchemeMeta?: boolean;
}

export function mvv42Html(options: Mvv42HtmlOptions = {}): Plugin {
  const withMeta = options.colorSchemeMeta ?? true;
  return {
    name: 'mvv42-html',
    transformIndexHtml(html) {
      const tags: Array<{ tag: string; attrs?: Record<string, string>; children?: string; injectTo: 'head-prepend' }> = [
        { tag: 'script', attrs: { 'data-mvv42': 'color-scheme' }, children: colorSchemeInlineScript, injectTo: 'head-prepend' },
      ];
      if (withMeta && !/<meta[^>]+name=["']color-scheme["']/i.test(html)) {
        tags.push({ tag: 'meta', attrs: { name: 'color-scheme', content: 'light dark' }, injectTo: 'head-prepend' });
      }
      return tags;
    },
  };
}

import { COLOR_SCHEME_KEY } from './constants';

/**
 * Inline `<head>` script that sets `data-mantine-color-scheme` on <html> before first paint, so neither the
 * shell nor a service flashes the wrong theme. Reads the shared key, falls back to the legacy keys
 * (`mantine-color-scheme-value`, then `cashpulse-settings` JSON `colorScheme`), then to the OS preference.
 * Inject with the `mvv42Html()` Vite plugin from `@mvv42/kit/vite` or paste into `index.html`.
 *
 * Pure string, no imports — safe to use from Node (Vite config) and the browser.
 */
export const colorSchemeInlineScript = `(function(){try{var d=document.documentElement,s=localStorage,ok=function(x){return x==='light'||x==='dark'||x==='auto'},v=s.getItem('${COLOR_SCHEME_KEY}');if(!ok(v)){v=s.getItem('mantine-color-scheme-value');if(!ok(v)){v='auto';try{var c=JSON.parse(s.getItem('cashpulse-settings')||'null');c=c&&(c.state&&c.state.colorScheme||c.colorScheme);if(ok(c))v=c;}catch(e){}}}if(v==='auto'){v=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}d.setAttribute('data-mantine-color-scheme',v);d.style.colorScheme=v;}catch(e){}})();`;

/**
 * CSP source for `colorSchemeInlineScript` — add `'<value>'` to `script-src`, e.g.
 * `script-src 'self' 'sha256-…'`. Kept in sync with the script by a unit test.
 */
export const colorSchemeInlineScriptSha256 = 'sha256-ZcaVJFYIVAnkUXiEq2ZbZrgHVGrV5Y8kNo8Z1qdRvwk=';

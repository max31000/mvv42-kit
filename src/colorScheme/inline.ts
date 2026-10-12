import { COLOR_SCHEME_KEY } from './constants';

/**
 * Inline `<head>` script that sets `data-mantine-color-scheme` on <html> before first paint, so neither the
 * shell nor a service flashes the wrong theme. Reads the shared key, falls back to the legacy Mantine key
 * (before the provider migrates it), then to the OS preference. Inject with the `mvv42Html()` Vite plugin
 * from `@mvv42/kit/vite` or paste into `index.html` as `<script>…</script>`.
 *
 * Pure string, no imports — safe to use from Node (Vite config) and the browser.
 */
export const colorSchemeInlineScript = `(function(){try{var d=document.documentElement,s=localStorage,v=s.getItem('${COLOR_SCHEME_KEY}');if(v!=='light'&&v!=='dark'&&v!=='auto'){var l=s.getItem('mantine-color-scheme-value');v=l==='light'||l==='dark'?l:'auto';}if(v==='auto'){v=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}d.setAttribute('data-mantine-color-scheme',v);d.style.colorScheme=v;}catch(e){}})();`;

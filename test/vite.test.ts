import { describe, expect, it } from 'vitest';
import { colorSchemeInlineScript, colorSchemeInlineScriptSha256, mvv42Html } from '../src/vite';

type Hook = (html: string) => unknown;
const transform = (html: string) => (mvv42Html().transformIndexHtml as Hook)(html);

describe('mvv42Html', () => {
  it('injects the script right after <meta charset>', () => {
    const html = '<!doctype html><html><head>\n<meta charset="UTF-8" />\n<title>x</title></head><body></body></html>';
    const out = transform(html) as string;
    expect(typeof out).toBe('string');
    const charset = out.indexOf('<meta charset="UTF-8" />');
    const script = out.indexOf(colorSchemeInlineScript);
    expect(script).toBeGreaterThan(charset);
    expect(script).toBeLessThan(out.indexOf('<title>'));
    expect(out).toContain('<meta name="color-scheme" content="light dark">');
  });

  it('keeps an existing color-scheme meta', () => {
    const html = '<head><meta charset="utf-8"><meta name="color-scheme" content="dark"></head>';
    const out = transform(html) as string;
    expect(out.match(/name="color-scheme"/g)).toHaveLength(1);
  });

  it('falls back to head tags without a charset meta', () => {
    const tags = transform('<html><head></head></html>') as Array<{ tag: string; injectTo: string; children?: string }>;
    expect(tags[0]).toMatchObject({ tag: 'script', injectTo: 'head', children: colorSchemeInlineScript });
  });

  it('re-exports the CSP hash', () => {
    expect(colorSchemeInlineScriptSha256).toMatch(/^sha256-[A-Za-z0-9+/]+=*$/);
  });
});

describe('README', () => {
  it('carries the exact inline script and its CSP hash', async () => {
    const { readFileSync } = await import('node:fs');
    const readme = readFileSync(`${process.cwd()}/README.md`, 'utf8');
    expect(readme).toContain(`<script data-mvv42="color-scheme">${colorSchemeInlineScript}</script>`);
    expect(readme).toContain(colorSchemeInlineScriptSha256);
  });
});

const TRUSTED_HOSTS = [/^t\.me$/, /^([a-z0-9-]+\.)*telegram\.org$/, /^cdn\d*\.telegram-cdn\.org$/];

/**
 * Returns `url` only when it is an `https:` Telegram avatar (`t.me`, `*.telegram.org`, `cdn*.telegram-cdn.org`),
 * otherwise `null` — callers then show initials. Guards against tracking pixels / mixed content in `photoUrl`.
 */
export function safeAvatarUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return null;
  const host = parsed.hostname.toLowerCase();
  return TRUSTED_HOSTS.some((re) => re.test(host)) ? url : null;
}

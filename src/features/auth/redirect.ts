/**
 * Where to go after signing in: the page that was asked for, carried in ?redirect=.
 *
 * Only paths of this app are accepted. Otherwise a link such as
 * /login?redirect=https://evil.example would send a freshly signed-in user to another
 * site (an "open redirect", a classic phishing helper). "//evil.example" and
 * "/\evil.example" are also read as other sites by browsers.
 */
export function safeRedirect(value: unknown): string | null {
  if (typeof value !== 'string') return null
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return null
  return value
}

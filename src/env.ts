// Centralized environment helper to safely access Vite-provided variables.
// Uses fallback defaults for robustness in tests / SSR-like contexts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const meta: any = typeof import.meta !== 'undefined' ? import.meta : {}
const base = (meta.env && typeof meta.env.BASE_URL === 'string' ? meta.env.BASE_URL : '/')

export const ENV = {
  BASE_URL: base,
}

export function withBase(path: string) {
  if (!path) return ENV.BASE_URL
  // Ensure exactly one slash between base and path
  const b = ENV.BASE_URL.endsWith('/') ? ENV.BASE_URL : ENV.BASE_URL + '/'
  return path.startsWith('/') ? b + path.slice(1) : b + path
}

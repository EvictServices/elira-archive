/** Base URL for the bot/cluster HTTP API (no trailing slash). */
export const CLUSTER_API_BASE =
  (typeof process !== 'undefined' &&
    process.env.CLUSTER_API_URL &&
    String(process.env.CLUSTER_API_URL).replace(/\/$/, '')) ||
  'http://127.0.0.1:8000'

export function clusterUrl(path: string): string {
  const base = CLUSTER_API_BASE
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

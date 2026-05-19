/** Discord user/guild snowflake (17–20 digits). */
export const SNOWFLAKE_RE = /^\d{17,20}$/

/** Channel/category snowflake (slightly wider range used in script templates). */
export const CHANNEL_SNOWFLAKE_RE = /^\d{15,22}$/

export function isSnowflake(id: string): boolean {
  return typeof id === 'string' && SNOWFLAKE_RE.test(id.trim())
}

/** @deprecated Prefer `isSnowflake` */
export const isValidGuildSnowflake = isSnowflake

export function normalizeSnowflake(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null
  const id = String(raw).trim()
  if (!SNOWFLAKE_RE.test(id)) return null
  return id
}

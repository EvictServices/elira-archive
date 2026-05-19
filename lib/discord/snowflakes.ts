/** Discord user/guild snowflake (17–20 digits). */
export const SNOWFLAKE_RE = /^\d{17,20}$/

export function isSnowflake(id: string): boolean {
  return typeof id === 'string' && SNOWFLAKE_RE.test(id.trim())
}


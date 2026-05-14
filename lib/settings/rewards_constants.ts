/** Plain-text defaults (Elara `Settings._default_template` / `VanitySettings._default_template`). */
export const TAG_REWARDS_DEFAULT_TEMPLATE =
  'thank you {user.mention} for representing **{guild.name}** on your profile'

export function vanityRewardsDefaultTemplate(vanitySlug: string): string {
  return `thank you {user.mention} for repping /${vanitySlug}`
}

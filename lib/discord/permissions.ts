export const PERMISSIONS = {
  KICK_MEMBERS: 1n << 1n,
  BAN_MEMBERS: 1n << 2n,
  ADMINISTRATOR: 1n << 3n,
  MANAGE_CHANNELS: 1n << 4n,
  MANAGE_GUILD: 1n << 5n,
  MANAGE_MESSAGES: 1n << 13n,
  MENTION_EVERYONE: 1n << 17n,
  MANAGE_ROLES: 1n << 28n,
  MANAGE_WEBHOOKS: 1n << 29n,
  MANAGE_EMOJIS_AND_STICKERS: 1n << 30n,
  MANAGE_THREADS: 1n << 34n,
  MODERATE_MEMBERS: 1n << 40n,
} as const

export type PermissionName = keyof typeof PERMISSIONS

export const DANGEROUS_PERMISSIONS: PermissionName[] = [
  'ADMINISTRATOR',
  'MANAGE_GUILD',
  'MANAGE_ROLES',
  'MANAGE_CHANNELS',
  'MANAGE_WEBHOOKS',
  'MANAGE_MESSAGES',
  'BAN_MEMBERS',
  'KICK_MEMBERS',
  'MENTION_EVERYONE',
  'MANAGE_THREADS',
  'MODERATE_MEMBERS',
  'MANAGE_EMOJIS_AND_STICKERS',
]

const DANGEROUS_MASK = DANGEROUS_PERMISSIONS.reduce(
  (acc, name) => acc | PERMISSIONS[name],
  0n
)

function toBigInt(permissions: string | number | bigint): bigint {
  if (typeof permissions === 'bigint') return permissions
  try {
    return BigInt(permissions)
  } catch {
    return 0n
  }
}

export function getDangerousPermissions(
  permissions: string | number | bigint
): PermissionName[] {
  const bits = toBigInt(permissions)
  return DANGEROUS_PERMISSIONS.filter((name) => (bits & PERMISSIONS[name]) !== 0n)
}

export function hasDangerousPermissions(
  permissions: string | number | bigint
): boolean {
  return (toBigInt(permissions) & DANGEROUS_MASK) !== 0n
}

const PERMISSION_LABELS: Record<PermissionName, string> = {
  KICK_MEMBERS: 'Kick Members',
  BAN_MEMBERS: 'Ban Members',
  ADMINISTRATOR: 'Administrator',
  MANAGE_CHANNELS: 'Manage Channels',
  MANAGE_GUILD: 'Manage Server',
  MANAGE_MESSAGES: 'Manage Messages',
  MENTION_EVERYONE: 'Mention Everyone',
  MANAGE_ROLES: 'Manage Roles',
  MANAGE_WEBHOOKS: 'Manage Webhooks',
  MANAGE_EMOJIS_AND_STICKERS: 'Manage Emojis & Stickers',
  MANAGE_THREADS: 'Manage Threads',
  MODERATE_MEMBERS: 'Timeout Members',
}

export function permissionLabel(name: PermissionName): string {
  return PERMISSION_LABELS[name] ?? name
}

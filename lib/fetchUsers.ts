type UserInfo = { username?: string; avatar?: string; bot?: boolean; discriminator?: string }

export async function fetchUserInfoBatch(userIds: string[]): Promise<Map<string, UserInfo>> {
  const result = new Map<string, UserInfo>()
  if (userIds.length === 0) return result

  try {
    const response = await fetch('http://127.0.0.1:8000/users/find', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_ids: userIds }),
      next: { revalidate: 60 },
    })

    if (!response.ok) return result

    const data = await response.json()
    if (Array.isArray(data)) {
      data.forEach((user: { id?: string } & UserInfo) => {
        if (user?.id) result.set(user.id, user)
      })
    }
  } catch {
    return result
  }

  return result
}

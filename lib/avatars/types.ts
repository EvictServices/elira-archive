export type AvatarRecord = {
  id: number
  url: string
  created_at: number
}

export type AvatarUserInfo = {
  display_name?: string
  username?: string
  avatar?: string | null
}

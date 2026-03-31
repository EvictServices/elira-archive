export interface Message {
  id: string
  author_id: string
  content: string
  timestamp: string
  edited_timestamp: string | null
  pinned: boolean
}

export interface User {
  id: string
  username: string
  global_name: string | null
  discriminator: string
  avatar: string | null
  bot: boolean
}

export interface Attachment {
  filename: string
  url: string
  file_size: number
  message_id: string
}

export interface EmbedField {
  name: string
  value: string
  inline: boolean
}

export interface Embed {
  author: { icon_url: string | null; name: string | null; url: string | null } | null
  color: string | null
  description: string | null
  fields: EmbedField[]
  footer: { icon_url: string | null; text: string | null } | null
  image: { url: string | null } | null
  message_id: string
  thumbnail: { url: string | null } | null
  timestamp: string | null
  title: string | null
  url: string | null
}

export interface TicketData {
  ticket: {
    messages: Message[]
    users: User[]
    attachments: Attachment[]
    embeds: Embed[]
    ticket: {
      reason: string | null
      closed_by_id: string | null
      opened_by_id: string | null
      closed_at: string | null
    }
    channel: {
      name: string
      created_at: string
    }
  }
  people: string[]
}

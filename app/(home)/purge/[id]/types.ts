export type { Message, User, Attachment, Embed, EmbedField } from '../../tickets/[id]/types'

export interface PurgeData {
  purge: {
    messages: import('../../tickets/[id]/types').Message[]
    users: import('../../tickets/[id]/types').User[]
    attachments: import('../../tickets/[id]/types').Attachment[]
    embeds: import('../../tickets/[id]/types').Embed[]
    moderator_id: string | null
    message_count: number
    channel: {
      id: string
      name: string
      type: string
    }
    guild: {
      id: string
      name: string
    }
  }
  people: string[]
}

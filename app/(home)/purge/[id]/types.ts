export type { Message, User, Attachment, Embed, EmbedField } from '../../tickets/[id]/types'

export interface PurgeData {
  purge: {
    messages: import('../../tickets/[id]/types').Message[]
    users: import('../../tickets/[id]/types').User[]
    attachments: import('../../tickets/[id]/types').Attachment[]
    embeds: import('../../tickets/[id]/types').Embed[]
    purge: {
      purged_by_id: string | null
      amount: number
      purged_at: string | null
    }
    channel: {
      name: string
      created_at: string
    }
  }
}

export const BUTTON_STYLES = [
  { value: 'link', label: 'Link' },
  { value: 'blurple', label: 'Blurple' },
  { value: 'green', label: 'Green' },
  { value: 'grey', label: 'Grey' },
  { value: 'red', label: 'Red' },
]

export const BUTTON_STYLE_COLORS: Record<string, string> = {
  link: '#5865f2',
  blurple: '#5865f2',
  blue: '#5865f2',
  primary: '#5865f2',
  green: '#57f287',
  success: '#57f287',
  grey: '#4f545c',
  gray: '#4f545c',
  secondary: '#4f545c',
  red: '#ed4245',
  danger: '#ed4245',
}

export const VARIABLES = [
  { category: 'User', vars: [
    '{user}', '{user.id}', '{user.name}', '{user.mention}', '{user.avatar}',
    '{user.display_avatar}', '{user.display_name}', '{user.discriminator}',
    '{user.created_at}', '{user.created_at_timestamp}', '{user.bot}',
    '{user.joined_at}', '{user.joined_at_timestamp}', '{user.boost}',
    '{user.boost_since}', '{user.color}', '{user.top_role}',
    '{user.role_list}', '{user.join_position}', '{user.join_position_suffix}',
    '{user.guild_avatar}',
  ]},
  { category: 'Server', vars: [
    '{guild.name}', '{guild.id}', '{guild.count}', '{guild.icon}',
    '{guild.banner}', '{guild.boost_count}', '{guild.boost_tier}',
    '{guild.owner_id}', '{guild.created_at}', '{guild.emoji_count}',
    '{guild.role_count}', '{guild.channels_count}', '{guild.shard}',
  ]},
  { category: 'Channel', vars: [
    '{channel.name}', '{channel.id}', '{channel.mention}',
    '{channel.type}', '{channel.topic}', '{channel.position}',
    '{channel.category_name}', '{channel.slowmode_delay}',
  ]},
  { category: 'Moderator', vars: [
    '{moderator}', '{moderator.mention}', '{moderator.name}',
    '{moderator.display_name}', '{moderator.id}', '{moderator.avatar}',
    '{moderator.display_avatar}',
  ]},
  { category: 'Invoke', vars: [
    '{reason}',
  ]},
]

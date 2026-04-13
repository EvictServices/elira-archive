# Evict

The website and dashboard for [Evict](https://evict.bot) — a free, all-in-one Discord bot for seamless server management.

Built with **Next.js 16**, **React 19**, **TypeScript**, and **PostgreSQL**.

## Pages

| Route | Description |
| --- | --- |
| `/` | Landing page with feature highlights, stats, and CTA |
| `/commands` | Searchable command catalog with categories and permissions |
| `/embeds` | Interactive Discord embed builder with live preview |
| `/updates` | Changelog and release notes timeline |
| `/status` | Real-time cluster health, shard info, and performance charts |
| `/tickets/:id` | Support ticket transcript viewer |
| `/purge/:id` | Bulk message deletion transcript viewer |
| `/avatars/:id` | User avatar history gallery |

## API Routes

| Endpoint | Description |
| --- | --- |
| `/api/commands` | Proxies bot command data from the backend |
| `/api/status` | Proxies system health and metrics |
| `/api/health` | Health check |
| `/api/leaderboard/:id` | Server leaderboard data |
| `/api/top-commands` | Top command usage stats |

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Production

Managed with PM2 via `ecosystem.config.js`:

```bash
pm2 start ecosystem.config.js
```

## Requirements

- Node.js 20+
- PostgreSQL (local, port 5432)
- Backend API running on port 8000
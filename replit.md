# Dragon's Den Music Bot

A Discord music bot in the style of Groovy, built with discord.js + lavalink-client. Plays music from YouTube, Spotify, SoundCloud and more via a Lavalink audio node.

## Run & Operate

- `pnpm --filter @workspace/music-bot run dev` — start the bot (watch mode)
- `pnpm --filter @workspace/music-bot run deploy-commands` — register global slash commands (run once after adding/changing commands)
- `pnpm --filter @workspace/music-bot run typecheck` — typecheck the bot

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Discord: discord.js v14
- Audio: lavalink-client v2 (Lavalink v4 protocol)
- Lavalink node: lavalinkv4.serenetia.com:80 (primary) + fallback public nodes

## Slash Commands

| Command | Description |
|---|---|
| `/play <query>` | Play a song or playlist (YouTube, Spotify, SoundCloud, URLs) |
| `/search <query>` | Search and pick from a list of results |
| `/skip [amount]` | Skip current song (or multiple) |
| `/stop` | Stop and clear the queue |
| `/pause` | Pause playback |
| `/resume` | Resume playback |
| `/nowplaying` | Show current song with progress bar |
| `/queue [page]` | Browse the queue |
| `/volume [level]` | Get or set volume (1-100) |
| `/loop <mode>` | Loop: off / track / queue |
| `/shuffle` | Shuffle the queue |
| `/seek <time>` | Seek to position (e.g. `1:30` or `90`) |
| `/remove <position>` | Remove a song from the queue |
| `/move <from> <to>` | Move a song in the queue |
| `/disconnect` | Disconnect from voice channel |

## Branding

- Name: Dragon's Den
- Logo: `attached_assets/IMG_1354_1784506472442.jpeg` (set as bot avatar on startup)
- Brand color: `#7B2FBE` (deep violet)

## Where things live

- `artifacts/music-bot/src/index.ts` — entry point, Lavalink + Discord client setup
- `artifacts/music-bot/src/commands/` — all slash command handlers
- `artifacts/music-bot/src/events/` — Discord and Lavalink event handlers
- `artifacts/music-bot/src/utils/` — embeds, duration formatting

## Environment

- `DISCORD_TOKEN` — bot token (Replit Secret)
- `DISCORD_CLIENT_ID` — bot application ID (env var, shared)
- `LAVALINK_HOST` / `LAVALINK_PORT` / `LAVALINK_PASS` / `LAVALINK_SECURE` — override the Lavalink node (optional)

## Architecture decisions

- Global slash commands only — no guild-specific registration, works in all servers
- Multiple Lavalink nodes configured for fallback if primary goes down
- Bot auto-disconnects after 30s alone in voice, and 5 min after queue ends
- Avatar is set programmatically from `attached_assets/IMG_1354_1784506472442.jpeg` on every startup

## User preferences

- Bot name: Dragon's Den
- Global slash commands (not guild-specific)
- Lavalink node: lavalinkv4.serenetia.com:80, password: https://seretia.link/discord

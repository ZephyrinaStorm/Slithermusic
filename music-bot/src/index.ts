import "dotenv/config";
import { LavalinkManager } from "lavalink-client";
import { BotClient } from "./types.js";
import { commands } from "./commands/index.js";
import { registerReadyEvent } from "./events/ready.js";
import { registerInteractionEvent } from "./events/interactionCreate.js";
import { registerVoiceStateEvent } from "./events/voiceStateUpdate.js";
import { registerLavalinkEvents } from "./events/lavalinkEvents.js";

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

if (!token) throw new Error("Missing DISCORD_TOKEN environment variable");
if (!clientId) throw new Error("Missing DISCORD_CLIENT_ID environment variable");

// ─── Build Lavalink node list ────────────────────────────────────────────────
const nodes = [
  {
    id: "serenetia",
    host: "lavalinkv4.serenetia.com",
    port: 443,
    authorization: "https://seretia.link/discord",
    secure: true,
    retryAmount: 10,
    retryDelay: 5000,
    // Count retries in a rolling window so temporary provider outages do not
    // permanently remove the only audio node from the manager.
    retryTimespan: 30_000,
  },
];

// ─── Create client ────────────────────────────────────────────────────────────
const client = new BotClient();

// ─── Attach Lavalink manager ──────────────────────────────────────────────────
client.lavalink = new LavalinkManager({
  nodes,
  sendToShard: (guildId, payload) => {
    const guild = client.guilds.cache.get(guildId);
    if (guild) guild.shard.send(payload);
  },
  client: {
    id: clientId,
    username: "Slither Music",
  },
  playerOptions: {
    defaultSearchPlatform: "ytmsearch",
    volumeDecrementer: 0.75,
    onDisconnect: {
      autoReconnect: true,
      destroyPlayer: false,
    },
    onEmptyQueue: {
      destroyAfterMs: 5 * 60 * 1000, // 5 minutes
    },
  },
  autoSkipOnResolveError: true,
  emitNewSongsOnly: true,
  linksAllowed: true,
});

// ─── Register commands ────────────────────────────────────────────────────────
for (const command of commands) {
  client.commands.set(command.data.name, command);
}

// ─── Register events ──────────────────────────────────────────────────────────
registerReadyEvent(client);
registerInteractionEvent(client);
registerVoiceStateEvent(client);
registerLavalinkEvents(client);

// Forward Discord raw events to Lavalink (required for voice)
client.on("raw", (data) => client.lavalink.sendRawData(data));

// ─── Login ────────────────────────────────────────────────────────────────────
client.login(token).catch((err) => {
  console.error("❌ Failed to login:", err.message);
  process.exit(1);
});

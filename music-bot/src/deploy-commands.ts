/**
 * Register global slash commands with Discord.
 * Global commands are available in all servers and DMs.
 * They take up to 1 hour to propagate after first registration;
 * updates after that are usually instant.
 *
 * Run with:
 *   pnpm --filter @workspace/music-bot run deploy-commands
 */
import "dotenv/config";
import { REST, Routes } from "discord.js";
import { commands } from "./commands/index.js";

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

if (!token) throw new Error("Missing DISCORD_TOKEN");
if (!clientId) throw new Error("Missing DISCORD_CLIENT_ID");

const rest = new REST({ version: "10" }).setToken(token);
const bodies = commands.map((cmd) => cmd.data.toJSON());

(async () => {
  console.log(`🐍 Slither Music — Registering ${bodies.length} global slash commands…`);
  await rest.put(Routes.applicationCommands(clientId), { body: bodies });
  console.log(`✅ ${bodies.length} global slash commands registered! (may take up to 1 hour to appear in new servers)`);
})();

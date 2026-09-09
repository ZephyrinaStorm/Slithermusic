import { Events, ActivityType } from "discord.js";
import { readFileSync } from "fs";
import { resolve } from "path";
import { BotClient } from "../types.js";

// Resolve logo relative to workspace root
const LOGO_PATH = resolve(process.cwd(), "../../attached_assets/IMG_1354_1784506472442.jpeg");

export function registerReadyEvent(client: BotClient) {
  client.once(Events.ClientReady, async (readyClient) => {
    console.log(`✅ Logged in as ${readyClient.user.tag}`);

    // Set Dragon's Den activity
    readyClient.user.setActivity("SlitherMusic", { type: ActivityType.Playing });

    // Set bot avatar to the Dragon's Den logo
    try {
      const avatarBuffer = readFileSync(LOGO_PATH);
      await readyClient.user.setAvatar(avatarBuffer);
      console.log("✅ Bot avatar updated to Dragon's Den logo");
    } catch (err) {
      console.warn("⚠️ Could not update avatar (rate limit or invalid image):", (err as Error).message);
    }

    // Initialize Lavalink
    try {
      await client.lavalink.init({ id: readyClient.user.id, username: readyClient.user.username });
      console.log("✅ Lavalink manager initialized");
    } catch (err) {
      console.error("❌ Failed to initialize Lavalink:", err);
    }
  });
}

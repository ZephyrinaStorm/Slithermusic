import { EmbedBuilder, TextChannel } from "discord.js";
import { LavalinkNode } from "lavalink-client";
import { BotClient } from "../types.js";
import { formatDuration } from "../utils/duration.js";
import { addToHistory, pushPrevious, getSettings } from "../stores.js";

export function registerLavalinkEvents(client: BotClient) {
  const lm = client.lavalink;

  // ─── Node events (on nodeManager) ─────────────────────────────────────────
  lm.nodeManager.on("connect", (node: LavalinkNode) => {
    console.log(`✅ Lavalink node connected: ${node.id} (${node.options.host}:${node.options.port})`);
  });

  lm.nodeManager.on("error", (node: LavalinkNode, error: Error) => {
    console.error(`❌ Lavalink node error [${node.id}]:`, error?.message ?? error);
  });

  lm.nodeManager.on("disconnect", (node: LavalinkNode, reason: { code?: number; reason?: string }) => {
    console.warn(`⚠️ Lavalink node disconnected [${node.id}]: code ${reason?.code}`);
  });

  lm.nodeManager.on("reconnecting", (node: LavalinkNode) => {
    console.log(`🔄 Lavalink node reconnecting: ${node.id}`);
  });

  // ─── Player / track events (on lm directly) ────────────────────────────────
  lm.on("trackStart", async (player, track) => {
    if (!track) return;

    // Track history & previous stack for /history and /previous
    addToHistory(player.guildId, track);
    pushPrevious(player.guildId, track);

    // Respect announcement toggle
    const settings = getSettings(player.guildId);
    if (!settings.announcements) return;

    const channel = client.channels.cache.get(player.textChannelId ?? "") as TextChannel | undefined;
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(0x7b2fbe)
      .setTitle("▶️ Now Playing")
      .setFooter({ text: "Dragon's Den Music" })
      .setDescription(
        `**[${track.info.title}](${track.info.uri})**\n` +
        `🎤 ${track.info.author}\n` +
        `⏱️ ${track.info.isStream ? "🔴 LIVE" : formatDuration(track.info.duration ?? 0)}`
      )
      .addFields(
        { name: "Volume", value: `${player.volume}%`, inline: true },
        { name: "Queue", value: `${player.queue.tracks.length} remaining`, inline: true },
        {
          name: "Requested by",
          value: `<@${(track.requester as { id?: string } | undefined)?.id ?? "Unknown"}>`,
          inline: true,
        }
      )
      .setFooter({ text: `Source: ${capitalise(track.info.sourceName ?? "Unknown")}` });

    if (track.info.artworkUrl) embed.setThumbnail(track.info.artworkUrl);

    channel.send({ embeds: [embed] }).catch(() => null);
  });

  lm.on("trackError", async (player, track, payload) => {
    const channel = client.channels.cache.get(player.textChannelId ?? "") as TextChannel | undefined;
    const title = track?.info.title ?? "track";
    const msg = (payload as { exception?: { message?: string } }).exception?.message ?? "Unknown error";
    channel?.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0xed4245)
          .setDescription(`❌ Error playing **${title}**: ${msg}. Skipping…`),
      ],
    }).catch(() => null);
  });

  lm.on("queueEnd", async (player) => {
    const channel = client.channels.cache.get(player.textChannelId ?? "") as TextChannel | undefined;
    channel?.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0x7b2fbe)
          .setFooter({ text: "Dragon's Den Music" })
          .setDescription("✅ Queue finished. Add more songs with `/play`!"),
      ],
    }).catch(() => null);

    // Auto-destroy after 5 minutes of inactivity
    setTimeout(async () => {
      if (!player.playing && !player.paused && player.queue.tracks.length === 0) {
        await player.destroy();
      }
    }, 5 * 60 * 1000);
  });

  lm.on("playerDestroy", (player) => {
    console.log(`🔇 Player destroyed for guild: ${player.guildId}`);
  });
}

function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

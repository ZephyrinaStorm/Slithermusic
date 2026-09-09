import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Command, BotClient } from "../types.js";
import { errorEmbed } from "../utils/embeds.js";

interface LrclibResult {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  plainLyrics: string | null;
  syncedLyrics: string | null;
}

async function fetchLyrics(query: string): Promise<LrclibResult | null> {
  try {
    const url = `https://lrclib.net/api/search?q=${encodeURIComponent(query)}&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as LrclibResult[];
    return data?.[0] ?? null;
  } catch {
    return null;
  }
}

function splitLyrics(text: string, maxLen = 4000): string[] {
  const chunks: string[] = [];
  let current = "";
  for (const line of text.split("\n")) {
    if ((current + "\n" + line).length > maxLen) {
      chunks.push(current);
      current = line;
    } else {
      current += (current ? "\n" : "") + line;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

// ─── 1. /lyrics ──────────────────────────────────────────────────────────────
export const lyricsCmd: Command = {
  data: new SlashCommandBuilder().setName("lyrics").setDescription("Fetch lyrics for the current or a specified song")
    .addStringOption(o => o.setName("query").setDescription("Song title (default: current song)")),
  async execute(i, c) {
    await i.deferReply();
    const player = c.lavalink.getPlayer(i.guildId!);
    const query = i.options.getString("query") ?? player?.queue.current?.info.title;
    if (!query) return i.editReply({ embeds: [errorEmbed("No song playing and no query provided.")] });

    const result = await fetchLyrics(query);
    if (!result?.plainLyrics) return i.editReply({ embeds: [errorEmbed(`No lyrics found for **${query}**.`)] });

    const chunks = splitLyrics(result.plainLyrics);
    const first = new EmbedBuilder().setColor(0x7b2fbe)
      .setTitle(`📝 ${result.trackName} — ${result.artistName}`)
      .setDescription(chunks[0])
      .setFooter({ text: `Lyrics via lrclib.net · Dragon's Den Music` });
    await i.editReply({ embeds: [first] });

    for (let idx = 1; idx < Math.min(chunks.length, 3); idx++) {
      await i.followUp({ embeds: [new EmbedBuilder().setColor(0x7b2fbe).setDescription(chunks[idx]).setFooter({ text: `Page ${idx + 1}/${chunks.length} · Dragon's Den Music` })] });
    }
    return;
  },
};

// ─── 2. /synclyrics ──────────────────────────────────────────────────────────
export const syncLyricsCmd: Command = {
  data: new SlashCommandBuilder().setName("synclyrics").setDescription("Fetch time-synced (LRC) lyrics for the current or specified song")
    .addStringOption(o => o.setName("query").setDescription("Song title (default: current song)")),
  async execute(i, c) {
    await i.deferReply();
    const player = c.lavalink.getPlayer(i.guildId!);
    const query = i.options.getString("query") ?? player?.queue.current?.info.title;
    if (!query) return i.editReply({ embeds: [errorEmbed("No song playing and no query provided.")] });

    const result = await fetchLyrics(query);
    if (!result) return i.editReply({ embeds: [errorEmbed(`No lyrics found for **${query}**.`)] });

    const lrc = result.syncedLyrics ?? result.plainLyrics;
    if (!lrc) return i.editReply({ embeds: [errorEmbed(`No synced lyrics found for **${query}**. Try \`/lyrics\` instead.`)] });

    // Strip timestamps for display if synced format
    const cleaned = lrc.replace(/\[\d+:\d+\.\d+\]/g, "").trim();
    const chunks = splitLyrics(cleaned);

    const first = new EmbedBuilder().setColor(0x7b2fbe)
      .setTitle(`🎵 ${result.trackName} — ${result.artistName}`)
      .setDescription(chunks[0])
      .setFooter({ text: `${result.syncedLyrics ? "Synced" : "Plain"} lyrics · lrclib.net · Dragon's Den Music` });
    await i.editReply({ embeds: [first] });

    for (let idx = 1; idx < Math.min(chunks.length, 3); idx++) {
      await i.followUp({ embeds: [new EmbedBuilder().setColor(0x7b2fbe).setDescription(chunks[idx]).setFooter({ text: `Page ${idx + 1}/${chunks.length} · Dragon's Den Music` })] });
    }
    return;
  },
};

export const lyricsCommands: Command[] = [lyricsCmd, syncLyricsCmd];

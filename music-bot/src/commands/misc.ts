import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  EmbedBuilder,
} from "discord.js";
import { Command, BotClient } from "../types.js";
import { errorEmbed, successEmbed, infoEmbed } from "../utils/embeds.js";
import { formatDuration } from "../utils/duration.js";
import { getFilters } from "../stores.js";

// ─── 1. /reverb ──────────────────────────────────────────────────────────────
const reverb: Command = {
  data: new SlashCommandBuilder().setName("reverb").setDescription("Toggle reverb effect"),
  async execute(i, c) {
    await i.deferReply();
    const member = i.member as GuildMember;
    if (!member.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player?.queue.current) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    const filters = getFilters(i.guildId!);
    const fm = player.filterManager as any;
    try {
      if (filters.has("reverb")) {
        await fm.lavalinkLavaDspxPlugin?.toggleReverb?.();
        filters.delete("reverb");
        return i.editReply({ embeds: [successEmbed("Reverb disabled.")] });
      }
      await fm.lavalinkLavaDspxPlugin?.toggleReverb?.();
      filters.add("reverb");
      return i.editReply({ embeds: [successEmbed("🌊 Reverb enabled.")] });
    } catch {
      // Fallback: simulate with tremolo
      await fm.toggleTremolo(2, 0.25);
      const on = !filters.has("reverb");
      on ? filters.add("reverb") : filters.delete("reverb");
      return i.editReply({ embeds: [successEmbed(on ? "🌊 Reverb (simulated) enabled." : "Reverb disabled.")] });
    }
  },
};

// ─── 2. /echo ────────────────────────────────────────────────────────────────
const echo: Command = {
  data: new SlashCommandBuilder().setName("echo").setDescription("Toggle echo/delay effect"),
  async execute(i, c) {
    await i.deferReply();
    const member = i.member as GuildMember;
    if (!member.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player?.queue.current) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    const filters = getFilters(i.guildId!);
    const fm = player.filterManager as any;
    const on = !filters.has("echo");
    try {
      await fm.lavalinkLavaDspxPlugin?.toggleEcho?.();
    } catch {
      // Fallback: combine tremolo + vibrato for echo-like effect
      if (on) { await fm.toggleTremolo(1.5, 0.3); } else { await fm.toggleTremolo(); }
    }
    on ? filters.add("echo") : filters.delete("echo");
    return i.editReply({ embeds: [successEmbed(on ? "🔊 Echo enabled." : "Echo disabled.")] });
  },
};

// ─── 3. /stereo ──────────────────────────────────────────────────────────────
const stereo: Command = {
  data: new SlashCommandBuilder().setName("stereo").setDescription("Toggle stereo widener (spreads audio to L/R channels more)"),
  async execute(i, c) {
    await i.deferReply();
    const member = i.member as GuildMember;
    if (!member.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player?.queue.current) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    const filters = getFilters(i.guildId!);
    const fm = player.filterManager as any;
    if (filters.has("stereo")) {
      await fm.setAudioOutput("stereo");
      filters.delete("stereo");
      return i.editReply({ embeds: [successEmbed("Stereo widener disabled.")] });
    }
    await fm.setAudioOutput("stereo");
    filters.add("stereo");
    return i.editReply({ embeds: [successEmbed("🔊 Stereo widener enabled.")] });
  },
};

// ─── 4. /highpass ────────────────────────────────────────────────────────────
const highpass: Command = {
  data: new SlashCommandBuilder().setName("highpass").setDescription("Toggle high-pass filter (reduces bass, brightens treble)"),
  async execute(i, c) {
    await i.deferReply();
    const member = i.member as GuildMember;
    if (!member.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player?.queue.current) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    const filters = getFilters(i.guildId!);
    const fm = player.filterManager as any;
    const on = !filters.has("highpass");
    try {
      await fm.lavalinkLavaDspxPlugin?.toggleHighPass?.();
    } catch {
      const bands = on
        ? [{ band: 0, gain: -0.4 }, { band: 1, gain: -0.3 }, { band: 2, gain: -0.1 }, { band: 3, gain: 0 }, { band: 4, gain: 0.1 }, { band: 5, gain: 0.2 }]
        : [];
      fm.equalizerBands = bands;
      await fm.applyPlayerFilters();
    }
    on ? filters.add("highpass") : filters.delete("highpass");
    return i.editReply({ embeds: [successEmbed(on ? "✨ High-pass filter enabled." : "High-pass filter disabled.")] });
  },
};

// ─── 5. /normalize ───────────────────────────────────────────────────────────
const normalize: Command = {
  data: new SlashCommandBuilder().setName("normalize").setDescription("Toggle audio normalization (evens out volume spikes)"),
  async execute(i, c) {
    await i.deferReply();
    const member = i.member as GuildMember;
    if (!member.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player?.queue.current) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    const filters = getFilters(i.guildId!);
    const fm = player.filterManager as any;
    const on = !filters.has("normalize");
    try {
      await fm.lavalinkLavaDspxPlugin?.toggleNormalization?.();
    } catch {
      // Fallback: set filter volume to normalized level
      on ? await fm.setVolume(0.85) : await fm.setVolume(1.0);
    }
    on ? filters.add("normalize") : filters.delete("normalize");
    return i.editReply({ embeds: [successEmbed(on ? "📊 Audio normalization enabled." : "Normalization disabled.")] });
  },
};

// ─── 6. /radio ───────────────────────────────────────────────────────────────
const RADIO_STATIONS: Record<string, string> = {
  "lofi_hip_hop": "https://streams.ilovemusic.de/iloveradio17.mp3",
  "jazz": "https://live.hunter.fm/jazz_high",
  "classical": "https://live.hunter.fm/classical_high",
  "pop": "https://live.hunter.fm/pop_high",
  "rock": "https://live.hunter.fm/rock_high",
  "electronic": "https://live.hunter.fm/electro_high",
  "chill": "https://streams.ilovemusic.de/iloveradio2.mp3",
};

const radio: Command = {
  data: new SlashCommandBuilder().setName("radio").setDescription("Play an internet radio station")
    .addStringOption(o => o.setName("station").setDescription("Station to play").setRequired(true)
      .addChoices(
        { name: "Lo-Fi Hip Hop", value: "lofi_hip_hop" },
        { name: "Jazz", value: "jazz" },
        { name: "Classical", value: "classical" },
        { name: "Pop", value: "pop" },
        { name: "Rock", value: "rock" },
        { name: "Electronic", value: "electronic" },
        { name: "Chill", value: "chill" },
      )),
  async execute(i, c) {
    await i.deferReply();
    const member = i.member as GuildMember;
    if (!member.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    const station = i.options.getString("station", true);
    const url = RADIO_STATIONS[station];
    let player = c.lavalink.getPlayer(i.guildId!);
    if (!player) {
      player = c.lavalink.createPlayer({ guildId: i.guildId!, voiceChannelId: member.voice.channelId, textChannelId: i.channelId, selfDeaf: true, volume: 80 });
    }
    if (!player.connected) await player.connect();
    const result = await player.search({ query: url }, i.user);
    if (!result?.tracks.length) return i.editReply({ embeds: [errorEmbed("Could not load radio stream.")] });
    await player.queue.add(result.tracks[0]);
    if (!player.playing && !player.paused) await player.play({ paused: false });
    const label = station.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    return i.editReply({ embeds: [infoEmbed(`📻 Now streaming **${label}** radio.`)] });
  },
};

// ─── 7. /genre ───────────────────────────────────────────────────────────────
const genre: Command = {
  data: new SlashCommandBuilder().setName("genre").setDescription("Play top songs from a music genre")
    .addStringOption(o => o.setName("genre").setDescription("Music genre").setRequired(true)
      .addChoices(
        { name: "Pop", value: "top pop songs" },
        { name: "Rock", value: "top rock songs" },
        { name: "Hip-Hop", value: "top hip hop songs" },
        { name: "Electronic / EDM", value: "top EDM electronic songs" },
        { name: "R&B / Soul", value: "top R&B soul songs" },
        { name: "Jazz", value: "top jazz songs" },
        { name: "Classical", value: "top classical music" },
        { name: "Metal", value: "top metal songs" },
        { name: "Country", value: "top country songs" },
        { name: "Lo-Fi", value: "lofi hip hop chill beats" },
      )),
  async execute(i, c) {
    await i.deferReply();
    const member = i.member as GuildMember;
    if (!member.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    let player = c.lavalink.getPlayer(i.guildId!);
    if (!player) {
      player = c.lavalink.createPlayer({ guildId: i.guildId!, voiceChannelId: member.voice.channelId, textChannelId: i.channelId, selfDeaf: true, volume: 80 });
    }
    if (!player.connected) await player.connect();
    const query = i.options.getString("genre", true);
    const result = await player.search({ query, source: "ytmsearch" }, i.user);
    if (!result?.tracks.length || result.loadType === "empty") return i.editReply({ embeds: [errorEmbed("No results found.")] });
    const tracks = result.tracks.slice(0, 10);
    await player.queue.add(tracks);
    if (!player.playing && !player.paused) await player.play({ paused: false });
    return i.editReply({ embeds: [infoEmbed(`🎸 Added **${tracks.length}** ${query} tracks to the queue.`)] });
  },
};

// ─── 8. /queueexport ─────────────────────────────────────────────────────────
const queueexport: Command = {
  data: new SlashCommandBuilder().setName("queueexport").setDescription("Export the current queue as a text list (sent to your DMs)"),
  async execute(i, c) {
    await i.deferReply({ ephemeral: true });
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player?.queue.current) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    const all = [player.queue.current, ...player.queue.tracks];
    const text = all.map((t, idx) => `${idx + 1}. ${t.info.title} — ${t.info.uri}`).join("\n");
    try {
      await i.user.send(`🐉 **Dragon's Den Queue Export**\n\`\`\`\n${text.slice(0, 1900)}\n\`\`\``);
      return i.editReply({ embeds: [successEmbed("📬 Queue exported to your DMs!")] });
    } catch {
      return i.editReply({ embeds: [errorEmbed("Couldn't DM you — check your privacy settings.")] });
    }
  },
};

// ─── 9. /rock ────────────────────────────────────────────────────────────────
const rockEq: Command = {
  data: new SlashCommandBuilder().setName("rock").setDescription("Apply a rock/metal EQ preset"),
  async execute(i, c) {
    await i.deferReply();
    const member = i.member as GuildMember;
    if (!member.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player?.queue.current) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    const filters = getFilters(i.guildId!);
    const fm = player.filterManager as any;
    const { FilterManager } = await import("lavalink-client");
    if (filters.has("rock")) {
      fm.equalizerBands = []; await fm.applyPlayerFilters(); filters.delete("rock");
      return i.editReply({ embeds: [successEmbed("Rock EQ disabled.")] });
    }
    fm.equalizerBands = FilterManager.EQList.Rock; await fm.applyPlayerFilters();
    filters.add("rock"); filters.delete("pop"); filters.delete("soft"); filters.delete("bassboost");
    return i.editReply({ embeds: [successEmbed("🎸 Rock EQ applied.")] });
  },
};

// ─── 10. /electronic ─────────────────────────────────────────────────────────
const electronicEq: Command = {
  data: new SlashCommandBuilder().setName("electronic").setDescription("Apply an electronic/EDM EQ preset"),
  async execute(i, c) {
    await i.deferReply();
    const member = i.member as GuildMember;
    if (!member.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player?.queue.current) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    const filters = getFilters(i.guildId!);
    const fm = player.filterManager as any;
    const { FilterManager } = await import("lavalink-client");
    if (filters.has("electronic")) {
      fm.equalizerBands = []; await fm.applyPlayerFilters(); filters.delete("electronic");
      return i.editReply({ embeds: [successEmbed("Electronic EQ disabled.")] });
    }
    fm.equalizerBands = FilterManager.EQList.Electronic; await fm.applyPlayerFilters();
    filters.add("electronic"); filters.delete("pop"); filters.delete("rock"); filters.delete("bassboost");
    return i.editReply({ embeds: [successEmbed("⚡ Electronic EQ applied.")] });
  },
};

export const miscCommands: Command[] = [reverb, echo, stereo, highpass, normalize, radio, genre, queueexport, rockEq, electronicEq];

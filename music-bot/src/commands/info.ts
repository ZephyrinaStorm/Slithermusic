import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { Command, BotClient } from "../types.js";
import { errorEmbed } from "../utils/embeds.js";
import { startTime } from "../stores.js";

function uptime(): string {
  const ms = Date.now() - startTime;
  const s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60), d = Math.floor(h / 24);
  return `${d}d ${h % 24}h ${m % 60}m ${s % 60}s`;
}

// ─── Category command data ────────────────────────────────────────────────────
export const HELP_CATEGORIES: Record<string, { emoji: string; title: string; commands: string }> = {
  playback: {
    emoji: "🎵",
    title: "Playback",
    commands:
      "`/play` — Search & queue a track\n" +
      "`/search` — Interactive search picker\n" +
      "`/pause` `/resume` `/playpause` — Pause controls\n" +
      "`/skip` `/forceskip` — Skip current track\n" +
      "`/stop` — Stop and clear queue\n" +
      "`/seek` — Jump to timestamp\n" +
      "`/replay` — Restart current track\n" +
      "`/previous` — Play previous track\n" +
      "`/join` — Join your voice channel\n" +
      "`/disconnect` — Leave voice channel",
  },
  filters: {
    emoji: "🎚️",
    title: "Filters & Effects",
    commands:
      "`/bassboost` — Heavy bass enhancement\n" +
      "`/nightcore` — Speed up + pitch shift\n" +
      "`/vaporwave` — Slow + pitch down\n" +
      "`/8d` — Spatial 8D audio\n" +
      "`/karaoke` — Remove vocals\n" +
      "`/tremolo` `/vibrato` — Modulation effects\n" +
      "`/speed` `/pitch` `/rate` — Manual adjustments\n" +
      "`/chipmunk` `/daycore` `/doubletime` `/slowmo`\n" +
      "`/soft` `/pop` `/treble` `/mono` `/lowpass`\n" +
      "`/reverb` `/echo` `/stereo` `/highpass`\n" +
      "`/equalizer` — Custom EQ bands\n" +
      "`/clearfilters` — Reset all effects\n" +
      "`/filterinfo` — Show active filters",
  },
  queue: {
    emoji: "📋",
    title: "Queue",
    commands:
      "`/queue` — Show the queue\n" +
      "`/skipto` — Skip to position N\n" +
      "`/jump` — Jump to any track\n" +
      "`/clearqueue` — Empty the queue\n" +
      "`/playnext` — Queue after current\n" +
      "`/playtop` — Queue at position 1\n" +
      "`/duplicate` — Copy current track\n" +
      "`/movetofront` — Bring a track to top\n" +
      "`/reverse` — Reverse queue order\n" +
      "`/unique` — Remove duplicates\n" +
      "`/remove` — Remove track by index\n" +
      "`/removerange` — Remove a range\n" +
      "`/move` — Move track to new position\n" +
      "`/shuffle` — Shuffle the queue\n" +
      "`/queueduration` — Total queue time\n" +
      "`/forward` `/rewind` — Seek forward/back\n" +
      "`/grab` — DM yourself the current track\n" +
      "`/history` — Session play history\n" +
      "`/queueexport` — Export queue as file",
  },
  loop: {
    emoji: "🔁",
    title: "Loop & Volume",
    commands:
      "`/loop` — Toggle queue loop\n" +
      "`/trackloop` — Loop current track\n" +
      "`/queueloop` — Loop entire queue\n" +
      "`/autoplay` — Auto-queue related tracks\n" +
      "`/volume` — Set volume (0–200)\n" +
      "`/mute` `/unmute` — Mute controls",
  },
  playlist: {
    emoji: "📀",
    title: "Playlists",
    commands:
      "`/playlist create <name>` — Create new playlist\n" +
      "`/playlist delete <name>` — Delete a playlist\n" +
      "`/playlist add <name> <url>` — Add a track\n" +
      "`/playlist remove <name> <pos>` — Remove a track\n" +
      "`/playlist play <name>` — Load & queue\n" +
      "`/playlist list` — Show all playlists\n" +
      "`/playlist show <name>` — View tracks\n" +
      "`/playlist rename <name> <new>` — Rename\n" +
      "`/playlist shuffle <name>` — Shuffle on load\n" +
      "`/playlist save <name>` — Save current queue\n" +
      "`/playlist clear <name>` — Clear all tracks\n" +
      "`/playlist info <name>` — Playlist details",
  },
  sources: {
    emoji: "🎤",
    title: "Sources",
    commands:
      "`/youtube <query>` — Search YouTube\n" +
      "`/soundcloud <query>` — Search SoundCloud\n" +
      "`/spotify <query>` — Search Spotify\n" +
      "`/applemusic <query>` — Search Apple Music\n" +
      "`/deezer <query>` — Search Deezer\n" +
      "`/platform amazonmusic <query>` — Search Amazon Music\n" +
      "`/platform gaana <query>` — Search Gaana\n" +
      "`/platform tidal <query>` — Search Tidal\n" +
      "`/sources` — List all supported music platforms\n" +
      "`/play <url>` — Play compatible links and HTTP streams",
  },
  lyrics: {
    emoji: "📝",
    title: "Lyrics",
    commands:
      "`/lyrics` — Fetch full song lyrics\n" +
      "`/synclyrics` — Real-time synced lyrics",
  },
  settings: {
    emoji: "⚙️",
    title: "Settings",
    commands:
      "`/dj set <role>` — Lock bot to a DJ role\n" +
      "`/dj clear` — Remove DJ role restriction\n" +
      "`/dj info` — Show current DJ setting\n" +
      "`/channellock` — Restrict to one channel\n" +
      "`/announce` — Toggle now-playing messages\n" +
      "`/247` — Toggle 24/7 stay-in-channel mode\n" +
      "`/voteskip` — Enable/disable vote-skip\n" +
      "`/color` — Change embed accent color\n" +
      "`/boost` — Toggle audio boost",
  },
  info: {
    emoji: "ℹ️",
    title: "Info",
    commands:
      "`/ping` — Bot & API latency\n" +
      "`/botinfo` — Bot stats and info\n" +
      "`/nodeinfo` — Lavalink node status\n" +
      "`/uptime` — How long bot has been online\n" +
      "`/invite` — Get the invite link\n" +
      "`/playerinfo` — Current player details\n" +
      "`/nowplaying` `/np` — Now playing card\n" +
      "`/effects` — Show active audio effects\n" +
      "`/stats` — Server music stats\n" +
      "`/help` — This menu",
  },
};

// ─── 1. /ping ────────────────────────────────────────────────────────────────
const ping: Command = {
  data: new SlashCommandBuilder().setName("ping").setDescription("Show bot latency and API response time"),
  async execute(i, c) {
    const sent = await i.reply({ embeds: [new EmbedBuilder().setColor(0x7b2fbe).setDescription("🏓 Pinging…")], fetchReply: true });
    const latency = sent.createdTimestamp - i.createdTimestamp;
    await i.editReply({
      embeds: [new EmbedBuilder().setColor(0x7b2fbe).setTitle("🏓 Pong!").setFooter({ text: "Dragon's Den Music" })
        .addFields(
          { name: "Bot Latency", value: `\`${latency}ms\``, inline: true },
          { name: "API Latency", value: `\`${Math.round(c.ws.ping)}ms\``, inline: true },
        )],
    });
  },
};

// ─── 2. /botinfo ─────────────────────────────────────────────────────────────
const botinfo: Command = {
  data: new SlashCommandBuilder().setName("botinfo").setDescription("Show Dragon's Den bot information and stats"),
  async execute(i, c) {
    await i.deferReply();
    const guilds = c.guilds.cache.size;
    const users = c.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
    const players = c.lavalink.players.size;
    const embed = new EmbedBuilder().setColor(0x7b2fbe).setTitle("🐉 Dragon's Den Music Bot").setFooter({ text: "Dragon's Den Music" })
      .setThumbnail(c.user?.displayAvatarURL() ?? null)
      .addFields(
        { name: "Servers", value: String(guilds), inline: true },
        { name: "Users", value: String(users), inline: true },
        { name: "Active Players", value: String(players), inline: true },
        { name: "Uptime", value: uptime(), inline: true },
        { name: "Ping", value: `${Math.round(c.ws.ping)}ms`, inline: true },
        { name: "Node.js", value: process.version, inline: true },
        { name: "Bot Name", value: "Dragon's Den Music", inline: false },
      );
    return i.editReply({ embeds: [embed] });
  },
};

// ─── 3. /nodeinfo ────────────────────────────────────────────────────────────
const nodeinfo: Command = {
  data: new SlashCommandBuilder().setName("nodeinfo").setDescription("Show Lavalink audio node status"),
  async execute(i, c) {
    await i.deferReply();
    const nodes = [...c.lavalink.nodeManager.nodes.values()];
    if (!nodes.length) return i.editReply({ embeds: [errorEmbed("No Lavalink nodes configured.")] });
    const embed = new EmbedBuilder().setColor(0x7b2fbe).setTitle("🔌 Lavalink Node Status").setFooter({ text: "Dragon's Den Music" });
    for (const node of nodes) {
      const connected = node.connected;
      const stats = (node as any).stats;
      embed.addFields({
        name: `${connected ? "🟢" : "🔴"} ${node.id} (${node.options.host}:${node.options.port})`,
        value: connected
          ? `Players: ${stats?.players ?? "—"} | Playing: ${stats?.playingPlayers ?? "—"} | CPU: ${stats?.cpu ? (stats.cpu.lavalinkLoad * 100).toFixed(1) + "%" : "—"}`
          : "Disconnected",
        inline: false,
      });
    }
    return i.editReply({ embeds: [embed] });
  },
};

// ─── 4. /uptime ──────────────────────────────────────────────────────────────
const uptimeCmd: Command = {
  data: new SlashCommandBuilder().setName("uptime").setDescription("Show how long the bot has been running"),
  async execute(i) {
    await i.reply({
      embeds: [new EmbedBuilder().setColor(0x7b2fbe).setFooter({ text: "Dragon's Den Music" })
        .setDescription(`⏱️ Bot has been online for **${uptime()}**.`)],
    });
  },
};

// ─── 5. /invite ──────────────────────────────────────────────────────────────
const invite: Command = {
  data: new SlashCommandBuilder().setName("invite").setDescription("Get the link to add Dragon's Den to your server"),
  async execute(i, c) {
    const clientId = process.env.DISCORD_CLIENT_ID ?? c.user?.id ?? "";
    const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=274881432640&scope=bot+applications.commands`;
    await i.reply({
      embeds: [new EmbedBuilder().setColor(0x7b2fbe).setTitle("🐉 Invite Dragon's Den").setFooter({ text: "Dragon's Den Music" })
        .setDescription(`[Click here to add Dragon's Den to your server!](${url})`)],
    });
  },
};

// ─── 6. /playerinfo ──────────────────────────────────────────────────────────
const playerinfo: Command = {
  data: new SlashCommandBuilder().setName("playerinfo").setDescription("Show detailed info about the current music player"),
  async execute(i, c) {
    await i.deferReply();
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player) return i.editReply({ embeds: [errorEmbed("No active player in this server.")] });
    const { getFilters, getSettings } = await import("../stores.js");
    const filters = getFilters(i.guildId!);
    const settings = getSettings(i.guildId!);
    const embed = new EmbedBuilder().setColor(0x7b2fbe).setTitle("🎵 Player Info").setFooter({ text: "Dragon's Den Music" })
      .addFields(
        { name: "Status", value: player.playing ? (player.paused ? "⏸️ Paused" : "▶️ Playing") : "⏹️ Idle", inline: true },
        { name: "Volume", value: `${player.volume}%`, inline: true },
        { name: "Loop", value: player.repeatMode, inline: true },
        { name: "Queue Size", value: String(player.queue.tracks.length), inline: true },
        { name: "24/7 Mode", value: settings.is247 ? "On" : "Off", inline: true },
        { name: "Autoplay", value: settings.autoplay ? "On" : "Off", inline: true },
        { name: "Active Filters", value: filters.size > 0 ? [...filters].join(", ") : "None", inline: false },
        { name: "Voice Channel", value: player.voiceChannelId ? `<#${player.voiceChannelId}>` : "—", inline: true },
        { name: "Text Channel", value: player.textChannelId ? `<#${player.textChannelId}>` : "—", inline: true },
      );
    if (player.queue.current) {
      const t = player.queue.current;
      embed.setDescription(`**Now Playing:** [${t.info.title}](${t.info.uri})`);
      if (t.info.artworkUrl) embed.setThumbnail(t.info.artworkUrl);
    }
    return i.editReply({ embeds: [embed] });
  },
};

// ─── 7. /help ────────────────────────────────────────────────────────────────
const help: Command = {
  data: new SlashCommandBuilder().setName("help").setDescription("Browse all Slither Music commands by category"),
  async execute(i) {
    const embed = new EmbedBuilder()
      .setColor(0x7b2fbe)
      .setTitle("🐍 Slither Music — Help")
      .setDescription(
        "**99 slash commands** across 9 categories.\n\n" +
        "Select a category button below to see all commands in that group.\n\n" +
        "Quick start: use `/play <song>` to start playing music.",
      )
      .addFields(
        { name: "🎵 Playback", value: "11 commands", inline: true },
        { name: "🎚️ Filters", value: "22 commands", inline: true },
        { name: "📋 Queue", value: "19 commands", inline: true },
        { name: "🔁 Loop & Volume", value: "6 commands", inline: true },
        { name: "📀 Playlists", value: "12 commands", inline: true },
        { name: "🎤 Sources", value: "8 searchable + links", inline: true },
        { name: "📝 Lyrics", value: "2 commands", inline: true },
        { name: "⚙️ Settings", value: "9 commands", inline: true },
        { name: "ℹ️ Info", value: "10 commands", inline: true },
      )
      .setFooter({ text: "Slither Music • Click a category button below" });

    const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId("help_playback").setLabel("Playback").setEmoji("🎵").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("help_filters").setLabel("Filters").setEmoji("🎚️").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("help_queue").setLabel("Queue").setEmoji("📋").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("help_loop").setLabel("Loop & Volume").setEmoji("🔁").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("help_playlist").setLabel("Playlist").setEmoji("📀").setStyle(ButtonStyle.Secondary),
    );

    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId("help_sources").setLabel("Sources").setEmoji("🎤").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("help_lyrics").setLabel("Lyrics").setEmoji("📝").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("help_settings").setLabel("Settings").setEmoji("⚙️").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("help_info").setLabel("Info").setEmoji("ℹ️").setStyle(ButtonStyle.Secondary),
    );

    return i.reply({ embeds: [embed], components: [row1, row2] });
  },
};

// ─── 8. /stats ───────────────────────────────────────────────────────────────
const stats: Command = {
  data: new SlashCommandBuilder().setName("stats").setDescription("Show music stats for this server"),
  async execute(i, c) {
    await i.deferReply();
    const { playHistory } = await import("../stores.js");
    const hist = playHistory.get(i.guildId!) ?? [];
    const player = c.lavalink.getPlayer(i.guildId!);
    const embed = new EmbedBuilder().setColor(0x7b2fbe).setTitle("📊 Server Music Stats").setFooter({ text: "Dragon's Den Music" })
      .addFields(
        { name: "Songs Played (session)", value: String(hist.length), inline: true },
        { name: "Queue Size", value: String(player?.queue.tracks.length ?? 0), inline: true },
        { name: "Currently Playing", value: player?.queue.current?.info.title ?? "Nothing", inline: false },
      );
    if (hist.length > 0) {
      const top = hist[0];
      embed.addFields({ name: "Last Played", value: `[${top.info.title}](${top.info.uri})`, inline: false });
    }
    return i.editReply({ embeds: [embed] });
  },
};

export const infoCommands: Command[] = [ping, botinfo, nodeinfo, uptimeCmd, invite, playerinfo, help, stats];

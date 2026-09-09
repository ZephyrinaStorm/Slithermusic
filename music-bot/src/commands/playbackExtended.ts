import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  EmbedBuilder,
  VoiceChannel,
} from "discord.js";
import { Command, BotClient } from "../types.js";
import { errorEmbed, successEmbed, infoEmbed } from "../utils/embeds.js";
import { getSettings } from "../stores.js";

// ─── 1. /autoplay ────────────────────────────────────────────────────────────
const autoplay: Command = {
  data: new SlashCommandBuilder().setName("autoplay").setDescription("Toggle autoplay — auto-adds similar songs when the queue ends"),
  async execute(i, c) {
    await i.deferReply();
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    const settings = getSettings(i.guildId!);
    settings.autoplay = !settings.autoplay;
    // autoplay is tracked in settings; underlying repeat stays "off"
    if (!settings.autoplay) {
      await player.setRepeatMode("off");
    }
    return i.editReply({ embeds: [successEmbed(settings.autoplay ? "♾️ Autoplay enabled — similar songs will be added automatically." : "Autoplay disabled.")] });
  },
};

// ─── 2. /mute ────────────────────────────────────────────────────────────────
const mute: Command = {
  data: new SlashCommandBuilder().setName("mute").setDescription("Mute the bot (saves current volume)"),
  async execute(i, c) {
    await i.deferReply();
    const member = i.member as GuildMember;
    if (!member.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    const settings = getSettings(i.guildId!);
    if (player.volume === 0) return i.editReply({ embeds: [errorEmbed("Already muted. Use `/unmute` to restore.")] });
    settings.muteVolume = player.volume;
    await player.setVolume(0);
    return i.editReply({ embeds: [successEmbed("🔇 Muted. Use `/unmute` to restore.")] });
  },
};

// ─── 3. /unmute ──────────────────────────────────────────────────────────────
const unmute: Command = {
  data: new SlashCommandBuilder().setName("unmute").setDescription("Unmute the bot (restores previous volume)"),
  async execute(i, c) {
    await i.deferReply();
    const member = i.member as GuildMember;
    if (!member.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    const settings = getSettings(i.guildId!);
    const restoreVol = settings.muteVolume ?? 80;
    await player.setVolume(restoreVol);
    settings.muteVolume = null;
    return i.editReply({ embeds: [successEmbed(`🔊 Unmuted — volume restored to **${restoreVol}%**.`)] });
  },
};

// ─── 4. /voteskip ────────────────────────────────────────────────────────────
const voteskip: Command = {
  data: new SlashCommandBuilder().setName("voteskip").setDescription("Vote to skip the current song (majority wins)"),
  async execute(i, c) {
    await i.deferReply();
    const member = i.member as GuildMember;
    if (!member.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player?.queue.current) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    const settings = getSettings(i.guildId!);
    if (settings.voteSkips.has(i.user.id)) return i.editReply({ embeds: [errorEmbed("You already voted to skip.")] });
    settings.voteSkips.add(i.user.id);
    const botChannel = i.guild!.channels.cache.get(player.voiceChannelId ?? "") as VoiceChannel | null;
    const humanCount = botChannel ? botChannel.members.filter(m => !m.user.bot).size : 1;
    const needed = Math.ceil(humanCount / 2);
    const votes = settings.voteSkips.size;
    if (votes >= needed) {
      settings.voteSkips.clear();
      await player.skip();
      return i.editReply({ embeds: [successEmbed(`🗳️ Vote skip passed (${votes}/${humanCount})! Skipping…`)] });
    }
    return i.editReply({ embeds: [infoEmbed(`🗳️ Skip vote: **${votes}/${needed}** needed. (${humanCount - votes} more needed)`)] });
  },
};

// ─── 5. /247 ─────────────────────────────────────────────────────────────────
const always247: Command = {
  data: new SlashCommandBuilder().setName("247").setDescription("Toggle 24/7 mode — bot stays in voice even when queue ends"),
  async execute(i, c) {
    await i.deferReply();
    const member = i.member as GuildMember;
    if (!member.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    const settings = getSettings(i.guildId!);
    settings.is247 = !settings.is247;
    return i.editReply({ embeds: [successEmbed(settings.is247 ? "🕐 24/7 mode enabled — I'll stay in voice!" : "24/7 mode disabled.")] });
  },
};

// ─── 6. /effects ─────────────────────────────────────────────────────────────
const effects: Command = {
  data: new SlashCommandBuilder().setName("effects").setDescription("Show all active audio filters and playback settings"),
  async execute(i, c) {
    await i.deferReply();
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    const { getFilters } = await import("../stores.js");
    const filters = getFilters(i.guildId!);
    const embed = new EmbedBuilder().setColor(0x7b2fbe).setTitle("🎛️ Active Effects").setFooter({ text: "Dragon's Den Music" })
      .addFields(
        { name: "Filters", value: filters.size > 0 ? [...filters].map(f => `\`${f}\``).join(", ") : "None", inline: false },
        { name: "Volume", value: `${player.volume}%`, inline: true },
        { name: "Loop Mode", value: player.repeatMode, inline: true },
        { name: "Autoplay", value: getSettings(i.guildId!).autoplay ? "On" : "Off", inline: true },
      );
    return i.editReply({ embeds: [embed] });
  },
};

// ─── 7. /trackloop ───────────────────────────────────────────────────────────
const trackloop: Command = {
  data: new SlashCommandBuilder().setName("trackloop").setDescription("Toggle looping of the current track"),
  async execute(i, c) {
    await i.deferReply();
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player?.queue.current) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    const isTrack = player.repeatMode === "track";
    await player.setRepeatMode(isTrack ? "off" : "track");
    return i.editReply({ embeds: [successEmbed(isTrack ? "🔂 Track loop disabled." : "🔂 Now looping the current track.")] });
  },
};

// ─── 8. /queueloop ───────────────────────────────────────────────────────────
const queueloop: Command = {
  data: new SlashCommandBuilder().setName("queueloop").setDescription("Toggle looping of the entire queue"),
  async execute(i, c) {
    await i.deferReply();
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player?.queue.current) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    const isQueue = player.repeatMode === "queue";
    await player.setRepeatMode(isQueue ? "off" : "queue");
    return i.editReply({ embeds: [successEmbed(isQueue ? "🔁 Queue loop disabled." : "🔁 Now looping the entire queue.")] });
  },
};

// ─── 9. /announce ────────────────────────────────────────────────────────────
const announce: Command = {
  data: new SlashCommandBuilder().setName("announce").setDescription("Toggle track start announcements in this channel"),
  async execute(i, c) {
    await i.deferReply();
    const settings = getSettings(i.guildId!);
    settings.announcements = !settings.announcements;
    return i.editReply({ embeds: [successEmbed(settings.announcements ? "🔔 Track announcements enabled." : "🔕 Track announcements disabled.")] });
  },
};

// ─── 10. /forceskip ──────────────────────────────────────────────────────────
const forceskip: Command = {
  data: new SlashCommandBuilder().setName("forceskip").setDescription("Force skip without a vote (admins / DJ only)"),
  async execute(i, c) {
    await i.deferReply();
    const member = i.member as GuildMember;
    if (!member.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    const settings = getSettings(i.guildId!);
    const isDJ = settings.djRoleId && member.roles.cache.has(settings.djRoleId);
    const isAdmin = member.permissions.has("Administrator");
    if (!isDJ && !isAdmin) return i.editReply({ embeds: [errorEmbed("You need the DJ role or Administrator permission.")] });
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player?.queue.current) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    const title = player.queue.current.info.title;
    settings.voteSkips.clear();
    await player.skip();
    return i.editReply({ embeds: [successEmbed(`⏭️ Force skipped **${title}**.`)] });
  },
};

// ─── 11. /playpause ──────────────────────────────────────────────────────────
const playpause: Command = {
  data: new SlashCommandBuilder().setName("playpause").setDescription("Toggle between play and pause"),
  async execute(i, c) {
    await i.deferReply();
    const member = i.member as GuildMember;
    if (!member.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player?.queue.current) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    if (player.paused) {
      await player.resume();
      return i.editReply({ embeds: [successEmbed("▶️ Resumed.")] });
    } else {
      await player.pause();
      return i.editReply({ embeds: [successEmbed("⏸️ Paused.")] });
    }
  },
};

// ─── 12. /join ───────────────────────────────────────────────────────────────
const join: Command = {
  data: new SlashCommandBuilder().setName("join").setDescription("Make the bot join your voice channel"),
  async execute(i, c) {
    await i.deferReply();
    const member = i.member as GuildMember;
    if (!member.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    let player = c.lavalink.getPlayer(i.guildId!);
    if (!player) {
      player = c.lavalink.createPlayer({ guildId: i.guildId!, voiceChannelId: member.voice.channelId, textChannelId: i.channelId, selfDeaf: true, volume: 80 });
    }
    if (!player.connected) await player.connect();
    return i.editReply({ embeds: [successEmbed(`🎤 Joined **${member.voice.channel?.name ?? "your channel"}**.`)] });
  },
};

export const playbackExtendedCommands: Command[] = [
  autoplay, mute, unmute, voteskip, always247, effects, trackloop, queueloop,
  announce, forceskip, playpause, join,
];

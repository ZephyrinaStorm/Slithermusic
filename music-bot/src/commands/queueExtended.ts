import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  EmbedBuilder,
} from "discord.js";
import { Command, BotClient } from "../types.js";
import { errorEmbed, successEmbed, infoEmbed } from "../utils/embeds.js";
import { formatDuration } from "../utils/duration.js";
import { addToHistory, playHistory, pushPrevious, previousTracks } from "../stores.js";

// ─── 1. /skipto ───────────────────────────────────────────────────────────────
const skipto: Command = {
  data: new SlashCommandBuilder().setName("skipto").setDescription("Skip to a specific position in the queue")
    .addIntegerOption(o => o.setName("position").setDescription("Queue position to skip to").setRequired(true).setMinValue(1)),
  async execute(i, c) {
    await i.deferReply();
    const member = i.member as GuildMember;
    if (!member.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player?.queue.current) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    const pos = i.options.getInteger("position", true);
    if (pos > player.queue.tracks.length) return i.editReply({ embeds: [errorEmbed(`Position ${pos} doesn't exist. Queue has ${player.queue.tracks.length} tracks.`)] });
    player.queue.tracks.splice(0, pos - 1);
    await player.skip();
    return i.editReply({ embeds: [successEmbed(`⏭️ Skipped to position **#${pos}**.`)] });
  },
};

// ─── 2. /clearqueue ──────────────────────────────────────────────────────────
const clearqueue: Command = {
  data: new SlashCommandBuilder().setName("clearqueue").setDescription("Clear the queue without stopping the current song"),
  async execute(i, c) {
    await i.deferReply();
    const member = i.member as GuildMember;
    if (!member.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    const count = player.queue.tracks.length;
    player.queue.tracks.splice(0, count);
    return i.editReply({ embeds: [successEmbed(`🗑️ Cleared **${count}** song(s) from the queue.`)] });
  },
};

// ─── 3. /playnext ────────────────────────────────────────────────────────────
const playnext: Command = {
  data: new SlashCommandBuilder().setName("playnext").setDescription("Add a song to play immediately after the current one")
    .addStringOption(o => o.setName("query").setDescription("Song name or URL").setRequired(true)),
  async execute(i, c) {
    await i.deferReply();
    const member = i.member as GuildMember;
    if (!member.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    let player = c.lavalink.getPlayer(i.guildId!);
    if (!player) {
      player = c.lavalink.createPlayer({ guildId: i.guildId!, voiceChannelId: member.voice.channelId, textChannelId: i.channelId, selfDeaf: true, volume: 80 });
    }
    if (!player.connected) await player.connect();
    const query = i.options.getString("query", true);
    const isUrl = /^https?:\/\//.test(query);
    const result = await player.search({ query, source: isUrl ? undefined : "ytmsearch" }, i.user);
    if (!result?.tracks.length || result.loadType === "empty" || result.loadType === "error")
      return i.editReply({ embeds: [errorEmbed("No results found.")] });
    const track = result.tracks[0];
    player.queue.tracks.unshift(track);
    const embed = infoEmbed(`⏫ **Playing next:** [${track.info.title}](${track.info.uri})\n🎤 ${track.info.author} · ⏱️ ${formatDuration(track.info.duration ?? 0)}`);
    if (track.info.artworkUrl) embed.setThumbnail(track.info.artworkUrl);
    if (!player.playing && !player.paused) await player.play({ paused: false });
    return i.editReply({ embeds: [embed] });
  },
};

// ─── 4. /playtop ─────────────────────────────────────────────────────────────
const playtop: Command = {
  data: new SlashCommandBuilder().setName("playtop").setDescription("Add a song to the top of the queue (alias of /playnext)")
    .addStringOption(o => o.setName("query").setDescription("Song name or URL").setRequired(true)),
  async execute(i, c) {
    return playnext.execute(i, c);
  },
};

// ─── 5. /duplicate ───────────────────────────────────────────────────────────
const duplicate: Command = {
  data: new SlashCommandBuilder().setName("duplicate").setDescription("Duplicate a track to the end of the queue")
    .addIntegerOption(o => o.setName("position").setDescription("Queue position to duplicate (0 = current song)").setMinValue(0)),
  async execute(i, c) {
    await i.deferReply();
    const member = i.member as GuildMember;
    if (!member.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player?.queue.current) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    const pos = i.options.getInteger("position") ?? 0;
    const track = pos === 0 ? player.queue.current : player.queue.tracks[pos - 1];
    if (!track) return i.editReply({ embeds: [errorEmbed(`Position ${pos} doesn't exist.`)] });
    await player.queue.add(track);
    return i.editReply({ embeds: [successEmbed(`➕ Duplicated **${track.info.title}** to end of queue.`)] });
  },
};

// ─── 6. /movetofront ─────────────────────────────────────────────────────────
const movetofront: Command = {
  data: new SlashCommandBuilder().setName("movetofront").setDescription("Move a queue item to play right after the current song")
    .addIntegerOption(o => o.setName("position").setDescription("Queue position to move").setRequired(true).setMinValue(1)),
  async execute(i, c) {
    await i.deferReply();
    const member = i.member as GuildMember;
    if (!member.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player?.queue.current) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    const pos = i.options.getInteger("position", true);
    if (pos > player.queue.tracks.length) return i.editReply({ embeds: [errorEmbed(`Position ${pos} doesn't exist.`)] });
    const [track] = player.queue.tracks.splice(pos - 1, 1);
    player.queue.tracks.unshift(track);
    return i.editReply({ embeds: [successEmbed(`⏫ Moved **${track.info.title}** to the front of the queue.`)] });
  },
};

// ─── 7. /reverse ─────────────────────────────────────────────────────────────
const reverse: Command = {
  data: new SlashCommandBuilder().setName("reverse").setDescription("Reverse the order of the queue"),
  async execute(i, c) {
    await i.deferReply();
    const member = i.member as GuildMember;
    if (!member.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player?.queue.current) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    if (player.queue.tracks.length < 2) return i.editReply({ embeds: [errorEmbed("Need at least 2 songs in the queue.")] });
    player.queue.tracks.reverse();
    return i.editReply({ embeds: [successEmbed(`🔃 Reversed ${player.queue.tracks.length} songs in the queue.`)] });
  },
};

// ─── 8. /unique ──────────────────────────────────────────────────────────────
const unique: Command = {
  data: new SlashCommandBuilder().setName("unique").setDescription("Remove duplicate songs from the queue"),
  async execute(i, c) {
    await i.deferReply();
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player?.queue.current) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    const before = player.queue.tracks.length;
    const seen = new Set<string>();
    player.queue.tracks.splice(0, before, ...player.queue.tracks.filter(t => {
      const key = t.info.uri ?? t.info.title;
      if (seen.has(key)) return false;
      seen.add(key); return true;
    }));
    const removed = before - player.queue.tracks.length;
    return i.editReply({ embeds: [successEmbed(removed > 0 ? `🧹 Removed **${removed}** duplicate song(s).` : "No duplicate songs found.")] });
  },
};

// ─── 9. /queueduration ───────────────────────────────────────────────────────
const queueduration: Command = {
  data: new SlashCommandBuilder().setName("queueduration").setDescription("Show the total duration of the queue"),
  async execute(i, c) {
    await i.deferReply();
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player?.queue.current) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    const currentRemaining = (player.queue.current.info.duration ?? 0) - player.position;
    const queueTotal = player.queue.tracks.reduce((acc, t) => acc + (t.info.duration ?? 0), 0);
    const total = currentRemaining + queueTotal;
    return i.editReply({
      embeds: [new EmbedBuilder().setColor(0x7b2fbe).setFooter({ text: "Dragon's Den Music" })
        .setTitle("⏱️ Queue Duration")
        .addFields(
          { name: "Current song remaining", value: formatDuration(currentRemaining), inline: true },
          { name: "Songs in queue", value: String(player.queue.tracks.length), inline: true },
          { name: "Total remaining", value: formatDuration(total), inline: true },
        )],
    });
  },
};

// ─── 10. /forward ────────────────────────────────────────────────────────────
const forward: Command = {
  data: new SlashCommandBuilder().setName("forward").setDescription("Skip forward in the current song")
    .addIntegerOption(o => o.setName("seconds").setDescription("Seconds to skip forward (default 30)").setMinValue(1).setMaxValue(600)),
  async execute(i, c) {
    await i.deferReply();
    const member = i.member as GuildMember;
    if (!member.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player?.queue.current) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    if (player.queue.current.info.isStream) return i.editReply({ embeds: [errorEmbed("Cannot seek in a live stream.")] });
    const sec = i.options.getInteger("seconds") ?? 30;
    const newPos = Math.min(player.position + sec * 1000, (player.queue.current.info.duration ?? 0) - 1000);
    await player.seek(newPos);
    return i.editReply({ embeds: [successEmbed(`⏩ Skipped forward **${sec}s** to **${formatDuration(newPos)}**.`)] });
  },
};

// ─── 11. /rewind ─────────────────────────────────────────────────────────────
const rewind: Command = {
  data: new SlashCommandBuilder().setName("rewind").setDescription("Rewind in the current song")
    .addIntegerOption(o => o.setName("seconds").setDescription("Seconds to rewind (default 30)").setMinValue(1).setMaxValue(600)),
  async execute(i, c) {
    await i.deferReply();
    const member = i.member as GuildMember;
    if (!member.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player?.queue.current) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    if (player.queue.current.info.isStream) return i.editReply({ embeds: [errorEmbed("Cannot seek in a live stream.")] });
    const sec = i.options.getInteger("seconds") ?? 30;
    const newPos = Math.max(player.position - sec * 1000, 0);
    await player.seek(newPos);
    return i.editReply({ embeds: [successEmbed(`⏪ Rewound **${sec}s** to **${formatDuration(newPos)}**.`)] });
  },
};

// ─── 12. /replay ─────────────────────────────────────────────────────────────
const replay: Command = {
  data: new SlashCommandBuilder().setName("replay").setDescription("Restart the current song from the beginning"),
  async execute(i, c) {
    await i.deferReply();
    const member = i.member as GuildMember;
    if (!member.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player?.queue.current) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    await player.seek(0);
    return i.editReply({ embeds: [successEmbed(`🔄 Restarted **${player.queue.current.info.title}**.`)] });
  },
};

// ─── 13. /previous ───────────────────────────────────────────────────────────
const previous: Command = {
  data: new SlashCommandBuilder().setName("previous").setDescription("Play the previously played song"),
  async execute(i, c) {
    await i.deferReply();
    const member = i.member as GuildMember;
    if (!member.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    const stack = previousTracks.get(i.guildId!) ?? [];
    if (stack.length === 0) return i.editReply({ embeds: [errorEmbed("No previous song in history.")] });
    const prev = stack.shift()!;
    player.queue.tracks.unshift(prev);
    if (player.queue.current) player.queue.tracks.unshift(player.queue.current);
    await player.skip();
    return i.editReply({ embeds: [successEmbed(`⏮️ Playing previous: **${prev.info.title}**.`)] });
  },
};

// ─── 14. /history ────────────────────────────────────────────────────────────
const history: Command = {
  data: new SlashCommandBuilder().setName("history").setDescription("Show recently played songs"),
  async execute(i, c) {
    await i.deferReply();
    const hist = playHistory.get(i.guildId!) ?? [];
    if (hist.length === 0) return i.editReply({ embeds: [infoEmbed("No play history yet. Start playing some music!")] });
    const embed = new EmbedBuilder().setColor(0x7b2fbe).setTitle("📜 Play History").setFooter({ text: "Dragon's Den Music" })
      .setDescription(hist.map((t, idx) => `\`${idx + 1}.\` [${t.info.title}](${t.info.uri}) — \`${formatDuration(t.info.duration ?? 0)}\``).join("\n"));
    return i.editReply({ embeds: [embed] });
  },
};

// ─── 15. /jump ───────────────────────────────────────────────────────────────
const jump: Command = {
  data: new SlashCommandBuilder().setName("jump").setDescription("Jump to a position in the queue, skipping everything in between")
    .addIntegerOption(o => o.setName("position").setDescription("Queue position to jump to").setRequired(true).setMinValue(1)),
  async execute(i, c) {
    return skipto.execute(i, c);
  },
};

// ─── 16. /removerange ────────────────────────────────────────────────────────
const removerange: Command = {
  data: new SlashCommandBuilder().setName("removerange").setDescription("Remove a range of songs from the queue")
    .addIntegerOption(o => o.setName("from").setDescription("Start position (inclusive)").setRequired(true).setMinValue(1))
    .addIntegerOption(o => o.setName("to").setDescription("End position (inclusive)").setRequired(true).setMinValue(1)),
  async execute(i, c) {
    await i.deferReply();
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player?.queue.current) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    const from = i.options.getInteger("from", true);
    const to = i.options.getInteger("to", true);
    if (from > to) return i.editReply({ embeds: [errorEmbed("`from` must be less than or equal to `to`.")] });
    if (from > player.queue.tracks.length) return i.editReply({ embeds: [errorEmbed(`Position ${from} doesn't exist.`)] });
    const realTo = Math.min(to, player.queue.tracks.length);
    const removed = player.queue.tracks.splice(from - 1, realTo - from + 1);
    return i.editReply({ embeds: [successEmbed(`🗑️ Removed **${removed.length}** song(s) (positions ${from}–${realTo}).`)] });
  },
};

// ─── 17. /grab ───────────────────────────────────────────────────────────────
const grab: Command = {
  data: new SlashCommandBuilder().setName("grab").setDescription("DM yourself info about the current song"),
  async execute(i, c) {
    await i.deferReply({ ephemeral: true });
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player?.queue.current) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    const track = player.queue.current;
    const embed = new EmbedBuilder().setColor(0x7b2fbe).setTitle("🎵 Grabbed Track").setFooter({ text: "Dragon's Den Music" })
      .setDescription(`**[${track.info.title}](${track.info.uri})**\n🎤 ${track.info.author}\n⏱️ ${formatDuration(track.info.duration ?? 0)}\n🔗 ${track.info.uri}`);
    if (track.info.artworkUrl) embed.setThumbnail(track.info.artworkUrl);
    try {
      await i.user.send({ embeds: [embed] });
      return i.editReply({ embeds: [successEmbed("📬 Sent track info to your DMs!")] });
    } catch {
      return i.editReply({ embeds: [errorEmbed("Couldn't DM you — check your privacy settings.")] });
    }
  },
};

export const queueExtendedCommands: Command[] = [
  skipto, clearqueue, playnext, playtop, duplicate, movetofront, reverse, unique,
  queueduration, forward, rewind, replay, previous, history, jump, removerange, grab,
];

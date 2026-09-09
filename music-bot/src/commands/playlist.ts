import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command, BotClient } from "../types.js";
import { errorEmbed, successEmbed, infoEmbed } from "../utils/embeds.js";
import { formatDuration } from "../utils/duration.js";
import { getUserPlaylists } from "../stores.js";

const MAX_PLAYLISTS = 10;
const MAX_TRACKS = 100;

export const playlistCmd: Command = {
  data: new SlashCommandBuilder()
    .setName("playlist")
    .setDescription("Manage your personal playlists")
    .addSubcommand(s => s.setName("create").setDescription("Create a new playlist")
      .addStringOption(o => o.setName("name").setDescription("Playlist name").setRequired(true)))
    .addSubcommand(s => s.setName("delete").setDescription("Delete one of your playlists")
      .addStringOption(o => o.setName("name").setDescription("Playlist name").setRequired(true)))
    .addSubcommand(s => s.setName("add").setDescription("Add the current song to a playlist")
      .addStringOption(o => o.setName("name").setDescription("Playlist name").setRequired(true)))
    .addSubcommand(s => s.setName("remove").setDescription("Remove a song from a playlist")
      .addStringOption(o => o.setName("name").setDescription("Playlist name").setRequired(true))
      .addIntegerOption(o => o.setName("position").setDescription("Song position in playlist").setRequired(true).setMinValue(1)))
    .addSubcommand(s => s.setName("play").setDescription("Play a playlist")
      .addStringOption(o => o.setName("name").setDescription("Playlist name").setRequired(true)))
    .addSubcommand(s => s.setName("list").setDescription("List all your playlists"))
    .addSubcommand(s => s.setName("show").setDescription("Show songs in a playlist")
      .addStringOption(o => o.setName("name").setDescription("Playlist name").setRequired(true)))
    .addSubcommand(s => s.setName("rename").setDescription("Rename a playlist")
      .addStringOption(o => o.setName("old").setDescription("Current name").setRequired(true))
      .addStringOption(o => o.setName("new").setDescription("New name").setRequired(true)))
    .addSubcommand(s => s.setName("shuffle").setDescription("Shuffle a playlist")
      .addStringOption(o => o.setName("name").setDescription("Playlist name").setRequired(true)))
    .addSubcommand(s => s.setName("save").setDescription("Save the current queue as a playlist")
      .addStringOption(o => o.setName("name").setDescription("Playlist name").setRequired(true)))
    .addSubcommand(s => s.setName("clear").setDescription("Remove all songs from a playlist")
      .addStringOption(o => o.setName("name").setDescription("Playlist name").setRequired(true)))
    .addSubcommand(s => s.setName("info").setDescription("Show info about a playlist")
      .addStringOption(o => o.setName("name").setDescription("Playlist name").setRequired(true))),

  async execute(i: ChatInputCommandInteraction, c: BotClient) {
    await i.deferReply();
    const sub = i.options.getSubcommand(true);
    const playlists = getUserPlaylists(i.user.id);

    // ── create ────────────────────────────────────────────────────────────────
    if (sub === "create") {
      const name = i.options.getString("name", true).trim();
      if (playlists.has(name)) return i.editReply({ embeds: [errorEmbed(`A playlist named **${name}** already exists.`)] });
      if (playlists.size >= MAX_PLAYLISTS) return i.editReply({ embeds: [errorEmbed(`You can have at most ${MAX_PLAYLISTS} playlists.`)] });
      playlists.set(name, []);
      return i.editReply({ embeds: [successEmbed(`📀 Playlist **${name}** created!`)] });
    }

    // ── delete ────────────────────────────────────────────────────────────────
    if (sub === "delete") {
      const name = i.options.getString("name", true).trim();
      if (!playlists.has(name)) return i.editReply({ embeds: [errorEmbed(`No playlist named **${name}**.`)] });
      playlists.delete(name);
      return i.editReply({ embeds: [successEmbed(`🗑️ Playlist **${name}** deleted.`)] });
    }

    // ── add ───────────────────────────────────────────────────────────────────
    if (sub === "add") {
      const name = i.options.getString("name", true).trim();
      if (!playlists.has(name)) return i.editReply({ embeds: [errorEmbed(`No playlist named **${name}**. Create it with \`/playlist create\`.`)] });
      const player = c.lavalink.getPlayer(i.guildId!);
      if (!player?.queue.current) return i.editReply({ embeds: [errorEmbed("Nothing is currently playing.")] });
      const tracks = playlists.get(name)!;
      if (tracks.length >= MAX_TRACKS) return i.editReply({ embeds: [errorEmbed(`Playlist is full (${MAX_TRACKS} songs max).`)] });
      tracks.push(player.queue.current);
      return i.editReply({ embeds: [successEmbed(`➕ Added **${player.queue.current.info.title}** to **${name}** (${tracks.length} songs).`)] });
    }

    // ── remove ────────────────────────────────────────────────────────────────
    if (sub === "remove") {
      const name = i.options.getString("name", true).trim();
      const pos = i.options.getInteger("position", true);
      if (!playlists.has(name)) return i.editReply({ embeds: [errorEmbed(`No playlist named **${name}**.`)] });
      const tracks = playlists.get(name)!;
      if (pos > tracks.length) return i.editReply({ embeds: [errorEmbed(`Position ${pos} doesn't exist (${tracks.length} songs).`)] });
      const [removed] = tracks.splice(pos - 1, 1);
      return i.editReply({ embeds: [successEmbed(`🗑️ Removed **${removed.info.title}** from **${name}**.`)] });
    }

    // ── play ──────────────────────────────────────────────────────────────────
    if (sub === "play") {
      const name = i.options.getString("name", true).trim();
      if (!playlists.has(name)) return i.editReply({ embeds: [errorEmbed(`No playlist named **${name}**.`)] });
      const tracks = playlists.get(name)!;
      if (tracks.length === 0) return i.editReply({ embeds: [errorEmbed(`Playlist **${name}** is empty.`)] });
      const member = i.guild?.members.cache.get(i.user.id);
      if (!member?.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
      let player = c.lavalink.getPlayer(i.guildId!);
      if (!player) {
        player = c.lavalink.createPlayer({ guildId: i.guildId!, voiceChannelId: member.voice.channelId, textChannelId: i.channelId, selfDeaf: true, volume: 80 });
      }
      if (!player.connected) await player.connect();
      await player.queue.add(tracks);
      if (!player.playing && !player.paused) await player.play({ paused: false });
      return i.editReply({ embeds: [successEmbed(`▶️ Playing playlist **${name}** — added ${tracks.length} songs.`)] });
    }

    // ── list ──────────────────────────────────────────────────────────────────
    if (sub === "list") {
      if (playlists.size === 0) return i.editReply({ embeds: [infoEmbed("You have no playlists. Create one with `/playlist create`.")] });
      const embed = new EmbedBuilder().setColor(0x7b2fbe).setTitle("📀 Your Playlists").setFooter({ text: "Dragon's Den Music" })
        .setDescription([...playlists.entries()].map(([n, t], idx) =>
          `\`${idx + 1}.\` **${n}** — ${t.length} song(s)`
        ).join("\n"));
      return i.editReply({ embeds: [embed] });
    }

    // ── show ──────────────────────────────────────────────────────────────────
    if (sub === "show") {
      const name = i.options.getString("name", true).trim();
      if (!playlists.has(name)) return i.editReply({ embeds: [errorEmbed(`No playlist named **${name}**.`)] });
      const tracks = playlists.get(name)!;
      if (tracks.length === 0) return i.editReply({ embeds: [infoEmbed(`Playlist **${name}** is empty.`)] });
      const total = tracks.reduce((a, t) => a + (t.info.duration ?? 0), 0);
      const embed = new EmbedBuilder().setColor(0x7b2fbe).setTitle(`📀 ${name}`).setFooter({ text: `${tracks.length} songs · ${formatDuration(total)} · Dragon's Den Music` })
        .setDescription(tracks.slice(0, 20).map((t, idx) =>
          `\`${idx + 1}.\` [${t.info.title}](${t.info.uri}) — \`${formatDuration(t.info.duration ?? 0)}\``
        ).join("\n") + (tracks.length > 20 ? `\n…and ${tracks.length - 20} more.` : ""));
      return i.editReply({ embeds: [embed] });
    }

    // ── rename ────────────────────────────────────────────────────────────────
    if (sub === "rename") {
      const oldName = i.options.getString("old", true).trim();
      const newName = i.options.getString("new", true).trim();
      if (!playlists.has(oldName)) return i.editReply({ embeds: [errorEmbed(`No playlist named **${oldName}**.`)] });
      if (playlists.has(newName)) return i.editReply({ embeds: [errorEmbed(`A playlist named **${newName}** already exists.`)] });
      playlists.set(newName, playlists.get(oldName)!);
      playlists.delete(oldName);
      return i.editReply({ embeds: [successEmbed(`✏️ Renamed **${oldName}** to **${newName}**.`)] });
    }

    // ── shuffle ───────────────────────────────────────────────────────────────
    if (sub === "shuffle") {
      const name = i.options.getString("name", true).trim();
      if (!playlists.has(name)) return i.editReply({ embeds: [errorEmbed(`No playlist named **${name}**.`)] });
      const tracks = playlists.get(name)!;
      for (let idx = tracks.length - 1; idx > 0; idx--) {
        const j = Math.floor(Math.random() * (idx + 1));
        [tracks[idx], tracks[j]] = [tracks[j], tracks[idx]];
      }
      return i.editReply({ embeds: [successEmbed(`🔀 Shuffled **${name}** (${tracks.length} songs).`)] });
    }

    // ── save ──────────────────────────────────────────────────────────────────
    if (sub === "save") {
      const name = i.options.getString("name", true).trim();
      const player = c.lavalink.getPlayer(i.guildId!);
      if (!player?.queue.current) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
      if (playlists.size >= MAX_PLAYLISTS && !playlists.has(name)) return i.editReply({ embeds: [errorEmbed(`You already have ${MAX_PLAYLISTS} playlists.`)] });
      const all = ([player.queue.current, ...player.queue.tracks] as import("lavalink-client").Track[]).slice(0, MAX_TRACKS);
      playlists.set(name, all);
      return i.editReply({ embeds: [successEmbed(`💾 Saved current queue as **${name}** (${all.length} songs).`)] });
    }

    // ── clear ─────────────────────────────────────────────────────────────────
    if (sub === "clear") {
      const name = i.options.getString("name", true).trim();
      if (!playlists.has(name)) return i.editReply({ embeds: [errorEmbed(`No playlist named **${name}**.`)] });
      const count = playlists.get(name)!.length;
      playlists.set(name, []);
      return i.editReply({ embeds: [successEmbed(`🗑️ Cleared **${count}** songs from **${name}**.`)] });
    }

    // ── info ──────────────────────────────────────────────────────────────────
    if (sub === "info") {
      const name = i.options.getString("name", true).trim();
      if (!playlists.has(name)) return i.editReply({ embeds: [errorEmbed(`No playlist named **${name}**.`)] });
      const tracks = playlists.get(name)!;
      const total = tracks.reduce((a, t) => a + (t.info.duration ?? 0), 0);
      const embed = new EmbedBuilder().setColor(0x7b2fbe).setTitle(`📀 ${name}`).setFooter({ text: "Dragon's Den Music" })
        .addFields(
          { name: "Songs", value: String(tracks.length), inline: true },
          { name: "Total Duration", value: formatDuration(total), inline: true },
        );
      if (tracks[0]) embed.setDescription(`First track: [${tracks[0].info.title}](${tracks[0].info.uri})`);
      return i.editReply({ embeds: [embed] });
    }

    return i.editReply({ embeds: [errorEmbed("Unknown subcommand.")] });
  },
};

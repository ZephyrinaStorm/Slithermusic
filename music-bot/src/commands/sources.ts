import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import type { LavalinkSearchPlatform } from "lavalink-client";
import { Command, BotClient } from "../types.js";
import { errorEmbed, infoEmbed } from "../utils/embeds.js";
import { formatDuration } from "../utils/duration.js";

type SourceDefinition = {
  name: string;
  label: string;
  description: string;
  source: LavalinkSearchPlatform;
};

async function sourceSearch(
  i: ChatInputCommandInteraction,
  c: BotClient,
  source: LavalinkSearchPlatform,
  label: string
) {
  await i.deferReply();
  const member = i.member as GuildMember;
  if (!member.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
  let player = c.lavalink.getPlayer(i.guildId!);
  if (!player) {
    player = c.lavalink.createPlayer({ guildId: i.guildId!, voiceChannelId: member.voice.channelId, textChannelId: i.channelId, selfDeaf: true, volume: 80 });
  }
  if (!player.connected) await player.connect();
  const query = i.options.getString("query", true);
  let result;
  try {
    result = await player.search({ query, source }, i.user);
  } catch {
    return i.editReply({ embeds: [errorEmbed(`${label} search is temporarily unavailable. Please try again.`)] });
  }
  if (!result?.tracks.length || result.loadType === "empty" || result.loadType === "error")
    return i.editReply({ embeds: [errorEmbed(`No ${label} results found for **${query}**.`)] });
  const track = result.tracks[0];
  await player.queue.add(track);
  const wasEmpty = !player.playing && !player.paused;
  const embed = infoEmbed(
    wasEmpty
      ? `▶️ **Now playing** [${label}]: [${track.info.title}](${track.info.uri})\n🎤 ${track.info.author} · ⏱️ ${formatDuration(track.info.duration ?? 0)}`
      : `➕ **Queued** [${label}]: [${track.info.title}](${track.info.uri})\n🎤 ${track.info.author} · ⏱️ ${formatDuration(track.info.duration ?? 0)}`
  );
  if (track.info.artworkUrl) embed.setThumbnail(track.info.artworkUrl);
  if (wasEmpty) await player.play({ paused: false });
  return i.editReply({ embeds: [embed] });
}

const legacySources: SourceDefinition[] = [
  { name: "youtube", label: "YouTube", description: "Search and play from YouTube", source: "ytsearch" },
  { name: "soundcloud", label: "SoundCloud", description: "Search and play from SoundCloud", source: "scsearch" },
  { name: "spotify", label: "Spotify", description: "Search and play from Spotify", source: "spsearch" },
  { name: "applemusic", label: "Apple Music", description: "Search and play from Apple Music", source: "amsearch" },
  { name: "deezer", label: "Deezer", description: "Search and play from Deezer", source: "dzsearch" },
];

const additionalSources: SourceDefinition[] = [
  { name: "amazonmusic", label: "Amazon Music", description: "Search and play from Amazon Music", source: "amzsearch" },
  { name: "gaana", label: "Gaana", description: "Search and play from Gaana", source: "gnsearch" },
  { name: "tidal", label: "Tidal", description: "Search and play from Tidal", source: "tdsearch" },
];

const createSourceCommand = ({ name, label, description, source }: SourceDefinition): Command => ({
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription(description)
    .addStringOption((option) =>
      option.setName("query").setDescription("Song, artist, or album name").setRequired(true)
    ),
  async execute(i, c) {
    return sourceSearch(i, c, source, label);
  },
});

const platformCommand: Command = {
  data: additionalSources.reduce(
    (builder, { name, label, description }) =>
      builder.addSubcommand((subcommand) =>
        subcommand
          .setName(name)
          .setDescription(description.replace("Search and play from ", "Search "))
          .addStringOption((option) =>
            option.setName("query").setDescription(`${label} song, artist, or album`).setRequired(true)
          )
      ),
    new SlashCommandBuilder()
      .setName("platform")
      .setDescription("Search and play from additional music platforms")
  ),
  async execute(i, c) {
    const definition = additionalSources.find(({ name }) => name === i.options.getSubcommand());
    if (!definition) {
      return i.reply({ embeds: [errorEmbed("Choose a supported platform subcommand.")] });
    }
    return sourceSearch(i, c, definition.source, definition.label);
  },
};

const sourcesCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("sources")
    .setDescription("List all music platforms supported by Slither Music"),
  async execute(i) {
    return i.reply({
      embeds: [
        infoEmbed(
          "## 🎵 Slither Music Sources\n\n" +
          "**Search by name**\n" +
          "YouTube · SoundCloud · Spotify · Apple Music · Deezer\n" +
          "Amazon Music · Gaana · Tidal\n\n" +
          "**Additional searches**\n" +
          "Use `/platform` and choose **Amazon Music**, **Gaana**, or **Tidal**.\n\n" +
          "**Direct links**\n" +
          "Use `/play <url>` for compatible links from Bandcamp, Vimeo, Niconico, Pandora, Shazam, Bilibili, Yandex Music, and HTTP audio streams.\n\n" +
          "Search results are resolved through the active Lavalink audio node."
        ),
      ],
    });
  },
};

export const sourceCommands: Command[] = [
  ...legacySources.map(createSourceCommand),
  platformCommand,
  sourcesCommand,
];

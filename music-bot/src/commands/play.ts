import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { Command, BotClient } from "../types.js";
import { errorEmbed, infoEmbed } from "../utils/embeds.js";
import { formatDuration } from "../utils/duration.js";

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song or playlist from YouTube, Spotify, SoundCloud, and more")
    .addStringOption((opt) =>
      opt
        .setName("query")
        .setDescription("Song name, URL, or playlist link")
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    await interaction.deferReply();

    const member = interaction.member as GuildMember;
    if (!member.voice.channelId) {
      return void interaction.editReply({ embeds: [errorEmbed("You must be in a voice channel to use this command.")] });
    }

    const query = interaction.options.getString("query", true);

    let player = client.lavalink.getPlayer(interaction.guildId!);
    if (!player) {
      player = client.lavalink.createPlayer({
        guildId: interaction.guildId!,
        voiceChannelId: member.voice.channelId,
        textChannelId: interaction.channelId,
        selfDeaf: true,
        selfMute: false,
        volume: 80,
      });
    }

    if (!player.connected) {
      await player.connect();
    }

    // Detect if query is a URL or plain search
    let source: "ytmsearch" | "ytsearch" | "scsearch" | "dzsearch" | undefined;
    const isUrl = /^https?:\/\//.test(query);
    if (!isUrl) source = "ytmsearch";

    let result;
    try {
      result = await player.search({ query, source }, interaction.user);
    } catch (err) {
      return void interaction.editReply({ embeds: [errorEmbed("Failed to search for that track. Please try again.")] });
    }

    if (!result || result.loadType === "empty" || result.loadType === "error") {
      return void interaction.editReply({ embeds: [errorEmbed("No results found for that query.")] });
    }

    const wasEmpty = player.queue.tracks.length === 0 && !player.queue.current;

    if (result.loadType === "playlist") {
      await player.queue.add(result.tracks);
      const embed = infoEmbed(
        `📋 **Playlist queued:** [${result.playlist?.name ?? "Playlist"}](${query})\n` +
        `Added **${result.tracks.length}** tracks to the queue.`
      );
      if (result.playlist?.thumbnail) embed.setThumbnail(result.playlist.thumbnail);
      await interaction.editReply({ embeds: [embed] });
    } else {
      const track = result.tracks[0];
      await player.queue.add(track);
      const embed = infoEmbed(
        wasEmpty && !player.playing
          ? `▶️ **Now playing:** [${track.info.title}](${track.info.uri})\n🎤 ${track.info.author} · ⏱️ ${track.info.isStream ? "LIVE" : formatDuration(track.info.duration ?? 0)}`
          : `➕ **Added to queue:** [${track.info.title}](${track.info.uri})\n🎤 ${track.info.author} · ⏱️ ${track.info.isStream ? "LIVE" : formatDuration(track.info.duration ?? 0)}\n📍 Position: #${player.queue.tracks.length}`
      );
      if (track.info.artworkUrl) embed.setThumbnail(track.info.artworkUrl);
      await interaction.editReply({ embeds: [embed] });
    }

    if (!player.playing && !player.paused) {
      await player.play({ paused: false });
    }
  },
};

import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Command, BotClient } from "../types.js";
import { errorEmbed } from "../utils/embeds.js";
import { formatDuration, progressBar } from "../utils/duration.js";

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("Show the currently playing song"),

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    await interaction.deferReply();

    const player = client.lavalink.getPlayer(interaction.guildId!);
    if (!player || !player.queue.current) {
      return void interaction.editReply({ embeds: [errorEmbed("Nothing is currently playing.")] });
    }

    const track = player.queue.current;
    const position = player.position;
    const duration = track.info.duration;

    const bar = track.info.isStream ? "🔴 LIVE STREAM" : `${progressBar(position, duration)} \`${formatDuration(position)} / ${formatDuration(duration)}\``;

    const repeatModes: Record<string, string> = {
      off: "Off",
      track: "🔂 Track",
      queue: "🔁 Queue",
      autoplay: "♾️ Autoplay",
    };

    const embed = new EmbedBuilder()
      .setColor(0x7b2fbe)
      .setTitle("🎵 Now Playing")
      .setFooter({ text: "Dragon's Den Music" })
      .setDescription(
        `**[${track.info.title}](${track.info.uri})**\n` +
        `🎤 ${track.info.author}\n\n` +
        bar
      )
      .addFields(
        { name: "Volume", value: `${player.volume}%`, inline: true },
        { name: "Loop", value: repeatModes[player.repeatMode as string] ?? "Off", inline: true },
        { name: "Source", value: capitalise(track.info.sourceName ?? "Unknown"), inline: true },
        { name: "Requested by", value: `<@${(track.requester as { id?: string } | undefined)?.id ?? "Unknown"}>`, inline: true },
        { name: "Queue", value: `${player.queue.tracks.length} song(s) remaining`, inline: true },
        { name: "Status", value: player.paused ? "⏸️ Paused" : "▶️ Playing", inline: true }
      );

    if (track.info.artworkUrl) embed.setThumbnail(track.info.artworkUrl);

    await interaction.editReply({ embeds: [embed] });
  },
};

function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

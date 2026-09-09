import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Command, BotClient } from "../types.js";
import { errorEmbed } from "../utils/embeds.js";
import { formatDuration } from "../utils/duration.js";

const PAGE_SIZE = 10;

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Show the music queue")
    .addIntegerOption((opt) =>
      opt
        .setName("page")
        .setDescription("Page number")
        .setMinValue(1)
    ),

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    await interaction.deferReply();

    const player = client.lavalink.getPlayer(interaction.guildId!);
    if (!player || !player.queue.current) {
      return void interaction.editReply({ embeds: [errorEmbed("Nothing is currently playing.")] });
    }

    const queue = player.queue.tracks;
    const current = player.queue.current;
    const totalPages = Math.max(1, Math.ceil(queue.length / PAGE_SIZE));
    const page = Math.min(interaction.options.getInteger("page") ?? 1, totalPages);
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    const totalDuration = queue.reduce((acc, t) => acc + (t.info.duration ?? 0), 0);

    let description = `**Now Playing:**\n▶️ [${current.info.title}](${current.info.uri}) — \`${current.info.isStream ? "LIVE" : formatDuration(current.info.duration)}\`\n\n`;

    if (queue.length === 0) {
      description += "*No songs in the queue.*";
    } else {
      description += `**Up Next:**\n`;
      description += queue.slice(start, end).map((track, i) =>
        `\`${start + i + 1}.\` [${track.info.title}](${track.info.uri}) — \`${track.info.isStream ? "LIVE" : formatDuration(track.info.duration ?? 0)}\``
      ).join("\n");
    }

    const embed = new EmbedBuilder()
      .setColor(0x7b2fbe)
      .setTitle("📋 Music Queue")
      .setDescription(description)
      .setFooter({ text: `Dragon's Den Music · Page ${page}/${totalPages} · ${queue.length} song(s) · Total: ${formatDuration(totalDuration)}` });

    if (current.info.artworkUrl) embed.setThumbnail(current.info.artworkUrl);

    await interaction.editReply({ embeds: [embed] });
  },
};

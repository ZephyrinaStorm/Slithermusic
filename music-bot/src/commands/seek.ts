import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { Command, BotClient } from "../types.js";
import { errorEmbed, successEmbed } from "../utils/embeds.js";
import { formatDuration } from "../utils/duration.js";

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("seek")
    .setDescription("Seek to a specific position in the current song")
    .addStringOption((opt) =>
      opt
        .setName("position")
        .setDescription('Time to seek to, e.g. "1:30" or "90" (seconds)')
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    await interaction.deferReply();

    const member = interaction.member as GuildMember;
    if (!member.voice.channelId) {
      return void interaction.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    }

    const player = client.lavalink.getPlayer(interaction.guildId!);
    if (!player || !player.queue.current) {
      return void interaction.editReply({ embeds: [errorEmbed("Nothing is currently playing.")] });
    }

    if (player.queue.current.info.isStream) {
      return void interaction.editReply({ embeds: [errorEmbed("Cannot seek in a live stream.")] });
    }

    const posStr = interaction.options.getString("position", true);
    const ms = parseTime(posStr);

    if (ms === null) {
      return void interaction.editReply({
        embeds: [errorEmbed("Invalid time format. Use `1:30` or `90` (seconds).")],
      });
    }

    const duration = player.queue.current.info.duration ?? 0;
    if (ms > duration) {
      return void interaction.editReply({
        embeds: [errorEmbed(`Cannot seek past the song duration (${formatDuration(duration)}).`)],
      });
    }

    await player.seek(ms);
    await interaction.editReply({ embeds: [successEmbed(`⏩ Seeked to **${formatDuration(ms)}**`)] });
  },
};

function parseTime(input: string): number | null {
  if (/^\d+:\d{2}$/.test(input)) {
    const [min, sec] = input.split(":").map(Number);
    return (min * 60 + sec) * 1000;
  }
  if (/^\d+$/.test(input)) {
    return parseInt(input, 10) * 1000;
  }
  return null;
}

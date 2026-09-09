import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { Command, BotClient } from "../types.js";
import { errorEmbed, successEmbed, infoEmbed } from "../utils/embeds.js";

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Set or check the playback volume")
    .addIntegerOption((opt) =>
      opt
        .setName("level")
        .setDescription("Volume level (1-100)")
        .setMinValue(1)
        .setMaxValue(100)
    ),

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    await interaction.deferReply();

    const member = interaction.member as GuildMember;
    if (!member.voice.channelId) {
      return void interaction.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    }

    const player = client.lavalink.getPlayer(interaction.guildId!);
    if (!player) {
      return void interaction.editReply({ embeds: [errorEmbed("Nothing is currently playing.")] });
    }

    const level = interaction.options.getInteger("level");
    if (level === null) {
      return void interaction.editReply({
        embeds: [infoEmbed(`🔊 Current volume: **${player.volume}%**`)],
      });
    }

    await player.setVolume(level);
    const emoji = level === 0 ? "🔇" : level < 30 ? "🔈" : level < 70 ? "🔉" : "🔊";
    await interaction.editReply({ embeds: [successEmbed(`${emoji} Volume set to **${level}%**`)] });
  },
};

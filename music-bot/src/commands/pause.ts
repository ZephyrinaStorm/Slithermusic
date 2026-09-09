import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { Command, BotClient } from "../types.js";
import { errorEmbed, successEmbed } from "../utils/embeds.js";

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the currently playing song"),

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    await interaction.deferReply();

    const member = interaction.member as GuildMember;
    if (!member.voice.channelId) {
      return void interaction.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    }

    const player = client.lavalink.getPlayer(interaction.guildId!);
    if (!player || !player.playing) {
      return void interaction.editReply({ embeds: [errorEmbed("Nothing is currently playing.")] });
    }

    if (player.paused) {
      return void interaction.editReply({ embeds: [errorEmbed("The player is already paused. Use `/resume` to unpause.")] });
    }

    await player.pause();
    await interaction.editReply({ embeds: [successEmbed("Paused the music.")] });
  },
};

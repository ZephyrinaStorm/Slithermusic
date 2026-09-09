import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { Command, BotClient } from "../types.js";
import { errorEmbed, successEmbed } from "../utils/embeds.js";

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("disconnect")
    .setDescription("Disconnect the bot from the voice channel"),

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    await interaction.deferReply();

    const member = interaction.member as GuildMember;
    if (!member.voice.channelId) {
      return void interaction.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    }

    const player = client.lavalink.getPlayer(interaction.guildId!);
    if (!player) {
      return void interaction.editReply({ embeds: [errorEmbed("The bot is not in a voice channel.")] });
    }

    await player.destroy();
    await interaction.editReply({ embeds: [successEmbed("👋 Disconnected and cleared the queue.")] });
  },
};

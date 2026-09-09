import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { Command, BotClient } from "../types.js";
import { errorEmbed, successEmbed } from "../utils/embeds.js";

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop the music and clear the queue"),

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

    await player.stopPlaying(true, false);
    player.queue.tracks.splice(0, player.queue.tracks.length);

    await interaction.editReply({ embeds: [successEmbed("Stopped the music and cleared the queue.")] });
  },
};

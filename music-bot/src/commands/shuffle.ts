import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { Command, BotClient } from "../types.js";
import { errorEmbed, successEmbed } from "../utils/embeds.js";

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Shuffle the song queue"),

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

    if (player.queue.tracks.length < 2) {
      return void interaction.editReply({
        embeds: [errorEmbed("Need at least 2 songs in the queue to shuffle.")],
      });
    }

    await player.queue.shuffle();
    await interaction.editReply({
      embeds: [successEmbed(`🔀 Shuffled **${player.queue.tracks.length}** songs in the queue.`)],
    });
  },
};

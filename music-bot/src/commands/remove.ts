import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { Command, BotClient } from "../types.js";
import { errorEmbed, successEmbed } from "../utils/embeds.js";

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove a song from the queue by its position")
    .addIntegerOption((opt) =>
      opt
        .setName("position")
        .setDescription("Position in the queue (use /queue to see positions)")
        .setRequired(true)
        .setMinValue(1)
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

    const position = interaction.options.getInteger("position", true);
    if (position > player.queue.tracks.length) {
      return void interaction.editReply({
        embeds: [errorEmbed(`Invalid position. The queue only has **${player.queue.tracks.length}** song(s).`)],
      });
    }

    const removed = player.queue.tracks.splice(position - 1, 1)[0];
    await interaction.editReply({
      embeds: [successEmbed(`🗑️ Removed **${removed.info.title}** from position #${position}.`)],
    });
  },
};

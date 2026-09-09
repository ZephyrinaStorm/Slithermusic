import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { Command, BotClient } from "../types.js";
import { errorEmbed, successEmbed } from "../utils/embeds.js";

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current song")
    .addIntegerOption((opt) =>
      opt
        .setName("amount")
        .setDescription("Number of songs to skip (default: 1)")
        .setMinValue(1)
    ),

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

    const amount = interaction.options.getInteger("amount") ?? 1;
    const currentTitle = player.queue.current?.info.title ?? "Unknown";

    if (amount > 1) {
      // Remove extra tracks from queue before skipping
      const toRemove = Math.min(amount - 1, player.queue.tracks.length);
      for (let i = 0; i < toRemove; i++) {
        player.queue.tracks.shift();
      }
    }

    await player.skip();

    const reply = amount > 1
      ? `Skipped **${amount}** songs.`
      : `Skipped **${currentTitle}**.`;

    await interaction.editReply({ embeds: [successEmbed(reply)] });
  },
};

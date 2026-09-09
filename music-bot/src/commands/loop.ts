import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { Command, BotClient } from "../types.js";
import { errorEmbed, successEmbed } from "../utils/embeds.js";
import type { RepeatMode } from "lavalink-client";

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Set the loop/repeat mode")
    .addStringOption((opt) =>
      opt
        .setName("mode")
        .setDescription("Loop mode")
        .setRequired(true)
        .addChoices(
          { name: "Off — no looping", value: "off" },
          { name: "Track — repeat current song", value: "track" },
          { name: "Queue — repeat the whole queue", value: "queue" }
        )
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

    const mode = interaction.options.getString("mode", true) as RepeatMode;
    await player.setRepeatMode(mode);

    const messages: Record<string, string> = {
      off: "Loop disabled.",
      track: "🔂 Now looping the current track.",
      queue: "🔁 Now looping the entire queue.",
    };

    await interaction.editReply({ embeds: [successEmbed(messages[mode] ?? "Loop mode updated.")] });
  },
};

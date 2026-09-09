import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { Command, BotClient } from "../types.js";
import { errorEmbed, successEmbed } from "../utils/embeds.js";

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("move")
    .setDescription("Move a song to a different position in the queue")
    .addIntegerOption((opt) =>
      opt.setName("from").setDescription("Current position of the song").setRequired(true).setMinValue(1)
    )
    .addIntegerOption((opt) =>
      opt.setName("to").setDescription("New position for the song").setRequired(true).setMinValue(1)
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

    const from = interaction.options.getInteger("from", true);
    const to = interaction.options.getInteger("to", true);
    const queueLen = player.queue.tracks.length;

    if (from > queueLen) {
      return void interaction.editReply({ embeds: [errorEmbed(`Position ${from} doesn't exist. Queue has ${queueLen} song(s).`)] });
    }
    if (to > queueLen) {
      return void interaction.editReply({ embeds: [errorEmbed(`Position ${to} doesn't exist. Queue has ${queueLen} song(s).`)] });
    }
    if (from === to) {
      return void interaction.editReply({ embeds: [errorEmbed("The positions are the same.")] });
    }

    const [track] = player.queue.tracks.splice(from - 1, 1);
    player.queue.tracks.splice(to - 1, 0, track);

    await interaction.editReply({
      embeds: [successEmbed(`↕️ Moved **${track.info.title}** from position #${from} to #${to}.`)],
    });
  },
};

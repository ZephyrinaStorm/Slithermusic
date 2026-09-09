import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ComponentType,
  EmbedBuilder,
} from "discord.js";
import { Command, BotClient } from "../types.js";
import { errorEmbed, infoEmbed } from "../utils/embeds.js";
import { formatDuration } from "../utils/duration.js";

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search for a song and pick from results")
    .addStringOption((opt) =>
      opt.setName("query").setDescription("Song name to search for").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    await interaction.deferReply();

    const member = interaction.member as GuildMember;
    if (!member.voice.channelId) {
      return void interaction.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    }

    let player = client.lavalink.getPlayer(interaction.guildId!);
    if (!player) {
      player = client.lavalink.createPlayer({
        guildId: interaction.guildId!,
        voiceChannelId: member.voice.channelId,
        textChannelId: interaction.channelId,
        selfDeaf: true,
        volume: 80,
      });
    }

    const query = interaction.options.getString("query", true);
    let result;
    try {
      result = await player.search({ query, source: "ytmsearch" }, interaction.user);
    } catch {
      return void interaction.editReply({ embeds: [errorEmbed("Search failed. Please try again.")] });
    }

    if (!result || result.loadType === "empty" || result.loadType === "error" || result.tracks.length === 0) {
      return void interaction.editReply({ embeds: [errorEmbed(`No results found for **${query}**.`)] });
    }

    const top5 = result.tracks.slice(0, 5);

    const select = new StringSelectMenuBuilder()
      .setCustomId("search_select")
      .setPlaceholder("Choose a song to play...")
      .addOptions(
        top5.map((track, i) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(`${i + 1}. ${track.info.title.slice(0, 80)}`)
            .setDescription(`${track.info.author} · ${formatDuration(track.info.duration ?? 0)}`)
            .setValue(String(i))
        )
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

    const embed = new EmbedBuilder()
      .setColor(0x7b2fbe)
      .setTitle(`🔎 Search results for: ${query}`)
      .setDescription(
        top5
          .map((t, i) => `**${i + 1}.** [${t.info.title}](${t.info.uri}) — \`${formatDuration(t.info.duration ?? 0)}\``)
          .join("\n")
      )
      .setFooter({ text: "Dragon's Den Music · Select a song below — expires in 30 seconds." });

    const reply = await interaction.editReply({ embeds: [embed], components: [row] });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 30_000,
      filter: (i) => i.user.id === interaction.user.id,
    });

    collector.on("collect", async (i) => {
      collector.stop();
      const index = parseInt(i.values[0], 10);
      const track = top5[index];

      if (!player!.connected) await player!.connect();

      await player!.queue.add(track);
      const wasEmpty = !player!.playing && !player!.paused;

      const addedEmbed = infoEmbed(
        wasEmpty
          ? `▶️ **Now playing:** [${track.info.title}](${track.info.uri})\n🎤 ${track.info.author} · ⏱️ ${formatDuration(track.info.duration ?? 0)}`
          : `➕ **Added to queue:** [${track.info.title}](${track.info.uri})\n🎤 ${track.info.author} · ⏱️ ${formatDuration(track.info.duration ?? 0)}`
      );
      if (track.info.artworkUrl) addedEmbed.setThumbnail(track.info.artworkUrl);

      await i.update({ embeds: [addedEmbed], components: [] });

      if (wasEmpty) await player!.play({ paused: false });
    });

    collector.on("end", async (_collected, reason) => {
      if (reason === "time") {
        await interaction.editReply({ components: [] }).catch(() => null);
      }
    });
  },
};

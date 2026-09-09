import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { Command, BotClient } from "../types.js";
import { errorEmbed, successEmbed, infoEmbed } from "../utils/embeds.js";
import { getSettings } from "../stores.js";

// ─── 1. /dj ──────────────────────────────────────────────────────────────────
const dj: Command = {
  data: new SlashCommandBuilder().setName("dj").setDescription("Manage the DJ role (only DJs can use music commands)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(s => s.setName("set").setDescription("Set the DJ role")
      .addRoleOption(o => o.setName("role").setDescription("The DJ role").setRequired(true)))
    .addSubcommand(s => s.setName("clear").setDescription("Remove the DJ role restriction"))
    .addSubcommand(s => s.setName("info").setDescription("Show the current DJ role")),
  async execute(i) {
    await i.deferReply();
    const sub = i.options.getSubcommand(true);
    const settings = getSettings(i.guildId!);
    if (sub === "set") {
      const role = i.options.getRole("role", true);
      settings.djRoleId = role.id;
      return i.editReply({ embeds: [successEmbed(`🎧 DJ role set to **${role.name}**. Only members with this role can control music.`)] });
    }
    if (sub === "clear") {
      settings.djRoleId = null;
      return i.editReply({ embeds: [successEmbed("DJ role removed — everyone can use music commands.")] });
    }
    return i.editReply({
      embeds: [infoEmbed(settings.djRoleId ? `🎧 DJ role: <@&${settings.djRoleId}>` : "No DJ role set — everyone can use music commands.")],
    });
  },
};

// ─── 2. /color ───────────────────────────────────────────────────────────────
const color: Command = {
  data: new SlashCommandBuilder().setName("color").setDescription("Set a custom embed color for this server")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o => o.setName("hex").setDescription("Hex color code, e.g. #7B2FBE").setRequired(true)),
  async execute(i) {
    await i.deferReply();
    const hex = i.options.getString("hex", true).replace("#", "").trim();
    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return i.editReply({ embeds: [errorEmbed("Invalid hex color. Use format `#RRGGBB`.")] });
    const num = parseInt(hex, 16);
    const settings = getSettings(i.guildId!);
    settings.embedColor = num;
    return i.editReply({
      embeds: [new EmbedBuilder().setColor(num).setDescription(`✅ Embed color set to **#${hex.toUpperCase()}**.`).setFooter({ text: "Dragon's Den Music" })],
    });
  },
};

// ─── 3. /channellock ─────────────────────────────────────────────────────────
const channellock: Command = {
  data: new SlashCommandBuilder().setName("channellock").setDescription("Lock music commands to the current text channel (or unlock)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(i) {
    await i.deferReply();
    const settings = getSettings(i.guildId!);
    if (settings.textChannelLock === i.channelId) {
      settings.textChannelLock = null;
      return i.editReply({ embeds: [successEmbed("🔓 Channel lock removed — commands work in all channels.")] });
    }
    settings.textChannelLock = i.channelId;
    return i.editReply({ embeds: [successEmbed(`🔒 Locked to <#${i.channelId}> — music commands only work here.`)] });
  },
};

// ─── 4. /np ──────────────────────────────────────────────────────────────────
const np: Command = {
  data: new SlashCommandBuilder().setName("np").setDescription("Alias for /nowplaying — shows the current song"),
  async execute(i, c) {
    const { command } = await import("./nowplaying.js");
    return command.execute(i, c);
  },
};

// ─── 5. /boost ───────────────────────────────────────────────────────────────
const boost: Command = {
  data: new SlashCommandBuilder().setName("boost").setDescription("Toggle a strong bass + clarity boost preset"),
  async execute(i, c) {
    await i.deferReply();
    const member = i.member as GuildMember;
    if (!member.voice.channelId) return i.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player?.queue.current) return i.editReply({ embeds: [errorEmbed("Nothing is playing.")] });
    const { getFilters } = await import("../stores.js");
    const filters = getFilters(i.guildId!);
    const { FilterManager } = await import("lavalink-client");
    const fm = player.filterManager as any;
    if (filters.has("boost")) {
      fm.equalizerBands = [];
      await fm.applyPlayerFilters();
      filters.delete("boost");
      return i.editReply({ embeds: [successEmbed("Boost disabled.")] });
    }
    fm.equalizerBands = FilterManager.EQList.BassboostHigh;
    await fm.applyPlayerFilters();
    filters.add("boost");
    filters.delete("soft"); filters.delete("pop"); filters.delete("treble"); filters.delete("bassboost");
    return i.editReply({ embeds: [successEmbed("🔊 Boost enabled (bass boost high + enhanced clarity).")] });
  },
};

export const settingsCommands: Command[] = [dj, color, channellock, np, boost];

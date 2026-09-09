import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  EmbedBuilder,
} from "discord.js";
import { FilterManager } from "lavalink-client";
import { Command, BotClient } from "../types.js";
import { errorEmbed, successEmbed, infoEmbed } from "../utils/embeds.js";
import { getFilters } from "../stores.js";

// ─── Helper ───────────────────────────────────────────────────────────────────
function requirePlayer(interaction: ChatInputCommandInteraction, client: BotClient) {
  const member = interaction.member as GuildMember;
  if (!member.voice.channelId) return null;
  return client.lavalink.getPlayer(interaction.guildId!) ?? null;
}

async function filterCmd(
  interaction: ChatInputCommandInteraction,
  client: BotClient,
  fn: (fm: InstanceType<typeof FilterManager>, filters: Set<string>) => Promise<string>
) {
  await interaction.deferReply();
  const member = interaction.member as GuildMember;
  if (!member.voice.channelId)
    return interaction.editReply({ embeds: [errorEmbed("You must be in a voice channel.")] });
  const player = client.lavalink.getPlayer(interaction.guildId!);
  if (!player?.queue.current)
    return interaction.editReply({ embeds: [errorEmbed("Nothing is currently playing.")] });
  const filters = getFilters(interaction.guildId!);
  const msg = await fn(player.filterManager as InstanceType<typeof FilterManager>, filters);
  return interaction.editReply({ embeds: [successEmbed(msg)] });
}

// ─── 1. /bassboost ────────────────────────────────────────────────────────────
const bassboost: Command = {
  data: new SlashCommandBuilder()
    .setName("bassboost")
    .setDescription("Apply a bass boost EQ preset")
    .addStringOption(o =>
      o.setName("level").setDescription("Boost level").setRequired(true)
        .addChoices(
          { name: "Off", value: "off" },
          { name: "Low", value: "low" },
          { name: "Medium", value: "medium" },
          { name: "High", value: "high" },
          { name: "Extreme (earrape)", value: "extreme" }
        )),
  async execute(i, c) {
    await filterCmd(i, c, async (fm, filters) => {
      const level = i.options.getString("level", true);
      const eqMap: Record<string, (typeof FilterManager.EQList)[keyof typeof FilterManager.EQList] | null> = {
        off: null,
        low: FilterManager.EQList.BassboostLow,
        medium: FilterManager.EQList.BassboostMedium,
        high: FilterManager.EQList.BassboostHigh,
        extreme: FilterManager.EQList.BassboostEarrape,
      };
      const bands = eqMap[level];
      if (bands) {
        (fm as any).equalizerBands = bands;
        filters.add("bassboost");
      } else {
        (fm as any).equalizerBands = [];
        filters.delete("bassboost");
      }
      await fm.applyPlayerFilters();
      return level === "off" ? "Bass boost disabled." : `🔊 Bass boost set to **${level}**.`;
    });
  },
};

// ─── 2. /nightcore ────────────────────────────────────────────────────────────
const nightcore: Command = {
  data: new SlashCommandBuilder().setName("nightcore").setDescription("Toggle nightcore effect (faster + higher pitch)"),
  async execute(i, c) {
    await filterCmd(i, c, async (fm, filters) => {
      await fm.toggleNightcore();
      const on = !filters.has("nightcore");
      on ? filters.add("nightcore") : filters.delete("nightcore");
      filters.delete("vaporwave"); filters.delete("daycore"); filters.delete("doubletime"); filters.delete("slowmo");
      return on ? "🌸 Nightcore enabled." : "Nightcore disabled.";
    });
  },
};

// ─── 3. /vaporwave ────────────────────────────────────────────────────────────
const vaporwave: Command = {
  data: new SlashCommandBuilder().setName("vaporwave").setDescription("Toggle vaporwave effect (slower + lower pitch)"),
  async execute(i, c) {
    await filterCmd(i, c, async (fm, filters) => {
      await fm.toggleVaporwave();
      const on = !filters.has("vaporwave");
      on ? filters.add("vaporwave") : filters.delete("vaporwave");
      filters.delete("nightcore"); filters.delete("daycore"); filters.delete("doubletime"); filters.delete("slowmo");
      return on ? "🌊 Vaporwave enabled." : "Vaporwave disabled.";
    });
  },
};

// ─── 4. /8d ───────────────────────────────────────────────────────────────────
const eightd: Command = {
  data: new SlashCommandBuilder().setName("8d").setDescription("Toggle 8D spatial audio effect"),
  async execute(i, c) {
    await filterCmd(i, c, async (fm, filters) => {
      await fm.toggleRotation();
      const on = !filters.has("8d");
      on ? filters.add("8d") : filters.delete("8d");
      return on ? "🎧 8D audio enabled — use headphones for best effect!" : "8D audio disabled.";
    });
  },
};

// ─── 5. /karaoke ─────────────────────────────────────────────────────────────
const karaoke: Command = {
  data: new SlashCommandBuilder().setName("karaoke").setDescription("Toggle karaoke filter (reduces vocals)"),
  async execute(i, c) {
    await filterCmd(i, c, async (fm, filters) => {
      await fm.toggleKaraoke();
      const on = !filters.has("karaoke");
      on ? filters.add("karaoke") : filters.delete("karaoke");
      return on ? "🎤 Karaoke filter enabled." : "Karaoke filter disabled.";
    });
  },
};

// ─── 6. /tremolo ─────────────────────────────────────────────────────────────
const tremolo: Command = {
  data: new SlashCommandBuilder().setName("tremolo").setDescription("Toggle tremolo effect (rapid volume oscillation)"),
  async execute(i, c) {
    await filterCmd(i, c, async (fm, filters) => {
      await fm.toggleTremolo();
      const on = !filters.has("tremolo");
      on ? filters.add("tremolo") : filters.delete("tremolo");
      return on ? "〰️ Tremolo enabled." : "Tremolo disabled.";
    });
  },
};

// ─── 7. /vibrato ─────────────────────────────────────────────────────────────
const vibrato: Command = {
  data: new SlashCommandBuilder().setName("vibrato").setDescription("Toggle vibrato effect (rapid pitch oscillation)"),
  async execute(i, c) {
    await filterCmd(i, c, async (fm, filters) => {
      await fm.toggleVibrato();
      const on = !filters.has("vibrato");
      on ? filters.add("vibrato") : filters.delete("vibrato");
      return on ? "🎵 Vibrato enabled." : "Vibrato disabled.";
    });
  },
};

// ─── 8. /lowpass ─────────────────────────────────────────────────────────────
const lowpass: Command = {
  data: new SlashCommandBuilder().setName("lowpass").setDescription("Toggle low-pass filter (softens treble, emphasises bass)")
    .addNumberOption(o => o.setName("smoothing").setDescription("Smoothing factor (default 20)").setMinValue(1).setMaxValue(100)),
  async execute(i, c) {
    await filterCmd(i, c, async (fm, filters) => {
      const smoothing = i.options.getNumber("smoothing") ?? undefined;
      await fm.toggleLowPass(smoothing);
      const on = !filters.has("lowpass");
      on ? filters.add("lowpass") : filters.delete("lowpass");
      return on ? "🔉 Low-pass filter enabled." : "Low-pass filter disabled.";
    });
  },
};

// ─── 9. /speed ───────────────────────────────────────────────────────────────
const speed: Command = {
  data: new SlashCommandBuilder().setName("speed").setDescription("Set playback speed")
    .addNumberOption(o => o.setName("value").setDescription("Speed multiplier (0.25–3.0, default 1.0)").setRequired(true).setMinValue(0.25).setMaxValue(3.0)),
  async execute(i, c) {
    await filterCmd(i, c, async (fm, filters) => {
      const val = i.options.getNumber("value", true);
      await fm.setSpeed(val);
      if (val !== 1.0) { filters.add("speed"); filters.delete("nightcore"); filters.delete("vaporwave"); }
      else filters.delete("speed");
      return `⏩ Speed set to **${val}x**.`;
    });
  },
};

// ─── 10. /pitch ──────────────────────────────────────────────────────────────
const pitch: Command = {
  data: new SlashCommandBuilder().setName("pitch").setDescription("Set audio pitch")
    .addNumberOption(o => o.setName("value").setDescription("Pitch multiplier (0.25–2.0, default 1.0)").setRequired(true).setMinValue(0.25).setMaxValue(2.0)),
  async execute(i, c) {
    await filterCmd(i, c, async (fm, filters) => {
      const val = i.options.getNumber("value", true);
      await fm.setPitch(val);
      if (val !== 1.0) { filters.add("pitch"); filters.delete("nightcore"); filters.delete("vaporwave"); }
      else filters.delete("pitch");
      return `🎼 Pitch set to **${val}x**.`;
    });
  },
};

// ─── 11. /rate ───────────────────────────────────────────────────────────────
const rate: Command = {
  data: new SlashCommandBuilder().setName("rate").setDescription("Set playback rate (affects both speed and pitch)")
    .addNumberOption(o => o.setName("value").setDescription("Rate multiplier (0.25–3.0, default 1.0)").setRequired(true).setMinValue(0.25).setMaxValue(3.0)),
  async execute(i, c) {
    await filterCmd(i, c, async (fm, filters) => {
      const val = i.options.getNumber("value", true);
      await fm.setRate(val);
      if (val !== 1.0) { filters.add("rate"); filters.delete("nightcore"); filters.delete("vaporwave"); }
      else filters.delete("rate");
      return `🎚️ Rate set to **${val}x**.`;
    });
  },
};

// ─── 12. /clearfilters ───────────────────────────────────────────────────────
const clearfilters: Command = {
  data: new SlashCommandBuilder().setName("clearfilters").setDescription("Reset all audio filters to default"),
  async execute(i, c) {
    await filterCmd(i, c, async (fm, filters) => {
      await fm.resetFilters();
      filters.clear();
      return "✨ All filters cleared.";
    });
  },
};

// ─── 13. /chipmunk ───────────────────────────────────────────────────────────
const chipmunk: Command = {
  data: new SlashCommandBuilder().setName("chipmunk").setDescription("Toggle chipmunk effect (high speed + high pitch)"),
  async execute(i, c) {
    await filterCmd(i, c, async (fm, filters) => {
      if (filters.has("chipmunk")) {
        await fm.setSpeed(1); await fm.setPitch(1); filters.delete("chipmunk");
        return "Chipmunk effect disabled.";
      }
      await fm.setSpeed(1.35); await fm.setPitch(1.35);
      filters.add("chipmunk"); filters.delete("nightcore"); filters.delete("vaporwave"); filters.delete("daycore");
      return "🐿️ Chipmunk effect enabled!";
    });
  },
};

// ─── 14. /daycore ────────────────────────────────────────────────────────────
const daycore: Command = {
  data: new SlashCommandBuilder().setName("daycore").setDescription("Toggle daycore effect (slow + low pitch, opposite of nightcore)"),
  async execute(i, c) {
    await filterCmd(i, c, async (fm, filters) => {
      if (filters.has("daycore")) {
        await fm.setSpeed(1); await fm.setPitch(1); filters.delete("daycore");
        return "Daycore disabled.";
      }
      await fm.setSpeed(0.8); await fm.setPitch(0.8);
      filters.add("daycore"); filters.delete("nightcore"); filters.delete("vaporwave"); filters.delete("chipmunk");
      return "🌙 Daycore enabled.";
    });
  },
};

// ─── 15. /doubletime ─────────────────────────────────────────────────────────
const doubletime: Command = {
  data: new SlashCommandBuilder().setName("doubletime").setDescription("Toggle double-time speed (2x playback)"),
  async execute(i, c) {
    await filterCmd(i, c, async (fm, filters) => {
      if (filters.has("doubletime")) {
        await fm.setSpeed(1); filters.delete("doubletime");
        return "Double-time disabled.";
      }
      await fm.setSpeed(2.0);
      filters.add("doubletime"); filters.delete("nightcore"); filters.delete("vaporwave"); filters.delete("slowmo");
      return "⚡ Double-time enabled (2x speed).";
    });
  },
};

// ─── 16. /slowmo ─────────────────────────────────────────────────────────────
const slowmo: Command = {
  data: new SlashCommandBuilder().setName("slowmo").setDescription("Toggle slow-motion effect (0.75x speed)"),
  async execute(i, c) {
    await filterCmd(i, c, async (fm, filters) => {
      if (filters.has("slowmo")) {
        await fm.setSpeed(1); filters.delete("slowmo");
        return "Slow-motion disabled.";
      }
      await fm.setSpeed(0.75);
      filters.add("slowmo"); filters.delete("doubletime"); filters.delete("nightcore");
      return "🐢 Slow-motion enabled (0.75x speed).";
    });
  },
};

// ─── 17. /soft ───────────────────────────────────────────────────────────────
const soft: Command = {
  data: new SlashCommandBuilder().setName("soft").setDescription("Apply a soft/mellow EQ (reduces harsh highs, warms mids)"),
  async execute(i, c) {
    await filterCmd(i, c, async (fm, filters) => {
      if (filters.has("soft")) {
        (fm as any).equalizerBands = []; await fm.applyPlayerFilters(); filters.delete("soft");
        return "Soft EQ disabled.";
      }
      const bands = [
        { band: 0, gain: -0.1 }, { band: 1, gain: 0.05 }, { band: 2, gain: 0.1 },
        { band: 3, gain: 0.1 },  { band: 4, gain: 0.0 },  { band: 5, gain: -0.05 },
        { band: 6, gain: -0.1 }, { band: 7, gain: -0.15 }, { band: 8, gain: -0.15 },
        { band: 9, gain: -0.1 }, { band: 10, gain: -0.05 }, { band: 11, gain: 0.0 },
        { band: 12, gain: 0.0 }, { band: 13, gain: 0.0 },
      ];
      (fm as any).equalizerBands = bands; await fm.applyPlayerFilters();
      filters.add("soft"); filters.delete("pop"); filters.delete("treble"); filters.delete("bassboost");
      return "🎵 Soft EQ applied.";
    });
  },
};

// ─── 18. /pop ────────────────────────────────────────────────────────────────
const pop: Command = {
  data: new SlashCommandBuilder().setName("pop").setDescription("Apply a pop music EQ preset"),
  async execute(i, c) {
    await filterCmd(i, c, async (fm, filters) => {
      if (filters.has("pop")) {
        (fm as any).equalizerBands = []; await fm.applyPlayerFilters(); filters.delete("pop");
        return "Pop EQ disabled.";
      }
      (fm as any).equalizerBands = FilterManager.EQList.Pop;
      await fm.applyPlayerFilters();
      filters.add("pop"); filters.delete("soft"); filters.delete("treble"); filters.delete("bassboost");
      return "🎤 Pop EQ applied.";
    });
  },
};

// ─── 19. /treble ─────────────────────────────────────────────────────────────
const treble: Command = {
  data: new SlashCommandBuilder().setName("treble").setDescription("Toggle treble boost (emphasises high frequencies)"),
  async execute(i, c) {
    await filterCmd(i, c, async (fm, filters) => {
      if (filters.has("treble")) {
        (fm as any).equalizerBands = []; await fm.applyPlayerFilters(); filters.delete("treble");
        return "Treble boost disabled.";
      }
      const bands = [
        { band: 0, gain: -0.1 }, { band: 1, gain: -0.1 }, { band: 2, gain: 0.0 },
        { band: 3, gain: 0.0 },  { band: 4, gain: 0.1 },  { band: 5, gain: 0.2 },
        { band: 6, gain: 0.3 },  { band: 7, gain: 0.35 }, { band: 8, gain: 0.35 },
        { band: 9, gain: 0.35 }, { band: 10, gain: 0.3 }, { band: 11, gain: 0.25 },
        { band: 12, gain: 0.2 }, { band: 13, gain: 0.15 },
      ];
      (fm as any).equalizerBands = bands; await fm.applyPlayerFilters();
      filters.add("treble"); filters.delete("soft"); filters.delete("pop"); filters.delete("bassboost");
      return "✨ Treble boost applied.";
    });
  },
};

// ─── 20. /mono ───────────────────────────────────────────────────────────────
const mono: Command = {
  data: new SlashCommandBuilder().setName("mono").setDescription("Toggle mono audio output (combines L+R channels)"),
  async execute(i, c) {
    await filterCmd(i, c, async (fm, filters) => {
      if (filters.has("mono")) {
        await fm.setAudioOutput("stereo"); filters.delete("mono");
        return "Mono disabled — back to stereo.";
      }
      await fm.setAudioOutput("mono");
      filters.add("mono");
      return "📻 Mono audio enabled.";
    });
  },
};

// ─── 21. /filterinfo ─────────────────────────────────────────────────────────
const filterinfo: Command = {
  data: new SlashCommandBuilder().setName("filterinfo").setDescription("Show all currently active audio filters"),
  async execute(i, c) {
    await i.deferReply();
    const player = c.lavalink.getPlayer(i.guildId!);
    if (!player) return i.editReply({ embeds: [errorEmbed("Nothing is currently playing.")] });
    const filters = getFilters(i.guildId!);
    const embed = new EmbedBuilder()
      .setColor(0x7b2fbe)
      .setTitle("🎛️ Active Filters")
      .setFooter({ text: "Dragon's Den Music" });
    if (filters.size === 0) {
      embed.setDescription("No filters are currently active. Use filter commands to apply effects!");
    } else {
      embed.setDescription([...filters].map(f => `✅ **${f}**`).join("\n"));
    }
    const ts = (player.filterManager as any).filters?.timescale;
    if (ts) {
      embed.addFields({ name: "Timescale", value: `Speed: ${ts.speed ?? 1} · Pitch: ${ts.pitch ?? 1} · Rate: ${ts.rate ?? 1}`, inline: false });
    }
    return i.editReply({ embeds: [embed] });
  },
};

// ─── 22. /equalizer ──────────────────────────────────────────────────────────
const equalizer: Command = {
  data: new SlashCommandBuilder().setName("equalizer").setDescription("Apply a built-in EQ preset")
    .addStringOption(o =>
      o.setName("preset").setDescription("EQ preset to apply").setRequired(true)
        .addChoices(
          { name: "Flat (reset)", value: "flat" },
          { name: "Rock", value: "rock" },
          { name: "Classical", value: "classic" },
          { name: "Pop", value: "pop" },
          { name: "Electronic", value: "electronic" },
          { name: "Gaming", value: "gaming" },
          { name: "Full Sound", value: "fullsound" },
          { name: "Better Music", value: "bettermusic" },
        )),
  async execute(i, c) {
    await filterCmd(i, c, async (fm, filters) => {
      const preset = i.options.getString("preset", true);
      const presetMap: Record<string, (typeof FilterManager.EQList)[keyof typeof FilterManager.EQList] | null> = {
        flat: null,
        rock: FilterManager.EQList.Rock,
        classic: FilterManager.EQList.Classic,
        pop: FilterManager.EQList.Pop,
        electronic: FilterManager.EQList.Electronic,
        gaming: FilterManager.EQList.Gaming,
        fullsound: FilterManager.EQList.FullSound,
        bettermusic: FilterManager.EQList.BetterMusic,
      };
      filters.delete("bassboost"); filters.delete("soft"); filters.delete("pop"); filters.delete("treble");
      if (preset === "flat") {
        (fm as any).equalizerBands = []; filters.delete("equalizer");
      } else {
        (fm as any).equalizerBands = presetMap[preset] ?? [];
        filters.add(`eq:${preset}`);
      }
      await fm.applyPlayerFilters();
      return preset === "flat" ? "🎚️ EQ reset to flat." : `🎚️ **${preset.charAt(0).toUpperCase() + preset.slice(1)}** EQ applied.`;
    });
  },
};

export const filterCommands: Command[] = [
  bassboost, nightcore, vaporwave, eightd, karaoke, tremolo, vibrato, lowpass,
  speed, pitch, rate, clearfilters, chipmunk, daycore, doubletime, slowmo,
  soft, pop, treble, mono, filterinfo, equalizer,
];

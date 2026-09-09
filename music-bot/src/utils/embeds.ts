import { EmbedBuilder, ColorResolvable } from "discord.js";

// Dragon's Den brand palette — deep violet inspired by the logo
export const BRAND_COLOR: ColorResolvable = 0x7b2fbe;  // vivid purple
const ERROR_COLOR: ColorResolvable = 0xed4245;
const SUCCESS_COLOR: ColorResolvable = 0x57f287;
const WARNING_COLOR: ColorResolvable = 0xfee75c;

const FOOTER_TEXT = "Dragon's Den Music";
const FOOTER_ICON = "https://i.imgur.com/wSTFkRM.png"; // placeholder until avatar propagates

function base(color: ColorResolvable): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(color)
    .setFooter({ text: FOOTER_TEXT });
}

export function errorEmbed(description: string): EmbedBuilder {
  return base(ERROR_COLOR).setDescription(`❌ ${description}`);
}

export function successEmbed(description: string): EmbedBuilder {
  return base(SUCCESS_COLOR).setDescription(`✅ ${description}`);
}

export function infoEmbed(description: string): EmbedBuilder {
  return base(BRAND_COLOR).setDescription(description);
}

export function warningEmbed(description: string): EmbedBuilder {
  return base(WARNING_COLOR).setDescription(`⚠️ ${description}`);
}

export function musicEmbed(title: string, description?: string): EmbedBuilder {
  const embed = base(BRAND_COLOR).setTitle(title);
  if (description) embed.setDescription(description);
  return embed;
}

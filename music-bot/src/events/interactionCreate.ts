import { Events, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { BotClient } from "../types.js";
import { errorEmbed } from "../utils/embeds.js";
import { HELP_CATEGORIES } from "../commands/info.js";

export function registerInteractionEvent(client: BotClient) {
  client.on(Events.InteractionCreate, async (interaction) => {
    // ── Button interactions ───────────────────────────────────────────────────
    if (interaction.isButton()) {
      const { customId } = interaction;

      // Help category buttons
      if (customId.startsWith("help_")) {
        const key = customId.replace("help_", "");
        const cat = HELP_CATEGORIES[key];
        if (!cat) return;

        const embed = new EmbedBuilder()
          .setColor(0x7b2fbe)
          .setTitle(`${cat.emoji} ${cat.title} Commands`)
          .setDescription(cat.commands)
          .setFooter({ text: "Dragon's Den Music • /help to return to the menu" });

        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
      return;
    }

    // ── Slash commands ────────────────────────────────────────────────────────
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      await interaction.reply({ embeds: [errorEmbed("Unknown command.")], ephemeral: true });
      return;
    }

    try {
      await command.execute(interaction as ChatInputCommandInteraction, client);
    } catch (error) {
      console.error(`Error executing command /${interaction.commandName}:`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const nodeUnavailable =
        errorMessage.includes("No available Node was found") ||
        errorMessage.includes("Unable to connect after");
      const msg = {
        embeds: [
          errorEmbed(
            nodeUnavailable
              ? "The music server is currently offline. Slither Music will reconnect automatically when it becomes available."
              : "Something went wrong running that command."
          ),
        ],
        ephemeral: true,
      };
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(msg).catch(() => null);
      } else {
        await interaction.reply(msg).catch(() => null);
      }
    }
  });
}

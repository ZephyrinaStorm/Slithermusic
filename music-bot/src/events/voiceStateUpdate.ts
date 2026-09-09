import { Events, VoiceState, VoiceChannel } from "discord.js";
import { BotClient } from "../types.js";

export function registerVoiceStateEvent(client: BotClient) {
  client.on(Events.VoiceStateUpdate, async (oldState: VoiceState) => {
    if (!oldState.guild) return;
    const player = client.lavalink.getPlayer(oldState.guild.id);
    if (!player || !player.voiceChannelId) return;

    const botChannel = oldState.guild.channels.cache.get(player.voiceChannelId) as VoiceChannel | null;
    if (!botChannel) return;

    const nonBotCount = botChannel.members.filter((m) => !m.user.bot).size;
    if (nonBotCount === 0) {
      // Wait 30 seconds before disconnecting if alone
      setTimeout(async () => {
        const stillAlone = botChannel.members.filter((m) => !m.user.bot).size === 0;
        if (stillAlone && client.lavalink.getPlayer(oldState.guild!.id)) {
          await player.destroy();
          console.log(`Auto-disconnected from ${oldState.guild!.name} — alone in voice channel.`);
        }
      }, 30_000);
    }
  });
}

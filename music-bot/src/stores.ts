import type { Track } from "lavalink-client";

// ─── Active filter names per guild ────────────────────────────────────────────
export const activeFilters = new Map<string, Set<string>>(); // guildId -> filter names
export function getFilters(guildId: string): Set<string> {
  if (!activeFilters.has(guildId)) activeFilters.set(guildId, new Set());
  return activeFilters.get(guildId)!;
}

// ─── Play history per guild ───────────────────────────────────────────────────
export const playHistory = new Map<string, Track[]>(); // guildId -> recent tracks (max 20)
export function addToHistory(guildId: string, track: Track) {
  if (!playHistory.has(guildId)) playHistory.set(guildId, []);
  const hist = playHistory.get(guildId)!;
  hist.unshift(track);
  if (hist.length > 20) hist.pop();
}

// ─── Previous tracks (for /previous command) ─────────────────────────────────
export const previousTracks = new Map<string, Track[]>(); // guildId -> stack of previous tracks
export function pushPrevious(guildId: string, track: Track) {
  if (!previousTracks.has(guildId)) previousTracks.set(guildId, []);
  const stack = previousTracks.get(guildId)!;
  stack.unshift(track);
  if (stack.length > 10) stack.pop();
}

// ─── User playlists ───────────────────────────────────────────────────────────
// Map<userId, Map<playlistName, Track[]>>
export const userPlaylists = new Map<string, Map<string, Track[]>>();
export function getUserPlaylists(userId: string): Map<string, Track[]> {
  if (!userPlaylists.has(userId)) userPlaylists.set(userId, new Map());
  return userPlaylists.get(userId)!;
}

// ─── Guild settings ────────────────────────────────────────────────────────────
export interface GuildSettings {
  djRoleId: string | null;
  is247: boolean;
  announcements: boolean;
  muteVolume: number | null;  // previous volume before mute
  embedColor: number;
  textChannelLock: string | null;
  autoplay: boolean;
  voteSkips: Set<string>;     // userIds who voted to skip current track
}

const DEFAULT_SETTINGS = (): GuildSettings => ({
  djRoleId: null,
  is247: false,
  announcements: true,
  muteVolume: null,
  embedColor: 0x7b2fbe,
  textChannelLock: null,
  autoplay: false,
  voteSkips: new Set(),
});

export const guildSettings = new Map<string, GuildSettings>();
export function getSettings(guildId: string): GuildSettings {
  if (!guildSettings.has(guildId)) guildSettings.set(guildId, DEFAULT_SETTINGS());
  return guildSettings.get(guildId)!;
}

// ─── Bot start time ───────────────────────────────────────────────────────────
export const startTime = Date.now();

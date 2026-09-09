import { command as play } from "./play.js";
import { command as skip } from "./skip.js";
import { command as stop } from "./stop.js";
import { command as pause } from "./pause.js";
import { command as resume } from "./resume.js";
import { command as nowplaying } from "./nowplaying.js";
import { command as queue } from "./queue.js";
import { command as volume } from "./volume.js";
import { command as loop } from "./loop.js";
import { command as shuffle } from "./shuffle.js";
import { command as seek } from "./seek.js";
import { command as remove } from "./remove.js";
import { command as move } from "./move.js";
import { command as disconnect } from "./disconnect.js";
import { command as search } from "./search.js";
import type { Command } from "../types.js";

import { filterCommands } from "./filters.js";
import { queueExtendedCommands } from "./queueExtended.js";
import { playbackExtendedCommands } from "./playbackExtended.js";
import { infoCommands } from "./info.js";
import { lyricsCommands } from "./lyrics.js";
import { playlistCmd } from "./playlist.js";
import { sourceCommands } from "./sources.js";
import { settingsCommands } from "./settings.js";
import { miscCommands } from "./misc.js";

export const commands: Command[] = [
  // ── Original 15 ──────────────────────────────────────────────────────────
  play, skip, stop, pause, resume, nowplaying, queue, volume, loop, shuffle,
  seek, remove, move, disconnect, search,

  // ── Filters (22) ─────────────────────────────────────────────────────────
  ...filterCommands,

  // ── Queue Extended (17) ──────────────────────────────────────────────────
  ...queueExtendedCommands,

  // ── Playback Extended (12) ───────────────────────────────────────────────
  ...playbackExtendedCommands,

  // ── Info (8) ─────────────────────────────────────────────────────────────
  ...infoCommands,

  // ── Lyrics (2) ───────────────────────────────────────────────────────────
  ...lyricsCommands,

  // ── Playlist (1 command, 12 subcommands) ─────────────────────────────────
  playlistCmd,

  // ── Source-specific search (6 commands, 8 platforms) ─────────────────────
  ...sourceCommands,

  // ── Settings (5) ─────────────────────────────────────────────────────────
  ...settingsCommands,

  // ── Misc (10) ────────────────────────────────────────────────────────────
  ...miscCommands,
];

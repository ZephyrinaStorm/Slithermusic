/**
 * Formats milliseconds into a human-readable duration string.
 * e.g. 185000 -> "3:05"
 */
export function formatDuration(ms: number): string {
  if (!ms || isNaN(ms)) return "0:00";
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${minutes}:${pad(seconds)}`;
}

function pad(num: number): string {
  return String(num).padStart(2, "0");
}

/**
 * Creates a progress bar string.
 * e.g. "█████░░░░░░░░░░ 3:05 / 4:32"
 */
export function progressBar(position: number, duration: number, length = 15): string {
  if (!duration) return `${"░".repeat(length)}`;
  const progress = Math.min(Math.floor((position / duration) * length), length);
  return "█".repeat(progress) + "░".repeat(length - progress);
}

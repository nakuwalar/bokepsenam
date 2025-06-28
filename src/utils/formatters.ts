// src/utils/formatters.ts

/**
 * Mengonversi durasi dalam detik ke format ISO 8601 (misal: PT1M30S).
 * @param seconds Durasi video dalam detik.
 * @returns String durasi dalam format ISO 8601.
 */
export function formatSecondsToISO8601(seconds: number): string {
  if (seconds < 0) {
    return 'PT0S'; // Durasi tidak boleh negatif
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let isoString = 'PT';
  if (hours > 0) {
    isoString += `${hours}H`;
  }
  if (minutes > 0) {
    isoString += `${minutes}M`;
  }
  if (remainingSeconds > 0 || (hours === 0 && minutes === 0)) { // Pastikan setidaknya ada S jika durasi 0
    isoString += `${remainingSeconds}S`;
  }

  return isoString;
}
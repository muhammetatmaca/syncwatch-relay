// Generates short, readable 6-character room codes (e.g. "K9-4X2" or "SYNC-88")
const CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * CHARS.length);
    code += CHARS[randomIndex];
  }
  // Format as e.g. "K9-4X2"
  return `${code.slice(0, 2)}-${code.slice(2)}`;
}

export function formatTimecode(millis: number): string {
  if (!millis || millis < 0 || isNaN(millis)) return '00:00';
  const totalSeconds = Math.floor(millis / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

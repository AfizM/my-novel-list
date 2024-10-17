const TIME_UNITS = [
  { unit: "year", seconds: 31536000 },
  { unit: "month", seconds: 2592000 },
  { unit: "day", seconds: 86400 },
  { unit: "hour", seconds: 3600 },
  { unit: "minute", seconds: 60 },
  { unit: "second", seconds: 1 },
];

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const elapsed = (now.getTime() - date.getTime()) / 1000;

  for (const { unit, seconds } of TIME_UNITS) {
    if (elapsed >= seconds) {
      const value = Math.floor(elapsed / seconds);
      return `${value} ${unit}${value !== 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}

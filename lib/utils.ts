export function formatDate(dateString: string): string {
  const parts = dateString.split("-").map((value) => Number(value));
  const date = parts.length === 3 && parts.every((part) => Number.isFinite(part))
    ? new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12))
    : new Date(dateString);

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

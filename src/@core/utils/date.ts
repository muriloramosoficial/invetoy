export function formatDate(date: string | Date, locale = "pt-BR"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date, locale = "pt-BR"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit", month: "2-digit", year: "numeric",
  }).format(new Date(date));
}

export function calculateDaysUntil(date: string | Date): number {
  const diff = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

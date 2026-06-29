export function formatCurrency(value: number, currency: "BRL" | "USD" = "BRL"): string {
  return new Intl.NumberFormat(currency === "BRL" ? "pt-BR" : "en-US", {
    style: "currency",
    currency,
  }).format(value);
}

export function generateSku(name: string, category?: string): string {
  const prefix = category ? category.substring(0, 3).toUpperCase() : "INV";
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}${random}`;
}

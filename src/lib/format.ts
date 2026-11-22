export function formatMoney(value: number | null | undefined): string {
  const amount = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number | null | undefined): string {
  const amount = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("en-US").format(amount);
}

export function formatMileage(value: number | null | undefined): string {
  return `${formatNumber(value)} كم`;
}

const dateFormatter = new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const dateTimeFormatter = new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return `${dateTimeFormatter.format(date)} UTC`;
}

export function toIso(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function maskVin(vin: string): string {
  if (!vin) return "—";
  return `${vin.slice(0, 4)}••••••${vin.slice(-4)}`;
}

export function formatCountdown(target: Date | string | null | undefined): string {
  if (!target) return "—";
  const end = (typeof target === "string" ? new Date(target) : target).getTime();
  const diff = end - Date.now();
  if (Number.isNaN(end)) return "—";
  if (diff <= 0) return "انتهى";
  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}ي ${hours}س`;
  if (hours > 0) return `${hours}س ${minutes}د`;
  return `${minutes} دقيقة`;
}

export function bidderAlias(id: number): string {
  const digits = String(4821 + id * 137).slice(0, 4);
  return `مزايد #${digits}`;
}

import type { Product } from "@/data/menu";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export function formatINR(value: number) {
  return inr.format(value);
}

export function priceLabel(p: Pick<Product, "price" | "priceMax" | "madeToOrder">) {
  if (p.price == null || p.madeToOrder) return "Price on WhatsApp";
  if (p.priceMax && p.priceMax !== p.price) return `${formatINR(p.price)} – ${formatINR(p.priceMax)}`;
  return formatINR(p.price);
}

export function formatDate(iso: string | undefined | null) {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string | undefined | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

/** Today's date in India as YYYY-MM-DD */
export function todayIST(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now);
}

export function clampText(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

/** Normalise an Indian phone number to digits with country code, e.g. 919876543210 */
export function normalisePhone(raw: string | undefined | null) {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  if (digits.length >= 11 && digits.length <= 15) return digits;
  return "";
}

export function displayPhone(digits: string) {
  if (!digits) return "";
  if (digits.startsWith("91") && digits.length === 12) return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  return `+${digits}`;
}

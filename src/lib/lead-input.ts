import { clampText, normalisePhone } from "@/lib/format";
import type { ClientLeadState } from "@/lib/chat-protocol";
import type { CustomerDetails, Intent } from "@/lib/leads";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function sanitizeDate(value: unknown) {
  if (typeof value !== "string" || !DATE_RE.test(value)) return undefined;
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return undefined;
  const year = d.getUTCFullYear();
  if (year < 2024 || year > 2100) return undefined;
  return value;
}

export function sanitizeEmail(value: unknown) {
  const v = clampText(value, 120).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : undefined;
}

export function sanitizeIntent(value: unknown): Intent | undefined {
  return value === "low" || value === "medium" || value === "high" ? value : undefined;
}

/** Validate untrusted customer details. Unknown or malformed fields are dropped. */
export function sanitizeDetails(input: unknown): CustomerDetails {
  if (!input || typeof input !== "object") return {};
  const r = input as Record<string, unknown>;
  const out: CustomerDetails = {};
  const name = clampText(r.name, 80);
  if (name) out.name = name;
  const phone = normalisePhone(typeof r.phone === "string" ? r.phone : undefined);
  if (phone) out.phone = phone;
  const email = sanitizeEmail(r.email);
  if (email) out.email = email;
  const occasion = clampText(r.occasion, 80);
  if (occasion) out.occasion = occasion;
  const eventDate = sanitizeDate(r.eventDate);
  if (eventDate) out.eventDate = eventDate;
  if (r.fulfilment === "delivery" || r.fulfilment === "pickup") out.fulfilment = r.fulfilment;
  const area = clampText(r.area, 160);
  if (area) out.area = area;
  const budget = clampText(r.budget, 60);
  if (budget) out.budget = budget;
  const guests = Math.floor(Number(r.guests));
  if (Number.isFinite(guests) && guests > 0 && guests < 100000) out.guests = guests;
  const customRequest = clampText(r.customRequest, 1000);
  if (customRequest) out.customRequest = customRequest;
  const giftMessage = clampText(r.giftMessage, 300);
  if (giftMessage) out.giftMessage = giftMessage;
  const notes = clampText(r.notes, 600);
  if (notes) out.notes = notes;
  return out;
}

export function missingForOrder(details: CustomerDetails) {
  const missing: string[] = [];
  if (!details.name) missing.push("name");
  if (!details.phone) missing.push("phone number");
  if (!details.eventDate) missing.push("date needed");
  if (!details.fulfilment) missing.push("delivery or pickup");
  else if (details.fulfilment === "delivery" && !details.area) missing.push("delivery area");
  return missing;
}

/** Validate the lead state the browser sends back each turn. */
export function parseLeadState(input: unknown): ClientLeadState {
  if (!input || typeof input !== "object") return { details: {} };
  const r = input as Record<string, unknown>;
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : undefined);
  const alerts = r.alerts && typeof r.alerts === "object" ? (r.alerts as Record<string, unknown>) : {};
  return {
    details: sanitizeDetails(r.details),
    intent: sanitizeIntent(r.intent),
    summary: str(r.summary, 240),
    orderId: typeof r.orderId === "string" && /^SJ-[A-Z0-9]{6}$/.test(r.orderId) ? r.orderId : undefined,
    handoffAt: str(r.handoffAt, 40),
    alerts: { hot: str(alerts.hot, 40), confirmed: str(alerts.confirmed, 40) },
    createdAt: str(r.createdAt, 40),
    savedAt: Number.isFinite(Number(r.savedAt)) ? Number(r.savedAt) : undefined,
  };
}

import { priceCart, type CartLine } from "@/lib/cart";
import { todayIST } from "@/lib/format";

export type LeadTier = "confirmed" | "hot" | "warm" | "cold";
export type LeadStatus = "new" | "contacted" | "won" | "lost";
export type LeadSource = "chat" | "checkout" | "enquiry";
export type Intent = "low" | "medium" | "high";

export type CustomerDetails = {
  name?: string;
  phone?: string;
  email?: string;
  occasion?: string;
  /** YYYY-MM-DD */
  eventDate?: string;
  fulfilment?: "delivery" | "pickup";
  area?: string;
  budget?: string;
  guests?: number;
  customRequest?: string;
  giftMessage?: string;
  notes?: string;
};

export type TranscriptEntry = { role: "user" | "assistant"; text: string };

export type Lead = {
  id: string;
  source: LeadSource;
  createdAt: string;
  updatedAt: string;
  details: CustomerDetails;
  cart: CartLine[];
  intent?: Intent;
  summary?: string;
  tier: LeadTier;
  score: number;
  reasons: string[];
  status: LeadStatus;
  orderId?: string;
  handoffAt?: string;
  estimatedValue?: number;
  transcript?: TranscriptEntry[];
  alerts?: { hot?: string; confirmed?: string };
  page?: string;
  adminNotes?: string;
};

export const tierLabel: Record<LeadTier, string> = {
  confirmed: "Confirmed",
  hot: "Hot",
  warm: "Warm",
  cold: "Cold",
};

export const statusLabel: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  won: "Won",
  lost: "Lost",
};

function daysUntil(dateIso: string, now: Date) {
  const today = new Date(`${todayIST(now)}T00:00:00Z`).getTime();
  const target = new Date(`${dateIso}T00:00:00Z`).getTime();
  if (Number.isNaN(target)) return null;
  return Math.round((target - today) / 86_400_000);
}

export function scoreLead(
  lead: Pick<Lead, "details" | "cart" | "intent" | "orderId" | "handoffAt"> & { source?: LeadSource },
  now = new Date(),
): { tier: LeadTier; score: number; reasons: string[]; estimatedValue: number } {
  const reasons: string[] = [];
  const d = lead.details ?? {};
  const priced = priceCart(lead.cart ?? []);
  const estimatedValue = priced.subtotal;

  if (lead.handoffAt) {
    reasons.push(lead.source === "checkout" ? "Placed order at checkout" : "Order sent to WhatsApp");
    if (priced.itemCount) reasons.push(`${priced.itemCount} item${priced.itemCount === 1 ? "" : "s"} in gift box`);
    if (d.eventDate) reasons.push(`Needed on ${d.eventDate}`);
    return { tier: "confirmed", score: 100, reasons, estimatedValue };
  }

  let score = 0;
  if (lead.orderId) {
    score += 30;
    reasons.push("Order summary ready, not yet sent");
  }
  const hasContact = Boolean(d.phone || d.email);
  if (d.phone) {
    score += 25;
    reasons.push("Shared phone number");
  } else if (d.email) {
    score += 15;
    reasons.push("Shared email");
  }
  if (d.name) score += 5;
  if (priced.itemCount > 0) {
    score += 20;
    reasons.push(`${priced.itemCount} item${priced.itemCount === 1 ? "" : "s"} in gift box`);
  }
  if (estimatedValue >= 1500) {
    score += 10;
    reasons.push("High order value");
  }
  if (d.customRequest) {
    score += 15;
    reasons.push("Custom request");
  }
  if (d.occasion) score += 5;
  if (d.guests && d.guests >= 20) {
    score += 5;
    reasons.push(`${d.guests} guests`);
  }
  if (d.eventDate) {
    const days = daysUntil(d.eventDate, now);
    if (days != null && days >= 0) {
      score += 10;
      if (days <= 7) {
        score += 15;
        reasons.push(days === 0 ? "Needed today" : `Needed in ${days} day${days === 1 ? "" : "s"}`);
      } else if (days <= 14) {
        score += 8;
        reasons.push(`Needed in ${days} days`);
      } else {
        reasons.push(`Date set: ${d.eventDate}`);
      }
    }
  }
  if (lead.intent === "high") {
    score += 20;
    reasons.push("Ready to order");
  } else if (lead.intent === "medium") {
    score += 10;
    reasons.push("Interested");
  }

  score = Math.min(score, 99);
  let tier: LeadTier = score >= 60 ? "hot" : score >= 30 ? "warm" : "cold";
  // A lead the client cannot contact can't be hot yet.
  if (tier === "hot" && !hasContact) tier = "warm";
  return { tier, score, reasons, estimatedValue };
}

export function newOrderId() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  for (const b of bytes) id += alphabet[b % alphabet.length];
  return `SJ-${id}`;
}

export function isValidLeadId(id: unknown): id is string {
  return typeof id === "string" && /^[a-zA-Z0-9_-]{8,64}$/.test(id);
}

import type { CartLine } from "@/lib/cart";
import { describeLine, priceCart } from "@/lib/cart";
import type { ChatTurn, ClientLeadState } from "@/lib/chat-protocol";
import { alertIfNeeded } from "@/lib/alerts";
import { scoreLead, type Lead, type LeadSource } from "@/lib/leads";
import { getLead, saveLead } from "@/lib/store";

function fallbackSummary(lead: Pick<Lead, "details" | "cart">) {
  const parts: string[] = [];
  if (lead.details.occasion) parts.push(lead.details.occasion);
  const priced = priceCart(lead.cart);
  if (priced.lines.length) parts.push(priced.lines.map((l) => describeLine(l)).join(", "));
  if (lead.details.customRequest) parts.push(lead.details.customRequest.slice(0, 120));
  return parts.join(": ") || undefined;
}

function trimTranscript(turns: ChatTurn[]) {
  return turns.slice(-80).map((t) => ({ role: t.role, text: t.text.slice(0, 2500) }));
}

/** Create or update a lead record, keep the owner's edits, score it and send alerts. */
export async function upsertLead(input: {
  id: string;
  source: LeadSource;
  state: ClientLeadState;
  cart: CartLine[];
  transcript?: ChatTurn[];
  page?: string;
}): Promise<Lead> {
  const now = new Date().toISOString();
  let existing: Lead | null = null;
  try {
    existing = await getLead(input.id);
  } catch (err) {
    console.error("Could not load existing lead", err);
  }

  const base: Lead = {
    id: input.id,
    source: existing?.source === "checkout" ? "checkout" : input.source,
    createdAt: existing?.createdAt ?? input.state.createdAt ?? now,
    updatedAt: now,
    details: { ...(existing?.details ?? {}), ...input.state.details },
    cart: input.cart,
    intent: input.state.intent ?? existing?.intent,
    summary: input.state.summary ?? existing?.summary,
    tier: "cold",
    score: 0,
    reasons: [],
    status: existing?.status ?? "new",
    orderId: input.state.orderId ?? existing?.orderId,
    handoffAt: input.state.handoffAt ?? existing?.handoffAt,
    transcript: input.transcript ? trimTranscript(input.transcript) : existing?.transcript,
    alerts: { ...(input.state.alerts ?? {}), ...(existing?.alerts ?? {}) },
    page: input.page ?? existing?.page,
    adminNotes: existing?.adminNotes,
  };
  if (!base.summary) base.summary = fallbackSummary(base);
  const scored = scoreLead(base);
  base.tier = scored.tier;
  base.score = scored.score;
  base.reasons = scored.reasons;
  base.estimatedValue = scored.estimatedValue;

  try {
    base.alerts = await alertIfNeeded(base);
  } catch (err) {
    console.error("Alert failed", err);
  }
  await saveLead(base);
  return base;
}

export function toClientState(lead: Lead, savedAt: number): ClientLeadState {
  return {
    details: lead.details,
    intent: lead.intent,
    summary: lead.summary,
    orderId: lead.orderId,
    handoffAt: lead.handoffAt,
    alerts: lead.alerts,
    createdAt: lead.createdAt,
    savedAt,
  };
}

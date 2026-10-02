import { sanitizeCart } from "@/lib/cart";
import { json, readJsonBody } from "@/lib/http";
import { parseLeadState } from "@/lib/lead-input";
import { isValidLeadId } from "@/lib/leads";
import { toClientState, upsertLead } from "@/lib/lead-service";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Called (with keepalive) when the customer taps "Send order on WhatsApp" in the chat.
// That tap is the clearest buying signal we get, so the lead becomes Confirmed.
export async function POST(req: Request) {
  const body = await readJsonBody(req, 60_000);
  if (!body) return json({ error: "Invalid request" }, 400);
  const sessionId = body.sessionId;
  if (!isValidLeadId(sessionId)) return json({ error: "Invalid session" }, 400);
  if (!rateLimit(`handoff:${clientIp(req)}`, [{ windowMs: 60_000, max: 10 }])) {
    return json({ error: "Too many requests" }, 429);
  }

  const state = parseLeadState(body.lead);
  const cart = sanitizeCart(body.cart);
  const now = new Date().toISOString();
  try {
    const lead = await upsertLead({
      id: sessionId,
      source: "chat",
      state: { ...state, handoffAt: state.handoffAt ?? now, intent: "high" },
      cart,
      page: typeof body.page === "string" ? body.page.slice(0, 120) : undefined,
    });
    return json({ ok: true, lead: toClientState(lead, state.savedAt ?? 0) });
  } catch (err) {
    console.error("Handoff save failed", err);
    return json({ ok: false }, 500);
  }
}

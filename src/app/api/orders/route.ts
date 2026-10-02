import { sanitizeCart, priceCart } from "@/lib/cart";
import { json, readJsonBody } from "@/lib/http";
import { sanitizeDetails } from "@/lib/lead-input";
import { isValidLeadId, newOrderId } from "@/lib/leads";
import { upsertLead } from "@/lib/lead-service";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { orderMessage, whatsappUrl } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Checkout: saves the order as a Confirmed lead and returns the WhatsApp link
// with the order typed out, so the customer can finish with the owner directly.
export async function POST(req: Request) {
  const body = await readJsonBody(req, 60_000);
  if (!body) return json({ error: "Invalid request" }, 400);
  if (typeof body.website === "string" && body.website.trim()) {
    // Honeypot field filled in: almost certainly a bot. Pretend it worked.
    return json({ ok: true, orderId: newOrderId(), whatsappUrl: whatsappUrl() });
  }
  if (
    !rateLimit(`order:${clientIp(req)}`, [
      { windowMs: 60_000, max: 5 },
      { windowMs: 3_600_000, max: 30 },
    ])
  ) {
    return json({ error: "Too many orders from this connection. Please wait a minute and try again." }, 429);
  }

  const details = sanitizeDetails(body.details);
  const cart = sanitizeCart(body.cart);
  const errors: Record<string, string> = {};
  if (!details.name) errors.name = "Please enter your name.";
  if (!details.phone) errors.phone = "Please enter a valid mobile number.";
  if (!details.fulfilment) errors.fulfilment = "Choose delivery or pickup.";
  if (details.fulfilment === "delivery" && !details.area) errors.area = "Please enter your delivery area.";
  if (!details.eventDate) errors.eventDate = "Choose the date you need it.";
  if (!priceCart(cart).lines.length && !details.customRequest) {
    errors.cart = "Your gift box is empty. Add something, or describe what you'd like.";
  }
  if (Object.keys(errors).length) return json({ error: "Please check the highlighted fields.", errors }, 422);

  const id = isValidLeadId(body.sessionId) ? body.sessionId : crypto.randomUUID();
  const existingOrderId = typeof body.orderId === "string" && /^SJ-[A-Z0-9]{6}$/.test(body.orderId) ? body.orderId : undefined;
  const orderId = existingOrderId ?? newOrderId();
  const message = orderMessage({ orderId, details, cart });

  try {
    await upsertLead({
      id,
      source: "checkout",
      state: { details, intent: "high", orderId, handoffAt: new Date().toISOString() },
      cart,
      page: "/checkout",
    });
  } catch (err) {
    // Still let the customer reach WhatsApp; the order text carries everything.
    console.error("Order save failed", err);
  }
  return json({ ok: true, orderId, whatsappUrl: whatsappUrl(message) });
}

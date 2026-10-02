import { site } from "@/data/site";
import { describeLine, priceCart, type CartLine } from "@/lib/cart";
import { formatDate, formatINR } from "@/lib/format";
import type { CustomerDetails } from "@/lib/leads";

export function whatsappUrl(text?: string, number: string = site.whatsapp) {
  const base = `https://wa.me/${number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function orderMessage(opts: { orderId?: string; details: CustomerDetails; cart: CartLine[] }) {
  const { orderId, details: d, cart } = opts;
  const priced = priceCart(cart);
  const out: string[] = [];
  out.push(`Hi ${site.name}! I'd like to place an order.`);
  out.push("");
  if (orderId) out.push(`Order ref: ${orderId}`);
  if (d.name) out.push(`Name: ${d.name}`);
  if (d.phone) out.push(`Phone: +${d.phone}`);
  if (d.occasion) out.push(`Occasion: ${d.occasion}`);
  if (d.eventDate) out.push(`Needed on: ${formatDate(d.eventDate)}`);
  if (d.fulfilment) {
    out.push(`${d.fulfilment === "pickup" ? "Pickup" : "Delivery"}${d.area ? `: ${d.area}` : ""}`);
  } else if (d.area) {
    out.push(`Area: ${d.area}`);
  }
  if (d.guests) out.push(`Guests: ${d.guests}`);
  if (d.budget) out.push(`Budget: ${d.budget}`);

  if (priced.lines.length) {
    out.push("");
    out.push("My gift box:");
    for (const l of priced.lines) {
      const price = l.lineTotal == null ? "price to confirm" : formatINR(l.lineTotal);
      out.push(`• ${describeLine(l)} — ${price}${l.note ? ` (${l.note})` : ""}`);
    }
    if (priced.subtotal > 0) {
      out.push(`Estimated total: ${formatINR(priced.subtotal)}${priced.hasUnpriced ? " + items to be priced" : ""}`);
    }
  }
  if (d.customRequest) {
    out.push("");
    out.push(`Custom request: ${d.customRequest}`);
  }
  if (d.giftMessage) out.push(`Gift message: ${d.giftMessage}`);
  if (d.notes) out.push(`Notes: ${d.notes}`);
  out.push("");
  out.push("Please confirm the final price, delivery and payment details. Thank you!");
  return out.join("\n").slice(0, 3000);
}

export function customerFollowUpMessage(name?: string) {
  return `Hi${name ? ` ${name}` : ""}, this is ${site.owner} from ${site.name}. Thank you for your interest! I'd love to help with your order.`;
}

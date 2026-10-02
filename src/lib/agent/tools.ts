import type { BetaTool } from "@anthropic-ai/sdk/resources/beta/messages/messages";
import { z } from "zod";
import { getProduct } from "@/data/menu";
import { describeLine, lineKey, matchOption, MAX_LINES, MAX_QTY, priceCart, type CartLine } from "@/lib/cart";
import type { ChatEvent, ClientLeadState } from "@/lib/chat-protocol";
import { formatINR } from "@/lib/format";
import { missingForOrder, sanitizeDetails, sanitizeIntent } from "@/lib/lead-input";
import { newOrderId, scoreLead, tierLabel } from "@/lib/leads";
import { orderMessage, whatsappUrl } from "@/lib/whatsapp";

export type TurnState = {
  cart: CartLine[];
  lead: ClientLeadState;
  emit: (e: ChatEvent) => void;
  /** Set when the cart or lead changed and should be saved */
  dirty: boolean;
};

// ---------- Tool definitions sent to Claude (kept stable for prompt caching) ----------

export const TOOLS: BetaTool[] = [
  {
    name: "show_products",
    description:
      "Show product cards (photo, price and an Add button) to the customer in the chat. Use whenever you recommend specific menu items. Pass 1 to 6 product ids from the menu.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: {
        product_ids: { type: "array", items: { type: "string" }, description: "Menu product ids, most relevant first" },
      },
      required: ["product_ids"],
    },
  },
  {
    name: "update_gift_box",
    description:
      "Change the customer's gift box (cart). Use 'add' when they choose an item, 'remove' to take an item out, and 'set_quantity' to change how many. The result returns the updated box and estimated total.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: {
        changes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              action: { type: "string", enum: ["add", "remove", "set_quantity"] },
              product_id: { type: "string" },
              option: { type: "string", description: "Flavour or option label exactly as listed in the menu, if any" },
              quantity: { type: "integer", description: "Units to add, or the new quantity for set_quantity" },
              note: { type: "string", description: "Short note for this line, e.g. 'name on top: Riya'" },
            },
            required: ["action", "product_id"],
          },
        },
      },
      required: ["changes"],
    },
  },
  {
    name: "update_lead",
    description:
      "Save what you have learned about the customer and their order so the owner can follow up. Call it whenever you learn something new. Only include fields you know.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        phone: { type: "string", description: "WhatsApp or phone number, digits with country code if given" },
        email: { type: "string" },
        occasion: { type: "string", description: "e.g. Birthday, Diwali gifting, Corporate, Wedding favours" },
        event_date: { type: "string", description: "Date needed, YYYY-MM-DD" },
        fulfilment: { type: "string", enum: ["delivery", "pickup"] },
        area: { type: "string", description: "Delivery area, locality or city" },
        budget: { type: "string" },
        guests: { type: "integer", description: "Number of guests or gifts" },
        custom_request: { type: "string", description: "Brief for custom cakes, baskets, bulk or catering orders" },
        gift_message: { type: "string" },
        notes: { type: "string", description: "Anything else, including allergies or dietary needs" },
        buying_intent: { type: "string", enum: ["low", "medium", "high"] },
        summary: { type: "string", description: "One-line summary for the owner" },
      },
    },
  },
  {
    name: "send_order_to_whatsapp",
    description:
      "Prepare the final order summary and show the customer a button that opens WhatsApp with the order typed out for the owner. Call this once the gift box (or a custom request) and the key details are ready, or when the customer asks to continue on WhatsApp.",
    eager_input_streaming: true,
    input_schema: { type: "object", properties: {} },
  },
];

export const toolStatus: Record<string, string> = {
  show_products: "Picking out treats…",
  update_gift_box: "Updating your gift box…",
  update_lead: "Noting your details…",
  send_order_to_whatsapp: "Preparing your WhatsApp order…",
};

// ---------- Validation ----------

const ShowProducts = z.object({ product_ids: z.array(z.string()).min(1).max(8) });
const GiftBoxChange = z.object({
  action: z.enum(["add", "remove", "set_quantity"]),
  product_id: z.string(),
  option: z.string().optional().nullable(),
  quantity: z.number().int().optional().nullable(),
  note: z.string().optional().nullable(),
});
const UpdateGiftBox = z.object({ changes: z.array(GiftBoxChange).min(1).max(20) });
const UpdateLead = z.object({
  name: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  occasion: z.string().optional().nullable(),
  event_date: z.string().optional().nullable(),
  fulfilment: z.enum(["delivery", "pickup"]).optional().nullable(),
  area: z.string().optional().nullable(),
  budget: z.string().optional().nullable(),
  guests: z.number().int().optional().nullable(),
  custom_request: z.string().optional().nullable(),
  gift_message: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  buying_intent: z.enum(["low", "medium", "high"]).optional().nullable(),
  summary: z.string().optional().nullable(),
});
const SendOrder = z.object({}).passthrough();

export class ToolInputError extends Error {}

function boxSummary(cart: CartLine[]) {
  const priced = priceCart(cart);
  if (!priced.lines.length) return "Gift box is now empty.";
  const lines = priced.lines.map(
    (l) => `- [${l.productId}] ${describeLine(l)} = ${l.lineTotal == null ? "price on WhatsApp" : formatINR(l.lineTotal)}`,
  );
  return `Gift box now:\n${lines.join("\n")}\nEstimated total: ${formatINR(priced.subtotal)}${
    priced.hasUnpriced ? " plus items priced on WhatsApp" : ""
  }`;
}

// ---------- Execution ----------

export function runTool(name: string, input: unknown, state: TurnState): { content: string; isError?: boolean } {
  switch (name) {
    case "show_products": {
      const parsed = ShowProducts.safeParse(input);
      if (!parsed.success) throw new ToolInputError(parsed.error.message);
      const known = [...new Set(parsed.data.product_ids)].filter((id) => getProduct(id));
      const unknown = parsed.data.product_ids.filter((id) => !getProduct(id));
      if (!known.length)
        return { content: `None of these ids exist: ${unknown.join(", ")}. Use ids from the menu.`, isError: true };
      state.emit({ t: "products", ids: known.slice(0, 6) });
      const names = known.map((id) => getProduct(id)!.name).join(", ");
      return {
        content: `Shown to the customer: ${names}.${unknown.length ? ` Unknown ids ignored: ${unknown.join(", ")}.` : ""}`,
      };
    }

    case "update_gift_box": {
      const parsed = UpdateGiftBox.safeParse(input);
      if (!parsed.success) throw new ToolInputError(parsed.error.message);
      const cart = state.cart.map((l) => ({ ...l }));
      const notes: string[] = [];
      for (const ch of parsed.data.changes) {
        const product = getProduct(ch.product_id);
        if (!product) {
          notes.push(`Unknown product id "${ch.product_id}", skipped.`);
          continue;
        }
        let option: string | undefined;
        if (ch.option) {
          option = matchOption(product, ch.option);
          if (!option) {
            const valid = product.options?.map((o) => o.label).join(", ");
            notes.push(
              valid
                ? `"${ch.option}" isn't an option for ${product.name}. Valid options: ${valid}. Skipped.`
                : `${product.name} has no options; added without one.`,
            );
            if (valid) continue;
          }
        }
        const key = lineKey({ productId: product.id, option });
        const idx = cart.findIndex((l) => lineKey(l) === key);
        const qty = ch.quantity ?? 1;
        if (ch.action === "add") {
          if (qty < 1) {
            notes.push(`Quantity must be at least 1 for ${product.name}.`);
            continue;
          }
          if (idx >= 0) {
            cart[idx]!.quantity = Math.min(cart[idx]!.quantity + qty, MAX_QTY);
            if (ch.note) cart[idx]!.note = ch.note.slice(0, 200);
          } else if (cart.length >= MAX_LINES) {
            notes.push("Gift box is full, couldn't add more lines.");
            continue;
          } else {
            cart.push({
              productId: product.id,
              option,
              quantity: Math.min(qty, MAX_QTY),
              ...(ch.note ? { note: ch.note.slice(0, 200) } : {}),
            });
          }
          notes.push(`Added ${product.name}${option ? ` (${option})` : ""} × ${qty}.`);
          if (product.minQty && qty < product.minQty)
            notes.push(`Note: ${product.name} is usually ordered in ${product.minQty}+.`);
        } else if (ch.action === "remove") {
          const before = cart.length;
          for (let i = cart.length - 1; i >= 0; i--) {
            if (cart[i]!.productId === product.id && (!option || lineKey(cart[i]!) === key)) cart.splice(i, 1);
          }
          notes.push(
            before === cart.length
              ? `${product.name} wasn't in the box.`
              : `Removed ${product.name}${option ? ` (${option})` : ""}.`,
          );
        } else {
          if (idx < 0) {
            if (qty > 0) {
              cart.push({ productId: product.id, option, quantity: Math.min(qty, MAX_QTY) });
              notes.push(`Set ${product.name} to ${qty}.`);
            }
          } else if (qty <= 0) {
            cart.splice(idx, 1);
            notes.push(`Removed ${product.name}.`);
          } else {
            cart[idx]!.quantity = Math.min(qty, MAX_QTY);
            notes.push(`Set ${product.name} to ${qty}.`);
          }
        }
      }
      state.cart = cart;
      state.dirty = true;
      state.emit({ t: "cart", cart });
      return { content: `${notes.join(" ")}\n${boxSummary(cart)}` };
    }

    case "update_lead": {
      const parsed = UpdateLead.safeParse(input);
      if (!parsed.success) throw new ToolInputError(parsed.error.message);
      const i = parsed.data;
      const incoming = sanitizeDetails({
        name: i.name,
        phone: i.phone,
        email: i.email,
        occasion: i.occasion,
        eventDate: i.event_date,
        fulfilment: i.fulfilment,
        area: i.area,
        budget: i.budget,
        guests: i.guests,
        customRequest: i.custom_request,
        giftMessage: i.gift_message,
        notes: i.notes,
      });
      const problems: string[] = [];
      if (i.phone && !incoming.phone) problems.push(`Phone "${i.phone}" doesn't look valid; ask the customer to re-check it.`);
      if (i.event_date && !incoming.eventDate) problems.push(`Date "${i.event_date}" must be a real date in YYYY-MM-DD.`);
      if (i.email && !incoming.email) problems.push(`Email "${i.email}" doesn't look valid.`);
      state.lead = {
        ...state.lead,
        details: { ...state.lead.details, ...incoming },
        intent: sanitizeIntent(i.buying_intent) ?? state.lead.intent,
        summary: i.summary ? i.summary.replace(/\s+/g, " ").trim().slice(0, 240) : state.lead.summary,
      };
      state.dirty = true;
      const scored = scoreLead({ ...state.lead, cart: state.cart });
      const missing = missingForOrder(state.lead.details);
      return {
        content: [
          "Saved.",
          ...problems,
          `Lead status (internal): ${tierLabel[scored.tier]}.`,
          missing.length ? `Still useful before handoff: ${missing.join(", ")}.` : "All key details collected.",
        ].join(" "),
        isError: problems.length > 0 && Object.keys(incoming).length === 0,
      };
    }

    case "send_order_to_whatsapp": {
      const parsed = SendOrder.safeParse(input ?? {});
      if (!parsed.success) throw new ToolInputError(parsed.error.message);
      const priced = priceCart(state.cart);
      if (!priced.lines.length && !state.lead.details.customRequest) {
        return {
          content:
            "The gift box is empty and there is no custom request yet. Add items with update_gift_box or save the brief as custom_request with update_lead first.",
          isError: true,
        };
      }
      const orderId = state.lead.orderId ?? newOrderId();
      state.lead = { ...state.lead, orderId };
      if (!state.lead.intent || state.lead.intent === "low") state.lead.intent = "high";
      state.dirty = true;
      const message = orderMessage({ orderId, details: state.lead.details, cart: state.cart });
      const url = whatsappUrl(message);
      state.emit({ t: "handoff", url, orderId });
      return {
        content: `Order ${orderId} is ready. The customer now sees a green "Send order on WhatsApp" button that opens WhatsApp with this message typed out:\n\n${message}`,
      };
    }

    default:
      return { content: `Unknown tool ${name}.`, isError: true };
  }
}

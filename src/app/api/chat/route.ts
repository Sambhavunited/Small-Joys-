import Anthropic from "@anthropic-ai/sdk";
import { agentConfig, runAgent } from "@/lib/agent/run";
import { extractDetails } from "@/lib/agent/extract-details";
import { guidedReply } from "@/lib/agent/guided";
import type { TurnState } from "@/lib/agent/tools";
import { sanitizeCart } from "@/lib/cart";
import { MAX_HISTORY, MAX_MESSAGE_CHARS, MAX_USER_TURNS, type ChatEvent, type ChatTurn } from "@/lib/chat-protocol";
import { parseLeadState } from "@/lib/lead-input";
import { isValidLeadId, newOrderId } from "@/lib/leads";
import { toClientState, upsertLead } from "@/lib/lead-service";
import { json } from "@/lib/http";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { orderMessage, whatsappUrl } from "@/lib/whatsapp";
import { site } from "@/data/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

function parseHistory(input: unknown): ChatTurn[] {
  if (!Array.isArray(input)) return [];
  const turns: ChatTurn[] = [];
  for (const raw of input.slice(-MAX_HISTORY * 2)) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    if ((r.role !== "user" && r.role !== "assistant") || typeof r.text !== "string") continue;
    const text = r.text.trim().slice(0, r.role === "user" ? MAX_MESSAGE_CHARS : 4000);
    if (!text) continue;
    const prev = turns[turns.length - 1];
    // Merge back-to-back turns from the same side (for example after a failed reply).
    if (prev && prev.role === r.role) prev.text = `${prev.text}\n\n${text}`.slice(-MAX_MESSAGE_CHARS * 3);
    else turns.push({ role: r.role, text });
  }
  // The conversation sent to Claude must start with the customer.
  while (turns.length && turns[0]!.role !== "user") turns.shift();
  return turns.slice(-MAX_HISTORY);
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > 250_000) return json({ error: "Request too large" }, 413);
    body = JSON.parse(raw);
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const sessionId = body.sessionId;
  if (!isValidLeadId(sessionId)) return json({ error: "Invalid session" }, 400);
  const history = parseHistory(body.messages);
  if (!history.length || history[history.length - 1]!.role !== "user") {
    return json({ error: "The last message must be from the customer" }, 400);
  }
  const page = typeof body.page === "string" ? body.page.slice(0, 120) : undefined;
  const userTurns = history.filter((t) => t.role === "user").length;

  const ip = clientIp(req);
  const allowed =
    rateLimit(`chat:${ip}`, [
      { windowMs: 60_000, max: 12 },
      { windowMs: 3_600_000, max: 120 },
    ]) && rateLimit(`chat-session:${sessionId}`, [{ windowMs: 60_000, max: 10 }]);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const send = (e: ChatEvent) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(e)}\n`));
        } catch {
          closed = true;
        }
      };

      const state: TurnState = {
        cart: sanitizeCart(body.cart),
        lead: parseLeadState(body.lead),
        emit: send,
        dirty: false,
      };
      let assistantText = "";
      let mode: "ai" | "guided" = "guided";

      const runGuided = (prefix?: string) => {
        const message = history[history.length - 1]!.text;
        // Keep any contact or order details the customer typed, so the lead is complete.
        const found = extractDetails(message);
        const known = state.lead.details;
        const isNew = (Object.keys(found) as (keyof typeof found)[]).some((k) => found[k] !== known[k]);
        if (isNew) {
          state.lead = { ...state.lead, details: { ...known, ...found } };
          state.dirty = true;
        }
        const noted =
          (found.phone && found.phone !== known.phone) || (found.email && found.email !== known.email)
            ? `Thank you, I've noted your details so ${site.owner} can follow up.`
            : undefined;
        const reply = guidedReply(message, state.cart, { notedContact: Boolean(noted) });
        const text = [prefix, noted, reply.text].filter(Boolean).join("\n\n");
        send({ t: "text", v: text });
        assistantText = text;
        if (reply.productIds?.length) send({ t: "products", ids: reply.productIds });
        if (reply.handoff) {
          const orderId = state.cart.length ? (state.lead.orderId ?? newOrderId()) : undefined;
          if (orderId) {
            state.lead = { ...state.lead, orderId, intent: "high" };
            state.dirty = true;
          }
          const message = state.cart.length
            ? orderMessage({ orderId, details: state.lead.details, cart: state.cart })
            : `Hi ${site.name}! I'd like to know more about your treats.`;
          send({ t: "handoff", url: whatsappUrl(message), orderId: orderId ?? "" });
        }
        send({ t: "suggestions", v: reply.suggestions });
      };

      try {
        if (!allowed) {
          const text = `You're sending messages very quickly, so I've paused for a moment. You can keep chatting in a minute, or message ${site.owner} on WhatsApp at ${site.phoneDisplay}.`;
          send({ t: "text", v: text });
          assistantText = text;
        } else if (userTurns > MAX_USER_TURNS) {
          const text = `We've covered a lot! To finish your order, tap below to continue with ${site.owner} on WhatsApp.`;
          send({ t: "text", v: text });
          send({
            t: "handoff",
            url: whatsappUrl(orderMessage({ details: state.lead.details, cart: state.cart })),
            orderId: state.lead.orderId ?? "",
          });
          assistantText = text;
        } else if (agentConfig().enabled) {
          mode = "ai";
          try {
            const result = await runAgent({ history, state, page, sessionId, signal: req.signal });
            assistantText = result.text;
            if (!assistantText) {
              const nudge = "Is there anything else you'd like to add?";
              send({ t: "text", v: nudge });
              assistantText = nudge;
            }
            if (state.cart.length && !state.lead.orderId) {
              send({ t: "suggestions", v: ["I'm ready to order", "Suggest an add-on"] });
            }
          } catch (err) {
            if (req.signal.aborted) {
              closed = true;
            } else {
              const status = err instanceof Anthropic.APIError ? err.status : undefined;
              console.error("AI agent failed", status, err);
              mode = "guided";
              if (assistantText) send({ t: "text", v: "\n\n" });
              runGuided(
                assistantText ? undefined : "Sorry, my smart replies are taking a short break, but I can still help you order.",
              );
            }
          }
        } else {
          runGuided();
        }

        // Save the conversation as a lead when something useful changed.
        const transcript: ChatTurn[] = [
          ...history,
          ...(assistantText ? [{ role: "assistant" as const, text: assistantText }] : []),
        ];
        const lastSaved = state.lead.savedAt ?? 0;
        const shouldSave =
          state.dirty || (!state.lead.savedAt && userTurns >= 2) || (lastSaved > 0 && userTurns - lastSaved >= 4);
        if (shouldSave && !closed) {
          try {
            const lead = await upsertLead({
              id: sessionId,
              source: "chat",
              state: state.lead,
              cart: state.cart,
              transcript,
              page,
            });
            state.lead = toClientState(lead, userTurns);
          } catch (err) {
            console.error("Lead save failed", err);
          }
        }
        send({ t: "lead", lead: state.lead });
        send({ t: "done", mode });
      } catch (err) {
        console.error("Chat route error", err);
        send({ t: "error", v: `Something went wrong. Please try again, or message ${site.owner} on WhatsApp.` });
        send({ t: "done", mode });
      } finally {
        if (!closed) {
          closed = true;
          try {
            controller.close();
          } catch {
            /* already closed */
          }
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

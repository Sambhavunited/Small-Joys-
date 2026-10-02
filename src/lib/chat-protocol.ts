import type { CartLine } from "@/lib/cart";
import type { CustomerDetails, Intent, Lead } from "@/lib/leads";

/** Lead state the browser keeps for the current conversation and sends back each turn. */
export type ClientLeadState = {
  details: CustomerDetails;
  intent?: Intent;
  summary?: string;
  orderId?: string;
  handoffAt?: string;
  alerts?: Lead["alerts"];
  createdAt?: string;
  /** Number of customer messages at the time of the last save */
  savedAt?: number;
};

export type ChatTurn = { role: "user" | "assistant"; text: string };

export type ChatRequest = {
  sessionId: string;
  messages: ChatTurn[];
  cart: CartLine[];
  lead: ClientLeadState;
  page?: string;
};

export type ChatEvent =
  | { t: "text"; v: string }
  | { t: "status"; v: string }
  | { t: "products"; ids: string[]; caption?: string }
  | { t: "cart"; cart: CartLine[] }
  | { t: "lead"; lead: ClientLeadState }
  | { t: "handoff"; url: string; orderId: string }
  | { t: "suggestions"; v: string[] }
  | { t: "error"; v: string }
  | { t: "done"; mode: "ai" | "guided" };

export const MAX_MESSAGE_CHARS = 1500;
export const MAX_HISTORY = 40;
export const MAX_USER_TURNS = 60;

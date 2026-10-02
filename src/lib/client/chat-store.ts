"use client";

import { useSyncExternalStore } from "react";
import { getProduct } from "@/data/menu";
import type { ChatEvent, ChatTurn, ClientLeadState } from "@/lib/chat-protocol";
import { MAX_HISTORY, MAX_MESSAGE_CHARS } from "@/lib/chat-protocol";
import { sanitizeCart } from "@/lib/cart";
import { cartStore } from "@/lib/client/cart-store";
import { randomId, readStorage, removeStorage, writeStorage } from "@/lib/client/storage";
import { uiStore } from "@/lib/client/ui-store";

export type UIMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  products?: string[];
  handoff?: { url: string; orderId: string };
  error?: boolean;
};

export type ChatState = {
  sessionId: string;
  messages: UIMessage[];
  lead: ClientLeadState;
  suggestions: string[];
  streaming: boolean;
  statusLabel: string | null;
  mode: "ai" | "guided" | null;
  updatedAt: number;
};

const KEY = "sj-chat-v1";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 14;

const fresh = (): ChatState => ({
  sessionId: "",
  messages: [],
  lead: { details: {} },
  suggestions: [],
  streaming: false,
  statusLabel: null,
  mode: null,
  updatedAt: 0,
});

const SERVER = fresh();
let state: ChatState = SERVER;
let loaded = false;
let controller: AbortController | null = null;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  const saved = readStorage<Partial<ChatState>>(KEY);
  if (
    saved &&
    typeof saved.sessionId === "string" &&
    Array.isArray(saved.messages) &&
    Date.now() - (saved.updatedAt ?? 0) < MAX_AGE_MS
  ) {
    state = {
      ...fresh(),
      sessionId: saved.sessionId,
      messages: saved.messages.filter((m) => m && typeof m.text === "string").slice(-80),
      lead: saved.lead && typeof saved.lead === "object" ? saved.lead : { details: {} },
      updatedAt: saved.updatedAt ?? Date.now(),
    };
  } else {
    state = { ...fresh(), sessionId: randomId() };
  }
}

function set(patch: Partial<ChatState>) {
  state = { ...state, ...patch };
  for (const l of listeners) l();
}

function persist() {
  const { sessionId, messages, lead } = state;
  writeStorage(KEY, { sessionId, messages: messages.slice(-80), lead, updatedAt: Date.now() });
}

function updateMessage(id: string, fn: (m: UIMessage) => UIMessage) {
  set({ messages: state.messages.map((m) => (m.id === id ? fn(m) : m)) });
}

/** Text sent to the server for earlier turns, with notes about what the customer saw. */
function historyText(m: UIMessage) {
  let text = m.text.trim();
  if (m.role === "assistant") {
    const names = (m.products ?? []).map((id) => getProduct(id)?.name).filter(Boolean);
    if (names.length) text += `\n[Product cards shown: ${names.join("; ")}]`;
    if (m.handoff) text += `\n[WhatsApp order button shown: ${m.handoff.orderId || "general enquiry"}]`;
  }
  return text;
}

function buildHistory(): ChatTurn[] {
  const turns: ChatTurn[] = [];
  for (const m of state.messages) {
    if (m.error) continue;
    const text = historyText(m);
    if (!text) continue;
    turns.push({ role: m.role, text: m.role === "user" ? text.slice(0, MAX_MESSAGE_CHARS) : text.slice(0, 4000) });
  }
  return turns.slice(-MAX_HISTORY);
}

function currentPage() {
  try {
    return window.location.pathname;
  } catch {
    return undefined;
  }
}

async function readEvents(res: Response, onEvent: (e: ChatEvent) => void) {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      try {
        onEvent(JSON.parse(line) as ChatEvent);
      } catch {
        /* skip a malformed line */
      }
    }
  }
  const last = buffer.trim();
  if (last) {
    try {
      onEvent(JSON.parse(last) as ChatEvent);
    } catch {
      /* ignore */
    }
  }
}

export const chatStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    load();
    return state;
  },
  getServerSnapshot: () => SERVER,

  get state() {
    load();
    return state;
  },

  open(prompt?: string) {
    load();
    uiStore.setChatOpen(true);
    if (prompt) void chatStore.send(prompt);
  },

  close() {
    uiStore.setChatOpen(false);
  },

  async send(rawText: string) {
    load();
    const text = rawText.replace(/\s+\n/g, "\n").trim().slice(0, MAX_MESSAGE_CHARS);
    if (!text || state.streaming) return;

    const userMsg: UIMessage = { id: randomId(), role: "user", text };
    const reply: UIMessage = { id: randomId(), role: "assistant", text: "" };
    set({
      messages: [...state.messages.filter((m) => !m.error), userMsg, reply],
      suggestions: [],
      streaming: true,
      statusLabel: null,
    });

    controller?.abort();
    const ac = new AbortController();
    controller = ac;
    let idle: ReturnType<typeof setTimeout> | undefined;
    const armIdle = () => {
      clearTimeout(idle);
      idle = setTimeout(() => ac.abort(), 75_000);
    };

    const body = JSON.stringify({
      sessionId: state.sessionId,
      messages: buildHistory(),
      cart: cartStore.lines,
      lead: state.lead,
      page: currentPage(),
    });

    let gotText = false;
    try {
      armIdle();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: ac.signal,
      });
      if (!res.ok || !res.body) {
        let message = "Sorry, I couldn't reply just now. Please try again.";
        try {
          const data = (await res.json()) as { error?: string };
          if (data.error && res.status === 429) message = data.error;
        } catch {
          /* ignore */
        }
        throw new Error(message);
      }
      await readEvents(res, (e) => {
        armIdle();
        switch (e.t) {
          case "text":
            if (!gotText && !e.v.trim()) return;
            gotText = true;
            updateMessage(reply.id, (m) => ({ ...m, text: m.text + e.v }));
            set({ statusLabel: null });
            break;
          case "status":
            set({ statusLabel: e.v });
            break;
          case "products":
            updateMessage(reply.id, (m) => ({
              ...m,
              products: [...new Set([...(m.products ?? []), ...e.ids])].slice(0, 8),
            }));
            break;
          case "cart":
            cartStore.replace(sanitizeCart(e.cart));
            break;
          case "lead":
            set({ lead: e.lead });
            break;
          case "handoff":
            updateMessage(reply.id, (m) => ({ ...m, handoff: { url: e.url, orderId: e.orderId } }));
            break;
          case "suggestions":
            set({ suggestions: e.v.slice(0, 4) });
            break;
          case "error":
            updateMessage(reply.id, (m) => ({ ...m, text: m.text || e.v, error: !m.text }));
            break;
          case "done":
            set({ mode: e.mode });
            break;
        }
      });
      const final = state.messages.find((m) => m.id === reply.id);
      if (final && !final.text && !final.products?.length && !final.handoff) {
        updateMessage(reply.id, (m) => ({
          ...m,
          text: "Sorry, I lost my train of thought. Could you say that again?",
          error: true,
        }));
      }
    } catch (err) {
      const aborted = ac.signal.aborted;
      if (controller === ac || aborted) {
        const message = aborted
          ? "That took too long, so I stopped. Please try again."
          : err instanceof Error && err.message && !/fetch|network|load failed/i.test(err.message)
            ? err.message
            : "I couldn't connect. Please check your internet and try again.";
        updateMessage(reply.id, (m) =>
          m.text ? { ...m, text: `${m.text}\n\n(${message})` } : { ...m, text: message, error: true },
        );
      }
    } finally {
      clearTimeout(idle);
      if (controller === ac) controller = null;
      set({ streaming: false, statusLabel: null, updatedAt: Date.now() });
      persist();
    }
  },

  /** Re-send the last customer message after a failed reply. */
  retry() {
    load();
    const lastUser = [...state.messages].reverse().find((m) => m.role === "user");
    if (!lastUser || state.streaming) return;
    const idx = state.messages.lastIndexOf(lastUser);
    set({ messages: state.messages.slice(0, idx) });
    void chatStore.send(lastUser.text);
  },

  /** Record that the customer tapped the WhatsApp button: their order is confirmed. */
  confirmHandoff() {
    load();
    const handoffAt = state.lead.handoffAt ?? new Date().toISOString();
    set({ lead: { ...state.lead, handoffAt, intent: "high" } });
    persist();
    try {
      void fetch("/api/chat/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({ sessionId: state.sessionId, lead: state.lead, cart: cartStore.lines, page: currentPage() }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { lead?: ClientLeadState } | null) => {
          if (data?.lead) {
            set({ lead: data.lead });
            persist();
          }
        })
        .catch(() => {});
    } catch {
      /* the WhatsApp link still opens */
    }
  },

  /** Start a brand new conversation (new lead). */
  reset() {
    load();
    controller?.abort();
    controller = null;
    state = { ...fresh(), sessionId: randomId() };
    removeStorage(KEY);
    for (const l of listeners) l();
  },
};

export function useChat() {
  return useSyncExternalStore(chatStore.subscribe, chatStore.getSnapshot, chatStore.getServerSnapshot);
}

"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { ArrowUp, ChevronDown, MessageCircle, RefreshCw, RotateCcw, ShoppingBag, X } from "lucide-react";
import { getProduct, occasions } from "@/data/menu";
import { site } from "@/data/site";
import { MAX_MESSAGE_CHARS } from "@/lib/chat-protocol";
import { formatINR, priceLabel } from "@/lib/format";
import { useCart } from "@/lib/client/cart-store";
import { chatStore, useChat, type UIMessage } from "@/lib/client/chat-store";
import { readStorage, writeStorage } from "@/lib/client/storage";
import { uiStore, useUI } from "@/lib/client/ui-store";
import { AddToBox } from "@/components/add-to-box";
import { ProductImage } from "@/components/product-image";
import { RichText } from "@/components/chat/rich-text";

const TEASER_KEY = "sj-joy-teaser-v1";

function Avatar({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <span
      className={clsx(
        "flex shrink-0 items-center justify-center rounded-full bg-cream ring-2 ring-paper/70",
        size === "sm" ? "size-8" : "size-11",
      )}
    >
      <Image src="/images/brand/bow.png" alt="" width={64} height={24} className={size === "sm" ? "w-6" : "w-8"} />
    </span>
  );
}

function ProductStrip({ ids }: { ids: string[] }) {
  const items = ids.map((id) => getProduct(id)).filter((p) => p != null);
  if (!items.length) return null;
  return (
    <div className="no-scrollbar relative -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pt-1 pb-2">
      {items.map((p) => (
        <div
          key={p.id}
          className="relative flex w-44 shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-paper shadow-soft ring-1 ring-line"
        >
          <ProductImage product={p} sizes="176px" className="h-28" />
          <div className="flex flex-1 flex-col gap-1 p-3">
            <p className="line-clamp-2 text-sm leading-snug font-bold">{p.name}</p>
            <p className="text-xs font-bold text-burgundy">
              {priceLabel(p)}
              {p.unit && p.price != null ? <span className="font-medium text-muted"> · {p.unit}</span> : null}
            </p>
            <div className="mt-auto pt-1.5">
              <AddToBox product={p} compact />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function HandoffCard({ handoff, current }: { handoff: NonNullable<UIMessage["handoff"]>; current: boolean }) {
  if (!current) {
    return <p className="text-xs text-muted italic">This order was updated further down.</p>;
  }
  return (
    <div className="rounded-2xl bg-[#e8f4ec] p-3.5 ring-1 ring-whatsapp/20">
      {handoff.orderId ? (
        <p className="text-[0.7rem] font-bold tracking-wider text-whatsapp uppercase">Order {handoff.orderId} is ready</p>
      ) : null}
      <a
        href={handoff.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => chatStore.confirmHandoff()}
        className="btn btn-whatsapp mt-2 w-full"
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        {handoff.orderId ? "Send order on WhatsApp" : "Chat on WhatsApp"}
      </a>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Opens WhatsApp with your {handoff.orderId ? "order" : "message"} typed out. {site.owner} confirms the final price,
        delivery and payment with you there.
      </p>
    </div>
  );
}

function Message({
  m,
  isLast,
  latestHandoffId,
  streaming,
  statusLabel,
}: {
  m: UIMessage;
  isLast: boolean;
  latestHandoffId?: string;
  streaming: boolean;
  statusLabel: string | null;
}) {
  if (m.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-[1.25rem] rounded-br-md bg-burgundy px-4 py-2.5 text-[0.95rem] leading-relaxed whitespace-pre-wrap text-paper">
          {m.text}
        </div>
      </div>
    );
  }
  const waiting = isLast && streaming && !m.text;
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-end gap-2">
        <Avatar size="sm" />
        <div
          className={clsx(
            "max-w-[85%] rounded-[1.25rem] rounded-bl-md px-4 py-2.5 text-[0.95rem] leading-relaxed",
            m.error ? "bg-rose text-burgundy-deep ring-1 ring-burgundy/20" : "bg-paper text-ink shadow-soft ring-1 ring-line/70",
          )}
        >
          {waiting ? (
            <span className="flex items-center gap-2 py-1" aria-label="Joy is typing">
              <span className="flex gap-1">
                <span className="size-1.5 animate-blink rounded-full bg-muted" />
                <span className="size-1.5 animate-blink rounded-full bg-muted [animation-delay:0.2s]" />
                <span className="size-1.5 animate-blink rounded-full bg-muted [animation-delay:0.4s]" />
              </span>
              {statusLabel ? <span className="text-xs text-muted">{statusLabel}</span> : null}
            </span>
          ) : (
            <RichText text={m.text} />
          )}
          {m.error && isLast && !streaming ? (
            <button
              type="button"
              onClick={() => chatStore.retry()}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold underline underline-offset-4"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              Try again
            </button>
          ) : null}
        </div>
      </div>
      {isLast && streaming && m.text && statusLabel ? <p className="pl-10 text-xs text-muted italic">{statusLabel}</p> : null}
      {m.products?.length ? (
        <div className="pl-10">
          <ProductStrip ids={m.products} />
        </div>
      ) : null}
      {m.handoff ? (
        <div className="pl-10">
          <HandoffCard handoff={m.handoff} current={m.id === latestHandoffId} />
        </div>
      ) : null}
    </div>
  );
}

function Welcome() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-2">
        <Avatar size="sm" />
        <div className="max-w-[85%] rounded-[1.25rem] rounded-bl-md bg-paper px-4 py-3 text-[0.95rem] leading-relaxed shadow-soft ring-1 ring-line/70">
          <p>
            Hi, I&apos;m <strong>Joy</strong>, the {site.name} gifting assistant.
          </p>
          <p className="mt-2">
            Tell me what you&apos;re celebrating, who it&apos;s for and your budget. I&apos;ll suggest treats, build your gift box
            and send your order to {site.owner} on WhatsApp.
          </p>
        </div>
      </div>
      <div className="pl-10">
        <p className="mb-2 text-xs font-bold tracking-wider text-muted uppercase">Start with an occasion</p>
        <div className="flex flex-wrap gap-2">
          {occasions.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => void chatStore.send(o.prompt)}
              className="rounded-full bg-paper px-3.5 py-2 text-sm font-semibold text-ink shadow-soft ring-1 ring-line transition hover:text-burgundy hover:ring-burgundy/40"
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatPanel() {
  const router = useRouter();
  const chat = useChat();
  const { priced } = useCart();
  const [draft, setDraft] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stick = useRef(true);

  const last = chat.messages[chat.messages.length - 1];
  const latestHandoffId = [...chat.messages].reverse().find((m) => m.handoff)?.id;

  useEffect(() => {
    if (window.matchMedia("(min-width: 640px)").matches) inputRef.current?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && chatStore.close();
    window.addEventListener("keydown", onKey);
    let prev: string | undefined;
    const mobile = !window.matchMedia("(min-width: 640px)").matches;
    if (mobile) {
      prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      if (mobile) document.body.style.overflow = prev ?? "";
    };
  }, []);

  // Keep the newest message in view while the reply streams in.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [chat.messages, chat.statusLabel, chat.suggestions]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  };

  const resize = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || chat.streaming) return;
    stick.current = true;
    void chatStore.send(text);
    setDraft("");
    requestAnimationFrame(resize);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  const sendSuggestion = (text: string) => {
    stick.current = true;
    if (text === "Go to checkout") {
      chatStore.close();
      router.push("/checkout");
      return;
    }
    void chatStore.send(text);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Chat with Joy, the Small Joys gifting assistant"
      className="fixed inset-0 z-[55] flex animate-pop flex-col bg-cream sm:inset-auto sm:right-5 sm:bottom-5 sm:h-[min(44rem,calc(100dvh-2.5rem))] sm:w-[25.5rem] sm:overflow-hidden sm:rounded-[1.75rem] sm:shadow-lift sm:ring-1 sm:ring-line"
    >
      <div className="flex items-center gap-3 bg-burgundy px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 text-paper">
        <Avatar />
        <div className="min-w-0 flex-1">
          <p className="font-display text-2xl leading-none">Joy</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-paper/80">
            <span className="size-2 rounded-full bg-[#7ee2a0]" aria-hidden="true" />
            Gifting assistant · online 24x7
          </p>
        </div>
        {confirmReset ? (
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              className="rounded-full bg-paper px-3 py-1.5 font-bold text-burgundy"
              onClick={() => {
                chatStore.reset();
                setConfirmReset(false);
                setDraft("");
              }}
            >
              New chat
            </button>
            <button
              type="button"
              className="rounded-full px-2 py-1.5 font-semibold text-paper/85"
              onClick={() => setConfirmReset(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            {chat.messages.length ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="flex size-9 items-center justify-center rounded-full text-paper/85 transition hover:bg-white/10 hover:text-paper"
                aria-label="Start a new chat"
                title="Start a new chat"
              >
                <RotateCcw className="size-4.5" aria-hidden="true" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => chatStore.close()}
              className="flex size-9 items-center justify-center rounded-full text-paper/85 transition hover:bg-white/10 hover:text-paper"
              aria-label="Close chat"
            >
              <X className="size-5 sm:hidden" aria-hidden="true" />
              <ChevronDown className="hidden size-5 sm:block" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-4 py-5"
        aria-live="polite"
        aria-busy={chat.streaming}
      >
        {chat.messages.length === 0 ? <Welcome /> : null}
        {chat.messages.map((m) => (
          <Message
            key={m.id}
            m={m}
            isLast={m === last}
            latestHandoffId={latestHandoffId}
            streaming={chat.streaming}
            statusLabel={chat.statusLabel}
          />
        ))}
        {!chat.streaming && chat.suggestions.length ? (
          <div className="flex flex-wrap justify-end gap-2">
            {chat.suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => sendSuggestion(s)}
                className="rounded-full border border-burgundy/30 bg-paper px-3.5 py-1.5 text-sm font-semibold text-burgundy transition hover:bg-burgundy hover:text-paper"
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {priced.itemCount > 0 ? (
        <div className="flex items-center gap-3 border-t border-line bg-paper/70 px-4 py-2.5">
          <ShoppingBag className="size-4 text-burgundy" aria-hidden="true" />
          <p className="flex-1 text-sm">
            <span className="font-bold">Gift box</span> · {priced.itemCount} item{priced.itemCount === 1 ? "" : "s"}
            {priced.subtotal ? ` · ${formatINR(priced.subtotal)}` : ""}
          </p>
          <button
            type="button"
            onClick={() => uiStore.openDrawer()}
            className="text-sm font-bold text-burgundy underline underline-offset-4"
          >
            View
          </button>
        </div>
      ) : null}

      <form onSubmit={submit} className="border-t border-line bg-paper px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-end gap-2 rounded-[1.4rem] bg-cream px-3 py-1.5 ring-1 ring-line focus-within:ring-2 focus-within:ring-burgundy/50">
          <label htmlFor="joy-input" className="sr-only">
            Message Joy
          </label>
          <textarea
            id="joy-input"
            ref={inputRef}
            rows={1}
            value={draft}
            maxLength={MAX_MESSAGE_CHARS}
            enterKeyHint="send"
            onChange={(e) => {
              setDraft(e.target.value);
              resize();
            }}
            onKeyDown={onKeyDown}
            placeholder={chat.messages.length ? "Type your message…" : "e.g. Diwali gifts under ₹500"}
            className="max-h-36 min-h-10 flex-1 resize-none bg-transparent py-2 text-base leading-snug outline-none placeholder:text-muted/70 focus-visible:outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim() || chat.streaming}
            className="mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-burgundy text-paper transition enabled:hover:bg-burgundy-deep disabled:opacity-40"
            aria-label="Send message"
          >
            <ArrowUp className="size-5" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-2 px-1 text-center text-[0.7rem] leading-snug text-muted">
          Joy is an AI assistant and can make mistakes. Prices are confirmed on WhatsApp.{" "}
          <Link href="/privacy" className="underline underline-offset-2" onClick={() => chatStore.close()}>
            Privacy
          </Link>
        </p>
      </form>
    </div>
  );
}

function Launcher() {
  const pathname = usePathname();
  const [teaser, setTeaser] = useState(false);

  useEffect(() => {
    if (pathname !== "/") return;
    if (readStorage<boolean>(TEASER_KEY)) return;
    const t = setTimeout(() => setTeaser(true), 7000);
    return () => clearTimeout(t);
  }, [pathname]);

  const dismiss = () => {
    setTeaser(false);
    writeStorage(TEASER_KEY, true);
  };

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:right-5 sm:bottom-5">
      {teaser ? (
        <div className="relative max-w-[16rem] animate-pop rounded-2xl rounded-br-md bg-paper p-3.5 pr-8 text-sm leading-snug shadow-lift ring-1 ring-line">
          <button
            type="button"
            onClick={dismiss}
            className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full text-muted hover:text-ink"
            aria-label="Dismiss"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="text-left"
            onClick={() => {
              dismiss();
              chatStore.open();
            }}
          >
            <span className="font-bold">Looking for a gift?</span> Tell me the occasion and budget, and I&apos;ll put together
            something lovely.
          </button>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => {
          dismiss();
          chatStore.open();
        }}
        className="group flex items-center gap-3 rounded-full bg-burgundy py-2 pr-5 pl-2 text-paper shadow-lift ring-4 ring-cream/70 transition hover:bg-burgundy-deep"
        aria-label="Chat with Joy, our gifting assistant"
      >
        <span className="relative">
          <Avatar />
          <span className="absolute right-0 bottom-0 size-3 rounded-full bg-[#4ccf7c] ring-2 ring-burgundy" aria-hidden="true" />
        </span>
        <span className="text-left leading-tight">
          <span className="block font-bold">Ask Joy</span>
          <span className="block text-xs text-paper/75">Gift help, 24x7</span>
        </span>
      </button>
    </div>
  );
}

export function ChatWidget() {
  const { chatOpen, drawerOpen } = useUI();
  const pathname = usePathname();

  // Open the chat from a shared link, e.g. /?chat=1 in an Instagram bio.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has("chat")) chatStore.open(params.get("q")?.slice(0, 300) || undefined);
    } catch {
      /* ignore */
    }
  }, []);

  if (pathname.startsWith("/admin")) return null;
  if (chatOpen) return <ChatPanel />;
  if (drawerOpen) return null;
  return <Launcher />;
}

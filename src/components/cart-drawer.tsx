"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Sparkles, Trash, X } from "lucide-react";
import { getProduct } from "@/data/menu";
import { describeLine, lineKey } from "@/lib/cart";
import { formatINR } from "@/lib/format";
import { cartStore, useCart } from "@/lib/client/cart-store";
import { chatStore } from "@/lib/client/chat-store";
import { uiStore, useUI } from "@/lib/client/ui-store";
import { ProductImage } from "@/components/product-image";

export function CartDrawer() {
  const { drawerOpen } = useUI();
  const { priced } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!drawerOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && uiStore.closeDrawer();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  if (!drawerOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-labelledby="gift-box-title">
      <button
        type="button"
        aria-label="Close gift box"
        tabIndex={-1}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
        onClick={() => uiStore.closeDrawer()}
      />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md animate-pop flex-col bg-cream shadow-lift">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 id="gift-box-title" className="font-display text-3xl leading-none">
              Your gift box
            </h2>
            <p className="mt-1 text-sm text-muted">
              {priced.itemCount ? `${priced.itemCount} item${priced.itemCount === 1 ? "" : "s"}` : "Nothing here yet"}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={() => uiStore.closeDrawer()}
            className="flex size-10 items-center justify-center rounded-full bg-paper shadow-soft"
            aria-label="Close"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {priced.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-paper text-burgundy shadow-soft">
              <ShoppingBag className="size-7" aria-hidden="true" />
            </span>
            <p className="font-display text-2xl">Your gift box is empty</p>
            <p className="text-sm text-muted">Pick a few treats from the menu, or let Joy suggest something for your occasion.</p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link href="/menu" className="btn btn-primary" onClick={() => uiStore.closeDrawer()}>
                Browse the menu
              </Link>
              <button type="button" className="btn btn-outline" onClick={() => chatStore.open("Can you suggest something?")}>
                <Sparkles className="size-4" aria-hidden="true" />
                Ask Joy
              </button>
            </div>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto overscroll-contain px-5">
              {priced.lines.map((line) => {
                const product = getProduct(line.productId);
                if (!product) return null;
                const min = product.minQty ?? 1;
                return (
                  <li key={lineKey(line)} className="flex gap-3.5 py-4">
                    <ProductImage product={product} sizes="80px" className="size-20 shrink-0 rounded-xl" />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-bold leading-snug">{product.name}</p>
                          {line.option ? <p className="text-sm text-muted">{line.option}</p> : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => cartStore.remove(line)}
                          className="-mt-1 -mr-1 flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-paper hover:text-burgundy"
                          aria-label={`Remove ${describeLine(line)}`}
                        >
                          <Trash className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1 rounded-full bg-paper p-0.5 shadow-soft ring-1 ring-line">
                          <button
                            type="button"
                            className="flex size-8 items-center justify-center rounded-full transition hover:bg-cream"
                            onClick={() => cartStore.setQuantity(line, line.quantity <= min ? 0 : line.quantity - 1)}
                            aria-label={`One fewer ${product.name}`}
                          >
                            <Minus className="size-3.5" aria-hidden="true" />
                          </button>
                          <span className="min-w-7 text-center text-sm font-bold">{line.quantity}</span>
                          <button
                            type="button"
                            className="flex size-8 items-center justify-center rounded-full transition hover:bg-cream"
                            onClick={() => cartStore.setQuantity(line, line.quantity + 1)}
                            aria-label={`One more ${product.name}`}
                          >
                            <Plus className="size-3.5" aria-hidden="true" />
                          </button>
                        </div>
                        <p className="font-bold">
                          {line.lineTotal == null ? (
                            <span className="text-sm text-muted">Price on WhatsApp</span>
                          ) : (
                            formatINR(line.lineTotal)
                          )}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-line bg-paper px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex items-baseline justify-between">
                <span className="font-semibold">Estimated total</span>
                <span className="font-display text-3xl text-burgundy">{formatINR(priced.subtotal)}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {priced.hasUnpriced ? "Some items are priced on WhatsApp. " : ""}
                Final price, delivery and payment are confirmed with you on WhatsApp.
              </p>
              <div className="mt-4 grid gap-2.5">
                <Link href="/checkout" className="btn btn-primary w-full" onClick={() => uiStore.closeDrawer()}>
                  Checkout and send on WhatsApp
                </Link>
                <button
                  type="button"
                  className="btn btn-outline w-full"
                  onClick={() => chatStore.open("I'm ready to order my gift box.")}
                >
                  <Sparkles className="size-4" aria-hidden="true" />
                  Finish my order with Joy
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function Toaster() {
  const { toast, chatOpen } = useUI();
  if (!toast) return null;
  return (
    <div
      className={clsx(
        "pointer-events-none fixed inset-x-0 z-[70] flex justify-center px-4",
        // Keep clear of the chat's message box on phones.
        chatOpen ? "top-20 sm:top-auto sm:bottom-8 sm:justify-start sm:pl-8" : "bottom-24 sm:bottom-8",
      )}
      role="status"
      aria-live="polite"
    >
      <div
        key={toast.id}
        className="pointer-events-auto flex max-w-md animate-pop items-center gap-3 rounded-full bg-ink py-2 pr-2 pl-5 text-sm text-paper shadow-lift"
      >
        <span className="line-clamp-2">{toast.text}</span>
        {toast.action === "box" ? (
          <button
            type="button"
            onClick={() => {
              uiStore.dismissToast();
              uiStore.openDrawer();
            }}
            className="shrink-0 rounded-full bg-paper px-3.5 py-1.5 text-xs font-bold text-ink"
          >
            View box
          </button>
        ) : null}
      </div>
    </div>
  );
}

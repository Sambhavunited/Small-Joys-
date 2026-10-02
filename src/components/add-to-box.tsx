"use client";

import { useId, useState } from "react";
import clsx from "clsx";
import { Check, MessageCircle, Minus, Plus } from "lucide-react";
import type { Product } from "@/data/menu";
import { lineKey } from "@/lib/cart";
import { formatINR } from "@/lib/format";
import { cartStore, useCart } from "@/lib/client/cart-store";
import { chatStore } from "@/lib/client/chat-store";
import { uiStore } from "@/lib/client/ui-store";

export function AddToBox({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { lines } = useCart();
  const selectId = useId();
  const [option, setOption] = useState(product.options?.[0]?.label);
  const [justAdded, setJustAdded] = useState(false);

  if (product.madeToOrder || product.price == null) {
    return (
      <button
        type="button"
        className={clsx("btn btn-outline w-full", compact && "btn-sm")}
        onClick={() => chatStore.open(`I'd like a quote for the ${product.name}.`)}
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        Get a quote
      </button>
    );
  }

  const step = product.minQty ?? 1;
  const inBox = lines.find((l) => lineKey(l) === lineKey({ productId: product.id, option }));
  const selected = product.options?.find((o) => o.label === option);
  const unitPrice = selected?.price ?? product.price;

  const add = () => {
    const ok = cartStore.add(product.id, option, inBox ? 1 : step);
    if (!ok) {
      uiStore.notify("Your gift box is full. Please check out or remove something first.", "box");
      return;
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
    uiStore.notify(`${product.name}${option ? ` (${option})` : ""} added to your gift box`, "box");
  };

  return (
    <div className="flex flex-col gap-2">
      {product.options?.length ? (
        <div>
          <label htmlFor={selectId} className="sr-only">
            {product.optionLabel ?? "Option"}
          </label>
          <select
            id={selectId}
            value={option}
            onChange={(e) => setOption(e.target.value)}
            className={clsx(
              "field cursor-pointer appearance-none bg-[length:16px] bg-[right_0.8rem_center] bg-no-repeat pr-9 text-sm",
              compact ? "min-h-9 py-1.5" : "min-h-10 py-2",
            )}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236c5e55' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
            }}
          >
            {product.options.map((o) => (
              <option key={o.label} value={o.label}>
                {o.label}
                {o.price != null && o.price !== product.price ? ` · ${formatINR(o.price)}` : ""}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {inBox ? (
        <div className={clsx("flex items-center justify-between gap-2 rounded-full bg-cream-deep p-1", compact ? "h-9" : "h-11")}>
          <button
            type="button"
            aria-label={`Remove one ${product.name}`}
            className="flex size-9 items-center justify-center rounded-full bg-paper text-ink shadow-soft transition hover:bg-white"
            onClick={() => cartStore.setQuantity(inBox, inBox.quantity - (inBox.quantity <= step ? inBox.quantity : 1))}
          >
            <Minus className="size-4" aria-hidden="true" />
          </button>
          <span className="text-sm font-bold" aria-live="polite">
            {inBox.quantity} in box
          </span>
          <button
            type="button"
            aria-label={`Add one more ${product.name}`}
            className="flex size-9 items-center justify-center rounded-full bg-burgundy text-paper shadow-soft transition hover:bg-burgundy-deep"
            onClick={add}
          >
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button type="button" className={clsx("btn btn-primary w-full", compact && "btn-sm")} onClick={add}>
          {justAdded ? <Check className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
          {compact ? "Add" : `Add${step > 1 ? ` ${step}` : ""} to box`}
          {!compact && unitPrice != null && step > 1 ? (
            <span className="font-medium opacity-80">· {formatINR(unitPrice * step)}</span>
          ) : null}
        </button>
      )}
    </div>
  );
}

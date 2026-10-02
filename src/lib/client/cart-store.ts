"use client";

import { useSyncExternalStore } from "react";
import { getProduct } from "@/data/menu";
import { lineKey, MAX_LINES, MAX_QTY, priceCart, sanitizeCart, type CartLine, type PricedCart } from "@/lib/cart";
import { readStorage, writeStorage } from "@/lib/client/storage";

const KEY = "sj-gift-box-v1";
const EMPTY: CartLine[] = [];

let lines: CartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  lines = sanitizeCart(readStorage<unknown>(KEY));
}

function emit() {
  for (const l of listeners) l();
}

function commit(next: CartLine[]) {
  lines = next;
  writeStorage(KEY, next);
  emit();
}

function onStorage(e: StorageEvent) {
  if (e.key !== KEY) return;
  lines = sanitizeCart(readStorage<unknown>(KEY));
  emit();
}

export const cartStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    if (listeners.size === 1) window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot() {
    load();
    return lines;
  },
  getServerSnapshot() {
    return EMPTY;
  },
  get lines() {
    load();
    return lines;
  },
  /** Add units of a product. Returns false when the box is full. */
  add(productId: string, option?: string, quantity = 1) {
    load();
    const product = getProduct(productId);
    if (!product) return false;
    const key = lineKey({ productId, option });
    const idx = lines.findIndex((l) => lineKey(l) === key);
    if (idx >= 0) {
      commit(lines.map((l, i) => (i === idx ? { ...l, quantity: Math.min(l.quantity + quantity, MAX_QTY) } : l)));
      return true;
    }
    if (lines.length >= MAX_LINES) return false;
    commit([...lines, { productId, ...(option ? { option } : {}), quantity: Math.min(Math.max(1, quantity), MAX_QTY) }]);
    return true;
  },
  setQuantity(line: Pick<CartLine, "productId" | "option">, quantity: number) {
    load();
    const key = lineKey(line);
    if (quantity < 1) {
      commit(lines.filter((l) => lineKey(l) !== key));
      return;
    }
    commit(lines.map((l) => (lineKey(l) === key ? { ...l, quantity: Math.min(Math.floor(quantity), MAX_QTY) } : l)));
  },
  setNote(line: Pick<CartLine, "productId" | "option">, note: string) {
    load();
    const key = lineKey(line);
    const clean = note.slice(0, 200);
    commit(lines.map((l) => (lineKey(l) === key ? { ...l, note: clean || undefined } : l)));
  },
  remove(line: Pick<CartLine, "productId" | "option">) {
    this.setQuantity(line, 0);
  },
  replace(next: CartLine[]) {
    load();
    commit(sanitizeCart(next));
  },
  clear() {
    commit([]);
  },
};

export function useCart(): { lines: CartLine[]; priced: PricedCart } {
  const current = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);
  return { lines: current, priced: priceCart(current) };
}

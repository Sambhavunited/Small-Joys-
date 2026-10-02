import { getProduct, type Product } from "@/data/menu";

export type CartLine = {
  productId: string;
  option?: string;
  quantity: number;
  note?: string;
};

export type PricedLine = CartLine & {
  name: string;
  unit?: string;
  image?: string;
  imageFit?: Product["imageFit"];
  unitPrice: number | null;
  lineTotal: number | null;
};

export type PricedCart = {
  lines: PricedLine[];
  subtotal: number;
  hasUnpriced: boolean;
  itemCount: number;
};

export const MAX_LINES = 30;
export const MAX_QTY = 500;

export function lineKey(line: Pick<CartLine, "productId" | "option">) {
  return `${line.productId}::${(line.option ?? "").toLowerCase()}`;
}

/** Match a free-text option to the product's option list (case-insensitive). */
export function matchOption(product: Product, option: unknown): string | undefined {
  if (!product.options?.length || typeof option !== "string") return undefined;
  const wanted = option.trim().toLowerCase();
  if (!wanted) return undefined;
  const exact = product.options.find((o) => o.label.toLowerCase() === wanted);
  if (exact) return exact.label;
  const partial = product.options.find((o) => o.label.toLowerCase().includes(wanted) || wanted.includes(o.label.toLowerCase()));
  return partial?.label;
}

export function unitPriceFor(product: Product, option?: string): number | null {
  if (product.madeToOrder || product.price == null) return null;
  const opt = option ? product.options?.find((o) => o.label === option) : undefined;
  return opt?.price ?? product.price;
}

/** Validate untrusted cart input against the catalog. Unknown products are dropped. */
export function sanitizeCart(input: unknown): CartLine[] {
  if (!Array.isArray(input)) return [];
  const merged = new Map<string, CartLine>();
  for (const raw of input.slice(0, MAX_LINES * 2)) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const product = typeof r.productId === "string" ? getProduct(r.productId) : undefined;
    if (!product) continue;
    const option = matchOption(product, r.option);
    const qty = Math.floor(Number(r.quantity));
    if (!Number.isFinite(qty) || qty < 1) continue;
    const note = typeof r.note === "string" ? r.note.replace(/\s+/g, " ").trim().slice(0, 200) : undefined;
    const line: CartLine = { productId: product.id, option, quantity: Math.min(qty, MAX_QTY), ...(note ? { note } : {}) };
    const key = lineKey(line);
    const existing = merged.get(key);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + line.quantity, MAX_QTY);
      if (line.note) existing.note = line.note;
    } else if (merged.size < MAX_LINES) {
      merged.set(key, line);
    }
  }
  return [...merged.values()];
}

export function priceCart(lines: CartLine[]): PricedCart {
  let subtotal = 0;
  let hasUnpriced = false;
  let itemCount = 0;
  const priced: PricedLine[] = [];
  for (const line of lines) {
    const product = getProduct(line.productId);
    if (!product) continue;
    const unitPrice = unitPriceFor(product, line.option);
    const lineTotal = unitPrice == null ? null : unitPrice * line.quantity;
    if (lineTotal == null) hasUnpriced = true;
    else subtotal += lineTotal;
    itemCount += line.quantity;
    priced.push({
      ...line,
      name: product.name,
      unit: product.unit,
      image: product.image,
      imageFit: product.imageFit,
      unitPrice,
      lineTotal,
    });
  }
  return { lines: priced, subtotal, hasUnpriced, itemCount };
}

export function describeLine(line: Pick<PricedLine, "name" | "option" | "quantity" | "unit">) {
  const opt = line.option ? ` (${line.option})` : "";
  return `${line.name}${opt} × ${line.quantity}`;
}

import clsx from "clsx";
import type { Product, Tag } from "@/data/menu";
import { priceLabel } from "@/lib/format";
import { AddToBox } from "@/components/add-to-box";
import { ProductImage } from "@/components/product-image";

const tagLabel: Record<Tag, string> = {
  bestseller: "Bestseller",
  festive: "Festive",
  corporate: "Corporate",
  kids: "Kids love it",
  eggless: "Eggless",
  new: "New",
};

/**
 * A menu item with photo, price and an Add button.
 * `row` lays it out side by side on phones (compact lists), and as a card from the sm breakpoint.
 */
export function ProductCard({
  product,
  priority,
  className,
  layout = "row",
}: {
  product: Product;
  priority?: boolean;
  className?: string;
  layout?: "row" | "stack";
}) {
  const tag = product.tags?.find((t) => t === "bestseller" || t === "new" || t === "eggless") ?? product.tags?.[0];
  const row = layout === "row";
  return (
    <article
      className={clsx(
        "group relative flex overflow-hidden rounded-card bg-paper shadow-soft ring-1 ring-line/70 transition-shadow duration-300 hover:shadow-lift",
        row ? "flex-row sm:flex-col" : "flex-col",
        className,
      )}
    >
      <div className={clsx("relative", row && "w-[38%] shrink-0 sm:w-auto")}>
        <ProductImage
          product={product}
          priority={priority}
          className={clsx(row ? "h-full min-h-40 sm:aspect-[4/4.2] sm:h-auto sm:min-h-0" : "aspect-[4/4.2]")}
          sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 92vw"
        />
        {tag ? (
          <span
            className={clsx(
              "absolute top-2.5 left-2.5 rounded-full bg-paper/90 px-2 py-0.5 text-[0.65rem] font-bold tracking-wide text-ink shadow-soft backdrop-blur sm:top-3 sm:left-3 sm:px-2.5 sm:py-1 sm:text-[0.7rem]",
              row && "max-sm:hidden",
            )}
          >
            {tagLabel[tag]}
          </span>
        ) : null}
      </div>
      <div className={clsx("flex min-w-0 flex-1 flex-col gap-1.5", row ? "p-3.5 sm:p-5" : "p-4 sm:p-5")}>
        <div
          className={clsx(
            "flex gap-x-3",
            row ? "flex-col sm:flex-row sm:items-start sm:justify-between" : "items-start justify-between",
          )}
        >
          <h3 className={clsx("font-display leading-[1.1] text-ink", row ? "text-[1.3rem] sm:text-[1.45rem]" : "text-[1.45rem]")}>
            {product.name}
          </h3>
          <p
            className={clsx(
              "shrink-0 font-bold text-burgundy",
              row ? "text-sm sm:pt-1 sm:text-[0.95rem]" : "pt-1 text-[0.95rem]",
            )}
          >
            {priceLabel(product)}
          </p>
        </div>
        {product.unit ? <p className="text-xs font-semibold tracking-wide text-muted uppercase">{product.unit}</p> : null}
        <p className={clsx("text-sm leading-relaxed text-muted", row ? "line-clamp-2 sm:line-clamp-3" : "line-clamp-3")}>
          {product.description}
        </p>
        {product.minQty ? <p className="text-xs text-olive-deep">Minimum {product.minQty} pieces</p> : null}
        <div className="mt-auto pt-2 sm:pt-3">
          <AddToBox product={product} />
        </div>
      </div>
    </article>
  );
}

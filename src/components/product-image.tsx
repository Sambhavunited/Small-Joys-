import Image from "next/image";
import clsx from "clsx";
import { CakeSlice, Cookie, Dessert, Gift, UtensilsCrossed } from "lucide-react";
import type { CategoryId, Product, Tone } from "@/data/menu";

export const toneBg: Record<Tone, string> = {
  burgundy: "bg-burgundy-soft",
  navy: "bg-navy-soft",
  olive: "bg-olive-soft",
  sand: "bg-sand",
  rose: "bg-rose",
};

const toneInk: Record<Tone, string> = {
  burgundy: "text-burgundy",
  navy: "text-navy",
  olive: "text-olive-deep",
  sand: "text-olive-deep",
  rose: "text-burgundy",
};

const categoryIcon: Partial<Record<CategoryId, typeof Gift>> = {
  cookies: Cookie,
  cakes: CakeSlice,
  "dessert-table": Dessert,
  "made-to-order": UtensilsCrossed,
};

export function ProductImage({
  product,
  sizes,
  priority,
  className,
}: {
  product: Pick<Product, "name" | "image" | "imageFit" | "tone" | "category">;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const Icon = categoryIcon[product.category] ?? Gift;
  return (
    <div className={clsx("relative overflow-hidden", toneBg[product.tone], className)}>
      {product.image ? (
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes={sizes}
          priority={priority}
          className={clsx(
            "transition-transform duration-500 ease-out group-hover:scale-[1.03]",
            product.imageFit === "photo" ? "object-cover" : "object-contain p-[9%] drop-shadow-[0_14px_16px_rgba(42,36,32,0.16)]",
          )}
        />
      ) : (
        <div className="paper-grain absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
          <span
            className={clsx(
              "flex size-16 items-center justify-center rounded-full bg-paper/80 shadow-soft",
              toneInk[product.tone],
            )}
          >
            <Icon className="size-8" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span className={clsx("font-display text-xl leading-tight italic", toneInk[product.tone])}>{product.name}</span>
        </div>
      )}
    </div>
  );
}

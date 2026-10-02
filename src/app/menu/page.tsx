import type { Metadata } from "next";
import { categories, type CategoryId } from "@/data/menu";
import { site } from "@/data/site";
import { MenuBrowser } from "@/components/menu-browser";

export const metadata: Metadata = {
  title: "Menu",
  description: `Brownies, cookies, loaf cakes, cupcakes, macarons, tiramisu, gift hampers and dessert-table treats from ${site.name}, with prices.`,
  alternates: { canonical: "/menu" },
};

export default async function MenuPage({ searchParams }: PageProps<"/menu">) {
  const { c } = await searchParams;
  const initial = categories.some((cat) => cat.id === c) ? (c as CategoryId) : "all";
  return (
    <div className="container-page pt-8 pb-20 sm:pt-12">
      <header className="max-w-2xl">
        <p className="eyebrow">The menu</p>
        <h1 className="mt-2 font-display text-5xl leading-[0.95] sm:text-7xl">
          Little delights, <span className="text-burgundy italic">big smiles</span>
        </h1>
        <p className="mt-4 text-lg text-muted">
          Prices are per item as listed. Build your gift box here, then confirm the final price, delivery and payment on WhatsApp.
        </p>
      </header>
      <div className="mt-8">
        <MenuBrowser key={initial} initial={initial} />
      </div>
    </div>
  );
}

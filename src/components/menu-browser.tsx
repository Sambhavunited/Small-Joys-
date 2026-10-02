"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { Search, Sparkles, X } from "lucide-react";
import { categories, products, type CategoryId } from "@/data/menu";
import { chatStore } from "@/lib/client/chat-store";
import { ProductCard } from "@/components/product-card";

type Filter = CategoryId | "all";

function normalise(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9 ]/g, " ");
}

export function MenuBrowser({ initial = "all" }: { initial?: Filter }) {
  const [filter, setFilter] = useState<Filter>(initial);
  const [query, setQuery] = useState("");

  const q = normalise(query).trim();
  const visible = useMemo(() => {
    const words = q.split(/\s+/).filter(Boolean);
    return products.filter((p) => {
      if (filter !== "all" && p.category !== filter) return false;
      if (!words.length) return true;
      const hay = normalise(
        [p.name, p.description, p.unit, ...(p.options ?? []).map((o) => o.label), ...(p.tags ?? []), ...(p.occasions ?? [])].join(
          " ",
        ),
      );
      return words.every((w) => hay.includes(w));
    });
  }, [filter, q]);

  const groups = categories
    .map((c) => ({ category: c, items: visible.filter((p) => p.category === c.id) }))
    .filter((g) => g.items.length);

  const choose = (f: Filter) => {
    setFilter(f);
    try {
      const url = new URL(window.location.href);
      if (f === "all") url.searchParams.delete("c");
      else url.searchParams.set("c", f);
      window.history.replaceState(null, "", url);
    } catch {
      /* ignore */
    }
  };

  return (
    <div>
      <div className="sticky top-16 z-30 -mx-4 border-b border-line/70 bg-cream/92 px-4 py-3 backdrop-blur-md sm:top-[4.5rem] sm:mx-0 sm:rounded-b-2xl sm:px-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative lg:w-72">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <label htmlFor="menu-search" className="sr-only">
              Search the menu
            </label>
            <input
              id="menu-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search brownies, Nutella, hamper…"
              className="field min-h-11 rounded-full pr-10 pl-10"
              autoComplete="off"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:text-ink"
                aria-label="Clear search"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
          <div
            className="no-scrollbar relative -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0"
            role="tablist"
            aria-label="Categories"
          >
            {([{ id: "all", name: "Everything" }, ...categories] as { id: Filter; name: string }[]).map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={filter === c.id}
                onClick={() => choose(c.id)}
                className={clsx(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition",
                  filter === c.id ? "bg-ink text-paper" : "bg-paper text-ink ring-1 ring-line hover:ring-ink/40",
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="mx-auto max-w-md py-20 text-center">
          <p className="font-display text-3xl">Nothing matches that yet</p>
          <p className="mt-2 text-muted">Joy can tell you whether it can be made specially for you.</p>
          <button
            type="button"
            className="btn btn-primary mt-6"
            onClick={() => chatStore.open(query ? `Do you make ${query}?` : undefined)}
          >
            <Sparkles className="size-4" aria-hidden="true" />
            Ask Joy
          </button>
        </div>
      ) : (
        <div className="space-y-14 pt-8">
          {groups.map(({ category, items }) => (
            <section key={category.id} aria-labelledby={`cat-${category.id}`}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <h2 id={`cat-${category.id}`} className="font-display text-4xl leading-none">
                  {category.name}
                </h2>
                <p className="text-sm text-muted">{category.blurb}</p>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, MessageCircle, ShoppingBag, Sparkles, X } from "lucide-react";
import { navLinks, site } from "@/data/site";
import { useCart } from "@/lib/client/cart-store";
import { chatStore } from "@/lib/client/chat-store";
import { uiStore } from "@/lib/client/ui-store";
import { whatsappUrl } from "@/lib/whatsapp";

export function SiteHeader() {
  const pathname = usePathname();
  const { priced } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);

  // Close the mobile menu after navigating.
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const count = priced.itemCount;

  return (
    <header
      className={clsx(
        "sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-300",
        scrolled || menuOpen
          ? "border-b border-line/80 bg-cream/90 shadow-[0_6px_20px_-18px_rgba(42,36,32,0.5)] backdrop-blur-md"
          : "border-b border-transparent bg-cream",
      )}
    >
      <div className="container-page flex h-16 items-center gap-4 sm:h-[4.5rem]">
        <Link href="/" className="shrink-0" aria-label={`${site.name} home`}>
          <Image
            src="/images/brand/logo-mark.png"
            alt={site.name}
            width={96}
            height={70}
            priority
            className="h-12 w-auto sm:h-14"
          />
        </Link>

        <nav aria-label="Main" className="mx-auto hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "rounded-full px-3.5 py-2 text-[0.92rem] font-semibold transition-colors",
                  active ? "bg-paper text-burgundy shadow-soft" : "text-ink/80 hover:text-burgundy",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <button type="button" onClick={() => chatStore.open()} className="btn btn-outline btn-sm hidden sm:inline-flex">
            <Sparkles className="size-4 text-olive-deep" aria-hidden="true" />
            Ask Joy
          </button>
          <button
            type="button"
            onClick={() => uiStore.openDrawer()}
            className="relative flex size-11 items-center justify-center rounded-full bg-paper text-ink shadow-soft ring-1 ring-line transition hover:text-burgundy"
            aria-label={count ? `Gift box, ${count} item${count === 1 ? "" : "s"}` : "Gift box, empty"}
          >
            <ShoppingBag className="size-5" aria-hidden="true" />
            {count > 0 ? (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 animate-pop items-center justify-center rounded-full bg-burgundy px-1 text-[0.7rem] font-bold text-paper">
                {count > 99 ? "99+" : count}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex size-11 items-center justify-center rounded-full text-ink lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div id="mobile-menu" className="border-t border-line/70 bg-cream lg:hidden">
          <nav aria-label="Mobile" className="container-page flex flex-col py-3">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={pathname === l.href ? "page" : undefined}
                className={clsx(
                  "border-b border-line/60 py-3.5 font-display text-2xl",
                  pathname === l.href ? "text-burgundy" : "text-ink",
                )}
              >
                {l.label}
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-3 pt-5 pb-3">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setMenuOpen(false);
                  chatStore.open();
                }}
              >
                <Sparkles className="size-4" aria-hidden="true" />
                Ask Joy
              </button>
              <a href={whatsappUrl(`Hi ${site.name}!`)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
                <MessageCircle className="size-4" aria-hidden="true" />
                WhatsApp
              </a>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

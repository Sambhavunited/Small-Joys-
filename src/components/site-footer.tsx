import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { navLinks, site } from "@/data/site";
import { whatsappUrl } from "@/lib/whatsapp";
import { InstagramIcon } from "@/components/icons";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto bg-navy text-cream">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <div className="inline-flex rounded-2xl bg-cream px-4 py-3">
            <Image src="/images/brand/logo.png" alt={site.name} width={150} height={121} className="h-24 w-auto" />
          </div>
          <p className="mt-5 font-display text-2xl leading-snug text-cream">
            {site.promise}. <span className="italic text-[#d9c9a8]">{site.tagline}.</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-cream/70">
            A home bakery and gifting studio by {site.owner}. Every box is baked in small batches and packed by hand.
          </p>
        </div>

        <div>
          <h2 className="eyebrow text-[#d9c9a8]">Explore</h2>
          <ul className="mt-4 space-y-2.5">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-cream/85 transition hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/checkout" className="text-cream/85 transition hover:text-white">
                Your gift box
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="eyebrow text-[#d9c9a8]">Order & say hello</h2>
          <ul className="mt-4 space-y-3">
            <li>
              <a
                href={whatsappUrl(`Hi ${site.name}! I'd like to place an order.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-cream/85 transition hover:text-white"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                WhatsApp {site.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={`tel:${site.phoneE164}`}
                className="inline-flex items-center gap-2.5 text-cream/85 transition hover:text-white"
              >
                <Phone className="size-4" aria-hidden="true" />
                Call {site.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={site.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-cream/85 transition hover:text-white"
              >
                <InstagramIcon className="size-4" />@{site.instagram}
              </a>
            </li>
          </ul>
          <p className="mt-6 text-sm leading-relaxed text-cream/60">
            Our gifting assistant Joy answers 24x7. Final prices, delivery and payment are always confirmed personally on
            WhatsApp.
          </p>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-cream/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name} by {site.owner}. Made with love. Some photos show similar bakes for illustration.
          </p>
          <Link href="/privacy" className="hover:text-cream">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}

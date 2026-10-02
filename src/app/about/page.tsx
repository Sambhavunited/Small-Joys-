import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gift, HeartHandshake, Wheat } from "lucide-react";
import { site } from "@/data/site";
import { PageHero } from "@/components/page-hero";
import { WhatsAppLink } from "@/components/whatsapp-link";
import { InstagramIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Our story",
  description: `${site.name} is a home bakery and gifting studio by ${site.owner}. Little delights, packaged with love.`,
  alternates: { canonical: "/about" },
};

const values = [
  { icon: Wheat, title: "Small batches", body: "Everything is baked at home in small batches, so every order is fresh." },
  {
    icon: Gift,
    title: "Gift-ready, always",
    body: "Ribbons, note cards and boxes chosen with care, so your gift arrives ready to delight.",
  },
  {
    icon: HeartHandshake,
    title: "Personal service",
    body: `${site.owner} confirms every order personally on WhatsApp, from flavours to delivery.`,
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our story"
        title={
          <>
            Little delights, <span className="text-burgundy italic">packaged with love</span>
          </>
        }
        intro={
          <>
            <p>
              {site.name} is a home bakery and gifting studio by {site.owner}. It started with a simple belief: the smallest
              treats can carry the biggest feelings.
            </p>
            <p className="mt-4">
              Today that means fudgy brownies, printed cookies, tea-time loaves, cupcakes, macarons and festive hampers, each one
              baked in small batches and packed by hand for birthdays, festivals, weddings and everyday thank-yous.
            </p>
          </>
        }
        image="/images/gallery/hamper-burgundy-floral.webp"
        imageAlt="A burgundy gift hamper with florals, jars, a candle and printed tins"
      />

      <section className="bg-paper py-14 sm:py-20">
        <div className="container-page grid gap-5 md:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="rounded-[1.5rem] bg-cream p-6 ring-1 ring-line">
              <v.icon className="size-7 text-olive" strokeWidth={1.6} aria-hidden="true" />
              <h2 className="mt-4 font-display text-3xl">{v.title}</h2>
              <p className="mt-2 leading-relaxed text-muted">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-sand shadow-soft">
              <Image
                src="/images/gallery/cookies-packed.webp"
                alt="Cookies packed in Small Joys bags"
                fill
                sizes="(min-width: 1024px) 22vw, 45vw"
                className="object-cover"
              />
            </div>
            <div className="relative mt-10 aspect-[3/4] overflow-hidden rounded-2xl bg-sand shadow-soft">
              <Image
                src="/images/gallery/diy-cupcake-kit.webp"
                alt="A DIY cupcake kit with frosting and instructions"
                fill
                sizes="(min-width: 1024px) 22vw, 45vw"
                className="object-cover"
              />
            </div>
          </div>
          <div>
            <p className="eyebrow">Say hello</p>
            <h2 className="mt-2 font-display text-[2.35rem] leading-[1.02] sm:text-5xl">
              Let&apos;s make something <span className="text-burgundy italic">lovely</span>
            </h2>
            <p className="mt-4 text-[1.02rem] leading-relaxed text-muted">
              Planning a celebration or a festive gift list? Browse the menu, chat with Joy any time, or message {site.owner}{" "}
              directly on WhatsApp.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/menu" className="btn btn-primary px-6">
                Browse the menu <ArrowRight className="size-4.5" aria-hidden="true" />
              </Link>
              <WhatsAppLink message={`Hi ${site.name}!`} className="px-6">
                WhatsApp {site.owner.split(" ")[0]}
              </WhatsAppLink>
              <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline px-6">
                <InstagramIcon className="size-4.5" />
                Instagram
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

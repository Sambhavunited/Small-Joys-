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
  {
    icon: Wheat,
    title: "Baked in small batches",
    body: "Everything is baked at home, in modest quantities, so that every order reaches you at its very freshest.",
  },
  {
    icon: Gift,
    title: "Gift-ready, always",
    body: "Ribbons, note cards and boxes chosen with real care, so your gift arrives dressed for the occasion.",
  },
  {
    icon: HeartHandshake,
    title: "A personal touch",
    body: `${site.owner} confirms every order personally on WhatsApp, from flavours and finishes to the hour of delivery.`,
  },
];

// The customer's side of the story: the kinds of wishes behind an order. Not reviews.
const wishes = [
  {
    occasion: "For a brother, far away",
    line: "I can’t be there for Rakhi this year, so the box will have to say everything I would have said in person.",
  },
  {
    occasion: "For a little one’s birthday",
    line: "I’d like a cake that makes the whole room gasp before a single candle is lit.",
  },
  {
    occasion: "For a team at Diwali",
    line: "They have given so much this year. I want them to open something that feels personal, not corporate.",
  },
  {
    occasion: "For no reason at all",
    line: "Some Tuesdays simply call for a brownie, and a dear friend ought to know I was thinking of them.",
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
              {site.name} is a home bakery and gifting studio, founded and run by {site.owner}. It rests on one quietly held
              conviction: that the smallest of treats can carry the very largest of feelings.
            </p>
            <p className="mt-4">
              Every brownie, cookie, loaf and cupcake is baked fresh in small batches, then wrapped, ribboned and finished by
              hand, so that what arrives at your door feels less like a parcel and rather more like a gesture.
            </p>
          </>
        }
        image="/images/gallery/hamper-burgundy-floral.webp"
        imageAlt="A burgundy gift hamper with florals, jars, a candle and printed tins"
      />

      <section className="bg-paper py-14 sm:py-20">
        <div className="container-page max-w-3xl">
          <p className="eyebrow">How we bake</p>
          <h2 className="mt-2 font-display text-[2.35rem] leading-[1.02] sm:text-5xl">
            An unhurried kitchen, <span className="text-burgundy italic">a generous table</span>
          </h2>
          <div className="mt-6 space-y-5 text-[1.05rem] leading-relaxed text-muted">
            <p className="first-letter:float-left first-letter:mt-1 first-letter:mr-3 first-letter:font-display first-letter:text-[3.6rem] first-letter:leading-[0.8] first-letter:text-burgundy">
              {site.name} began, as the nicest things so often do, at home, and it is baked there still. We work in small batches
              and at an unhurried pace, because the best bakes simply cannot be rushed. We would far rather make a little less and
              make it beautifully than make a great deal of something ordinary.
            </p>
            <p>
              The menu reads rather like a little almanac of celebrations: fudgy brownies and printed cookies for everyday
              kindnesses, tea-time loaves for slow Sunday afternoons, cupcakes and macarons for parties, and hampers that make a
              proper occasion of Rakhi, Diwali and every festival in between. Custom cakes, dessert tables and high-tea spreads
              are designed one conversation at a time.
            </p>
            <p>
              We believe a present ought to give pleasure long before it is opened. And so we fuss, gladly, over the particulars:
              the colour of a ribbon, the fold of a box, the words on a note card. Every order is confirmed personally by{" "}
              {site.owner} on WhatsApp, so nothing is left to chance and nothing ever feels impersonal.
            </p>
            <p>
              Whether you are sending a single tub of tiramisu to a friend in need of cheering, or a hundred hampers to colleagues
              at Diwali, each one is made with precisely the same care, and each one arrives ready to delight.
            </p>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container-page grid gap-5 md:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="rounded-[1.5rem] bg-paper p-6 ring-1 ring-line">
              <v.icon className="size-7 text-olive" strokeWidth={1.6} aria-hidden="true" />
              <h2 className="mt-4 font-display text-3xl">{v.title}</h2>
              <p className="mt-2 leading-relaxed text-muted">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-paper py-14 sm:py-20">
        <div className="container-page">
          <p className="eyebrow">From the customer&apos;s side</p>
          <h2 className="mt-2 max-w-2xl font-display text-[2.35rem] leading-[1.02] sm:text-5xl">
            Every order begins <span className="text-burgundy italic">with a wish</span>
          </h2>
          <p className="mt-4 max-w-2xl text-[1.02rem] leading-relaxed text-muted">
            Seen from your side of the box, a gift is seldom really about the treats. It is about a feeling, and the wish to
            express it well. These are the sorts of wishes we bake for.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {wishes.map((w) => (
              <figure key={w.occasion} className="rounded-[1.5rem] bg-cream p-6 ring-1 ring-line sm:p-7">
                <figcaption className="eyebrow text-[0.7rem]">{w.occasion}</figcaption>
                <blockquote className="mt-3 font-display text-2xl leading-snug text-ink italic">
                  &ldquo;{w.line}&rdquo;
                </blockquote>
              </figure>
            ))}
          </div>
          <p className="mt-8 max-w-2xl text-[1.02rem] leading-relaxed text-muted">
            Whatever the wish, our part is to make it real: thoughtfully, beautifully and with a little something extra in every
            box.
          </p>
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
              Planning a celebration or drawing up a festive gift list? Browse the menu, chat with Joy at any hour, or message{" "}
              {site.owner} directly on WhatsApp. We would be delighted to help.
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

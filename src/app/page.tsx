import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Gift, MessageCircle, Sparkles, Wheat } from "lucide-react";
import { bestsellers, gallery, getProduct, occasions } from "@/data/menu";
import { site } from "@/data/site";
import { formatINR } from "@/lib/format";
import { whatsappUrl } from "@/lib/whatsapp";
import { OpenChatButton } from "@/components/open-chat-button";
import { ProductCard } from "@/components/product-card";
import { SafeImage } from "@/components/safe-image";
import { SectionHeading } from "@/components/section-heading";

const steps = [
  {
    title: "Pick, or just ask",
    body: "Browse the menu, or tell Joy the occasion, budget and date. Joy suggests treats that fit.",
  },
  {
    title: "Build your gift box",
    body: "Add brownies, cookies, cakes and hampers. Joy notes flavours, gift messages and delivery details.",
  },
  {
    title: "Confirm on WhatsApp",
    body: `Your order lands on ${site.owner}'s WhatsApp, already typed out. The final price, delivery and payment are confirmed personally.`,
  },
];

export default function HomePage() {
  const featured = bestsellers.slice(0, 8);
  const miniTreats = getProduct("mini-treats-4");
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container-page grid items-center gap-10 pt-6 pb-14 sm:pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pt-14 lg:pb-20">
          <div className="animate-fade-up">
            <p className="eyebrow">Home bakery & gifting studio · by {site.owner}</p>
            <h1 className="mt-4 font-display text-[3.4rem] leading-[0.92] tracking-[-0.01em] text-ink sm:text-7xl lg:text-[5.6rem]">
              Gifts that spread <span className="text-burgundy italic">smiles</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              Handmade brownies, cookies, cakes and festive hampers, baked in small batches and packed with love. Ready to gift,
              for every little celebration.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <OpenChatButton className="btn btn-primary px-6 text-base">
                <Sparkles className="size-4.5" aria-hidden="true" />
                Plan a gift with Joy
              </OpenChatButton>
              <Link href="/menu" className="btn btn-outline px-6 text-base">
                Browse the menu
                <ArrowRight className="size-4.5" aria-hidden="true" />
              </Link>
            </div>
            <ul className="mt-9 grid max-w-xl grid-cols-1 gap-3 text-sm text-ink/80 sm:grid-cols-3">
              <li className="flex items-center gap-2.5">
                <Wheat className="size-5 text-olive" aria-hidden="true" /> Baked fresh in small batches
              </li>
              <li className="flex items-center gap-2.5">
                <Gift className="size-5 text-olive" aria-hidden="true" /> Gift-ready packaging
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="size-5 text-olive" aria-hidden="true" /> Order help, 24x7
              </li>
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[2.25rem] bg-sand shadow-lift">
              <Image
                src="/images/scenes/hero-gift-box.webp"
                alt="Hands holding a Small Joys gift box of brownies, cookies and macarons tied with an olive ribbon"
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="object-cover object-[50%_40%]"
              />
            </div>
            {miniTreats ? (
              <Link
                href="/gifting"
                className="absolute -bottom-5 -left-2 flex items-center gap-3 rounded-2xl bg-paper p-3 pr-5 shadow-lift ring-1 ring-line transition hover:-translate-y-0.5 sm:-left-8"
              >
                <span className="relative size-14 overflow-hidden rounded-xl bg-sand">
                  <Image src="/images/products/dry-cake-hamper.webp" alt="" fill sizes="56px" className="object-contain p-1" />
                </span>
                <span className="leading-tight">
                  <span className="block text-[0.7rem] font-bold tracking-wider text-olive-deep uppercase">
                    Festive menu 2026
                  </span>
                  <span className="block font-display text-xl">Gift boxes from {formatINR(miniTreats.price ?? 250)}</span>
                </span>
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {/* Occasions */}
      <section className="bg-paper py-12 sm:py-16">
        <div className="container-page">
          <SectionHeading
            align="center"
            eyebrow="Gift ideas in seconds"
            title={
              <>
                What are you <span className="text-burgundy italic">celebrating?</span>
              </>
            }
            intro="Pick an occasion and Joy, our gifting assistant, will suggest the perfect treats and build your gift box with you."
          />
          <div className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-2.5 sm:gap-3">
            {occasions.map((o) => (
              <OpenChatButton
                key={o.id}
                prompt={o.prompt}
                className="rounded-full bg-cream px-4 py-2.5 text-[0.95rem] font-semibold text-ink ring-1 ring-line transition hover:-translate-y-0.5 hover:bg-burgundy hover:text-paper hover:ring-burgundy sm:px-5 sm:py-3"
              >
                {o.label}
              </OpenChatButton>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-14 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Most loved"
            title={
              <>
                Bestsellers, <span className="italic">made with love</span>
              </>
            }
            intro="The treats our customers come back for. Tap Add to start your gift box."
            action={
              <Link href="/menu" className="btn btn-outline btn-sm">
                See the full menu <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            }
          />
          <div className="no-scrollbar relative -mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4 lg:gap-5">
            {featured.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                priority={i < 2}
                layout="stack"
                className="w-[78vw] max-w-xs shrink-0 snap-start sm:w-auto sm:max-w-none"
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-navy py-14 text-cream sm:py-20">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow text-[#d9c9a8]">How ordering works</p>
            <h2 className="mt-2 font-display text-[2.35rem] leading-[1.02] sm:text-5xl">
              From idea to gift box, <span className="italic text-[#e9c7c1]">in a few taps</span>
            </h2>
          </div>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="rounded-[1.5rem] bg-white/[0.06] p-6 ring-1 ring-white/10">
                <span className="font-display text-5xl text-[#d9c9a8] italic">0{i + 1}</span>
                <h3 className="mt-3 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/75">{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <OpenChatButton className="btn bg-cream px-6 text-ink hover:bg-white">
              <Sparkles className="size-4.5 text-burgundy" aria-hidden="true" />
              Start with Joy
            </OpenChatButton>
            <a
              href={whatsappUrl(`Hi ${site.name}! I'd like to place an order.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn border border-cream/30 px-6 text-cream hover:bg-white/10"
            >
              <MessageCircle className="size-4.5" aria-hidden="true" />
              Message on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Gifting feature */}
      <section className="py-14 sm:py-20">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-[5/6] overflow-hidden rounded-[2rem] bg-sand shadow-lift">
              <Image
                src="/images/scenes/sibling-edit.webp"
                alt="The Sibling Edit DIY cookie kit with cookies, sprinkles and icing"
                fill
                sizes="(min-width: 1024px) 45vw, 92vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -right-2 -bottom-6 hidden w-44 rotate-3 overflow-hidden rounded-2xl bg-paper p-2 shadow-lift ring-1 ring-line sm:block">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-rose">
                <Image
                  src="/images/gallery/hamper-burgundy-floral.webp"
                  alt="Burgundy festive hamper"
                  fill
                  sizes="176px"
                  className="object-cover"
                />
              </div>
              <p className="px-1 pt-2 pb-1 text-center font-display text-lg italic">Custom hampers</p>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <p className="eyebrow">Festive & corporate gifting</p>
            <h2 className="mt-2 font-display text-[2.35rem] leading-[1.02] sm:text-5xl">
              Gifting, done <span className="text-burgundy italic">beautifully</span>
            </h2>
            <p className="mt-4 text-[1.02rem] leading-relaxed text-muted">
              From Rakhi and Bhai Dooj to Diwali and year-end thank-yous, every box is handmade and dressed to impress. Hampers
              can be personalised with names, messages and your company logo.
            </p>
            <ul className="mt-6 space-y-3 text-[0.98rem]">
              {[
                "Ready-to-gift boxes from the festive menu",
                "Printed cookies and brownies with your logo or message",
                "Custom hampers and personalised chocolate bars for teams",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-burgundy" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/gifting" className="btn btn-primary px-6">
                Explore gifting <ArrowRight className="size-4.5" aria-hidden="true" />
              </Link>
              <OpenChatButton prompt="I need corporate gifts for my team or clients." className="btn btn-outline px-6">
                Plan a bulk order
              </OpenChatButton>
            </div>
          </div>
        </div>
      </section>

      {/* Custom cakes */}
      <section className="bg-cream-deep/60 py-14 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Made to order"
            title={
              <>
                Cakes that tell <span className="italic">your story</span>
              </>
            }
            intro="Birthdays, anniversaries, milestones and theme parties. Share your idea and get a personal quote."
            action={
              <Link href="/custom-cakes" className="btn btn-outline btn-sm">
                See custom cakes <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            }
          />
          <div className="no-scrollbar relative -mx-4 mt-8 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {gallery.cakes.map((img) => (
              <div
                key={img.src}
                className="relative aspect-[3/4] w-48 shrink-0 snap-start overflow-hidden rounded-2xl bg-paper shadow-soft ring-1 ring-line not-has-[img]:hidden sm:w-56"
              >
                <SafeImage src={img.src} alt={img.alt} fill sizes="224px" className="object-cover" />
              </div>
            ))}
          </div>
          <OpenChatButton prompt="I'd like a custom cake designed for a celebration." className="btn btn-primary mt-8 px-6">
            <Sparkles className="size-4.5" aria-hidden="true" />
            Get a cake quote
          </OpenChatButton>
        </div>
      </section>

      {/* Story */}
      <section className="py-14 sm:py-20">
        <div className="container-page grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] bg-sand shadow-lift">
            <Image
              src="/images/scenes/mini-treats.webp"
              alt="A Small Joys mini treats box with brownies, cookies and cake slices"
              fill
              sizes="(min-width: 1024px) 40vw, 92vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="eyebrow">Our story</p>
            <h2 className="mt-2 font-display text-[2.35rem] leading-[1.02] sm:text-5xl">
              Little delights, <span className="text-burgundy italic">packaged with love</span>
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-muted">
              {site.name} is a home bakery and gifting studio by {site.owner}. Every brownie, cookie and cake is baked in small
              batches and finished by hand, so that each box feels wonderfully personal, whether it holds a single tub of tiramisu
              or a hundred festive hampers.
            </p>
            <p className="mt-4 text-[1.02rem] leading-relaxed text-muted">
              We hold that the smallest treats can carry the largest feelings. And so we take great care over the particulars: the
              ribbon, the note card and, above all, the first bite.
            </p>
            <p className="mt-4 text-[1.02rem] leading-relaxed text-muted">
              For those who order, it is seldom really about the treats. It is about wanting someone to know they were remembered,
              and that is a wish we take rather seriously.
            </p>
            <Link href="/about" className="btn btn-outline mt-8 px-6">
              Read our story <ArrowRight className="size-4.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="pb-16 sm:pb-24">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[2rem] bg-burgundy px-6 py-12 text-center text-paper sm:px-12 sm:py-16">
            <div className="paper-grain pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
            <h2 className="relative font-display text-[2.4rem] leading-[1.02] sm:text-6xl">
              Not sure what to gift? <span className="italic text-[#f1d3cd]">Ask Joy.</span>
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-paper/80">
              Tell Joy who it&apos;s for and your budget. You&apos;ll have a gift box ready in a minute, and {site.owner} will
              confirm the rest on WhatsApp.
            </p>
            <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <OpenChatButton className="btn bg-paper px-6 text-burgundy hover:bg-white">
                <Sparkles className="size-4.5" aria-hidden="true" />
                Chat with Joy
              </OpenChatButton>
              <a
                href={whatsappUrl(`Hi ${site.name}! I'd like to place an order.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp px-6"
              >
                <MessageCircle className="size-4.5" aria-hidden="true" />
                WhatsApp {site.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

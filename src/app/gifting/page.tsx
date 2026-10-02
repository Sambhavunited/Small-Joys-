import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { gallery, getProduct, productsIn } from "@/data/menu";
import { site } from "@/data/site";
import { GalleryGrid } from "@/components/gallery-grid";
import { OpenChatButton } from "@/components/open-chat-button";
import { PageHero } from "@/components/page-hero";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { WhatsAppLink } from "@/components/whatsapp-link";

export const metadata: Metadata = {
  title: "Gifting & hampers",
  description: `Festive gift boxes, hampers and corporate gifts from ${site.name}: dry cake hampers, mini treat boxes, cookie tins, printed cookies and brownies with your logo.`,
  alternates: { canonical: "/gifting" },
};

const corporateIds = ["printed-cookies", "printed-brownies", "bag-hamper", "custom-chocolate-bars"];

export default function GiftingPage() {
  const boxes = productsIn("gift-boxes");
  const corporate = corporateIds.map((id) => getProduct(id)).filter((p) => p != null);
  return (
    <>
      <PageHero
        eyebrow="Gifting & hampers"
        title={
          <>
            Gifts that <span className="text-burgundy italic">spread smiles</span>
          </>
        }
        intro={
          <p>
            Ready-to-gift boxes for festivals, birthdays and thank-yous, plus custom hampers and corporate gifts made for your
            people. Every box comes dressed with a ribbon and a personal note.
          </p>
        }
        image="/images/gallery/hamper-ivory-basket.webp"
        imageAlt="Ivory basket hamper with jars, mini cakes and gift boxes"
        actions={
          <>
            <OpenChatButton prompt="Help me put together a gift hamper." className="btn btn-primary px-6">
              <Sparkles className="size-4.5" aria-hidden="true" />
              Build a hamper with Joy
            </OpenChatButton>
            <WhatsAppLink message={`Hi ${site.name}! I'd like to order gift hampers.`} className="px-6">
              Order on WhatsApp
            </WhatsAppLink>
          </>
        }
      />

      <section className="bg-paper py-14 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Festive menu 2026"
            title={
              <>
                Ready-to-gift <span className="italic">boxes</span>
              </>
            }
            intro="Add a few to your gift box. Need them in bulk? Joy can plan quantities and dates with you."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4">
            {boxes.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <div>
            <p className="eyebrow">Corporate gifting</p>
            <h2 className="mt-2 font-display text-[2.35rem] leading-[1.02] sm:text-5xl">
              Thank your team, <span className="text-burgundy italic">sweetly</span>
            </h2>
            <p className="mt-4 text-[1.02rem] leading-relaxed text-muted">
              Cookies and brownies printed with your logo or message, branded chocolate bars and hampers packed to match your
              occasion. Tell us the quantity, budget and date, and {site.owner} will send a personal quote on WhatsApp.
            </p>
            <ol className="mt-6 space-y-4">
              {[
                ["Share the brief", "Quantity, budget per gift, date and any branding."],
                ["Get a quote", `${site.owner} confirms options, pricing and delivery on WhatsApp.`],
                ["We bake and pack", "Every gift is made fresh and packed by hand."],
              ].map(([title, body], i) => (
                <li key={title} className="flex gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-burgundy font-display text-lg text-paper">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block font-bold">{title}</span>
                    <span className="block text-sm text-muted">{body}</span>
                  </span>
                </li>
              ))}
            </ol>
            <OpenChatButton prompt="I need corporate gifts for my team or clients." className="btn btn-primary mt-8 px-6">
              <Sparkles className="size-4.5" aria-hidden="true" />
              Plan a corporate order
            </OpenChatButton>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {corporate.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream-deep/60 py-14 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="From our kitchen"
            title={
              <>
                Hampers we&apos;ve <span className="italic">made with love</span>
              </>
            }
            intro="Every hamper can be customised: tell Joy what you have in mind."
          />
          <GalleryGrid images={[...gallery.hampers, ...gallery.personalised]} className="mt-8" />
        </div>
      </section>
    </>
  );
}

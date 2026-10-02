import type { Metadata } from "next";
import { gallery, getProduct } from "@/data/menu";
import { site } from "@/data/site";
import { CakeBrief } from "@/components/cake-brief";
import { GalleryGrid } from "@/components/gallery-grid";
import { PageHero } from "@/components/page-hero";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { WhatsAppLink } from "@/components/whatsapp-link";

export const metadata: Metadata = {
  title: "Custom cakes",
  description: `Custom celebration and theme cakes by ${site.owner} at ${site.name}. Share your idea, date and guest count for a personal quote on WhatsApp.`,
  alternates: { canonical: "/custom-cakes" },
};

const madeToOrderIds = ["custom-cake", "diy-cupcake-kit", "custom-chocolate-bars", "gift-basket"];

export default function CustomCakesPage() {
  const items = madeToOrderIds.map((id) => getProduct(id)).filter((p) => p != null);
  return (
    <>
      <PageHero
        eyebrow="Custom cakes"
        title={
          <>
            Cakes that tell <span className="text-burgundy italic">your story</span>
          </>
        }
        intro={
          <p>
            From elegant buttercream finishes to playful theme cakes, every custom cake is designed around your celebration. Share
            your idea and get a personal quote from {site.owner} on WhatsApp.
          </p>
        }
        image="/images/gallery/cake-gold-40th.webp"
        imageAlt="White and gold 40th birthday cake with a feather, pearls and roses"
        actions={
          <>
            <a href="#brief" className="btn btn-primary px-6">
              Start a cake brief
            </a>
            <WhatsAppLink message={`Hi ${site.name}! I'd like a quote for a custom cake.`} className="px-6">
              Ask on WhatsApp
            </WhatsAppLink>
          </>
        }
      />

      <section className="bg-paper py-14 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Gallery"
            title={
              <>
                A few of our <span className="italic">favourite cakes</span>
              </>
            }
            intro="Every design is made to order, so yours will be one of a kind."
          />
          <GalleryGrid images={gallery.cakes} className="mt-8" />
        </div>
      </section>

      <section id="brief" className="scroll-mt-24 py-14 sm:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <div>
            <p className="eyebrow">How it works</p>
            <h2 className="mt-2 font-display text-[2.35rem] leading-[1.02] sm:text-5xl">
              Three steps to <span className="text-burgundy italic">your cake</span>
            </h2>
            <ol className="mt-8 space-y-6">
              {[
                ["Share your idea", "Occasion, number of people, flavour, date and any reference picture."],
                ["Get a personal quote", `${site.owner} confirms the design, size and price on WhatsApp.`],
                ["Celebrate", "Your cake is baked fresh for your date, ready for pickup or delivery."],
              ].map(([title, body], i) => (
                <li key={title} className="flex gap-4">
                  <span className="font-display text-4xl leading-none text-olive italic">0{i + 1}</span>
                  <span>
                    <span className="block text-lg font-bold">{title}</span>
                    <span className="block text-muted">{body}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-sm text-muted">Tip: for detailed designs, sharing your date early helps.</p>
          </div>
          <CakeBrief />
        </div>
      </section>

      <section className="bg-cream-deep/60 py-14 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Also made to order"
            title={
              <>
                Personal touches, <span className="italic">priced for you</span>
              </>
            }
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

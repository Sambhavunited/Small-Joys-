import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { cateringMenus, productsIn } from "@/data/menu";
import { site } from "@/data/site";
import { OpenChatButton } from "@/components/open-chat-button";
import { PageHero } from "@/components/page-hero";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { WhatsAppLink } from "@/components/whatsapp-link";

export const metadata: Metadata = {
  title: "Dessert tables & catering",
  description: `Bite-sized dessert table treats priced per piece, plus high-tea and breakfast catering menus from ${site.name} for parties, weddings and events.`,
  alternates: { canonical: "/catering" },
};

export default function CateringPage() {
  const pieces = productsIn("dessert-table");
  return (
    <>
      <PageHero
        eyebrow="Dessert tables & catering"
        title={
          <>
            Sweet tables for <span className="text-burgundy italic">every gathering</span>
          </>
        }
        intro={
          <p>
            Bite-sized macarons, shot glasses, cheesecakes and mini cupcakes for weddings, baby showers, kitty parties and office
            events, plus savoury high-tea and breakfast spreads.
          </p>
        }
        image="/images/products/cupcakes-box-of-12-mini.webp"
        imageAlt="A box of twelve assorted mini cupcakes"
        cutout
        actions={
          <>
            <OpenChatButton prompt="I'm planning an event and need a dessert table." className="btn btn-primary px-6">
              <Sparkles className="size-4.5" aria-hidden="true" />
              Plan my dessert table
            </OpenChatButton>
            <WhatsAppLink message={`Hi ${site.name}! I'd like a quote for a dessert table or catering.`} className="px-6">
              Get a quote on WhatsApp
            </WhatsAppLink>
          </>
        }
      />

      <section className="bg-paper py-14 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Dessert table · priced per piece"
            title={
              <>
                Pick your <span className="italic">sweet bites</span>
              </>
            }
            intro="Add the pieces you like. Most are made in batches of 10 to 12, and Joy can help you work out quantities for your guest count."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 xl:grid-cols-5">
            {pieces.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Catering menus · price on request"
            title={
              <>
                High tea & <span className="text-burgundy italic">breakfast spreads</span>
              </>
            }
            intro="Choose a few favourites from each menu. Prices depend on the selection and number of guests, so we share a quote on WhatsApp."
          />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {cateringMenus.map((m, i) => (
              <div
                key={m.title}
                className={i === 0 ? "rounded-[1.75rem] bg-navy p-7 text-cream" : "rounded-[1.75rem] bg-olive-soft p-7"}
              >
                <h3 className="font-display text-4xl">{m.title}</h3>
                <ul className="mt-5 space-y-3">
                  {m.items.map((item) => (
                    <li key={item} className="flex gap-3 leading-relaxed">
                      <span
                        className={
                          i === 0
                            ? "mt-2.5 size-1.5 shrink-0 rounded-full bg-[#d9c9a8]"
                            : "mt-2.5 size-1.5 shrink-0 rounded-full bg-olive"
                        }
                      />
                      <span className={i === 0 ? "text-cream/85" : "text-ink/85"}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <OpenChatButton prompt="I'd like a quote for high-tea or breakfast catering." className="btn btn-primary px-6">
              <Sparkles className="size-4.5" aria-hidden="true" />
              Ask Joy for a catering quote
            </OpenChatButton>
          </div>
        </div>
      </section>
    </>
  );
}

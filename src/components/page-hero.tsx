import type { ReactNode } from "react";
import { SafeImage } from "@/components/safe-image";

export function PageHero({
  eyebrow,
  title,
  intro,
  image,
  imageAlt,
  actions,
  cutout = false,
}: {
  eyebrow: string;
  title: ReactNode;
  intro: ReactNode;
  image?: string;
  imageAlt?: string;
  actions?: ReactNode;
  /** Transparent product photo: show it whole on a soft background */
  cutout?: boolean;
}) {
  return (
    <section className="container-page grid items-center gap-10 pt-8 pb-12 sm:pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:pb-16">
      <div className="animate-fade-up">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 font-display text-5xl leading-[0.95] sm:text-7xl">{title}</h1>
        <div className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{intro}</div>
        {actions ? <div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
      </div>
      {image ? (
        <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-t-[999px] rounded-b-[2rem] bg-sand shadow-lift not-has-[img]:hidden lg:max-w-md">
          <SafeImage
            src={image}
            alt={imageAlt ?? ""}
            fill
            priority
            sizes="(min-width: 1024px) 38vw, 90vw"
            className={cutout ? "object-contain p-[12%] drop-shadow-[0_20px_24px_rgba(42,36,32,0.2)]" : "object-cover"}
          />
        </div>
      ) : null}
    </section>
  );
}

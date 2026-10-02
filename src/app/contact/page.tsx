import type { Metadata } from "next";
import { MessageCircle, Phone, Sparkles } from "lucide-react";
import { site } from "@/data/site";
import { whatsappUrl } from "@/lib/whatsapp";
import { EnquiryForm } from "@/components/enquiry-form";
import { InstagramIcon } from "@/components/icons";
import { OpenChatButton } from "@/components/open-chat-button";

export const metadata: Metadata = {
  title: "Contact",
  description: `Order from ${site.name} on WhatsApp at ${site.phoneDisplay}, chat with our 24x7 gifting assistant, or send an enquiry.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const cards = [
    {
      icon: MessageCircle,
      title: "WhatsApp",
      body: `The quickest way to order or ask a question. ${site.phoneDisplay}`,
      href: whatsappUrl(`Hi ${site.name}!`),
      cta: "Open WhatsApp",
      external: true,
    },
    { icon: Phone, title: "Call", body: site.phoneDisplay, href: `tel:${site.phoneE164}`, cta: "Call now", external: false },
    {
      icon: InstagramIcon,
      title: "Instagram",
      body: `See our latest bakes at @${site.instagram}`,
      href: site.instagramUrl,
      cta: "Follow us",
      external: true,
    },
  ];
  return (
    <div className="container-page pt-8 pb-20 sm:pt-12">
      <header className="max-w-2xl">
        <p className="eyebrow">Contact</p>
        <h1 className="mt-2 font-display text-5xl leading-[0.95] sm:text-7xl">
          Let&apos;s plan something <span className="text-burgundy italic">sweet</span>
        </h1>
        <p className="mt-4 text-lg text-muted">
          Chat with Joy any time, message {site.owner} on WhatsApp, or send an enquiry below.
        </p>
      </header>

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
        <div className="space-y-4">
          <div className="rounded-[1.5rem] bg-burgundy p-6 text-paper">
            <Sparkles className="size-6 text-[#f1d3cd]" aria-hidden="true" />
            <h2 className="mt-3 font-display text-3xl">Ask Joy, 24x7</h2>
            <p className="mt-1 text-paper/80">
              Our gifting assistant suggests treats, builds your gift box and sends the order to WhatsApp.
            </p>
            <OpenChatButton className="btn mt-5 bg-paper text-burgundy hover:bg-white">Start a chat</OpenChatButton>
          </div>
          {cards.map((c) => (
            <a
              key={c.title}
              href={c.href}
              {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="flex items-center gap-4 rounded-[1.5rem] bg-paper p-5 shadow-soft ring-1 ring-line transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-cream text-burgundy">
                <c.icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{c.title}</span>
                <span className="block text-sm text-muted">{c.body}</span>
              </span>
              <span className="hidden text-sm font-bold text-burgundy sm:block">{c.cta}</span>
            </a>
          ))}
        </div>
        <EnquiryForm />
      </div>
    </div>
  );
}

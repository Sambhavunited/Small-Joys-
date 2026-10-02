import type { Metadata } from "next";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${site.name} uses the details you share on this website.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="container-page max-w-3xl pt-8 pb-20 sm:pt-12">
      <p className="eyebrow">Privacy</p>
      <h1 className="mt-2 font-display text-5xl leading-[0.95] sm:text-6xl">Your details, handled with care</h1>
      <div className="mt-8 space-y-6 text-[1.02rem] leading-relaxed text-ink/85">
        <section>
          <h2 className="font-display text-3xl text-ink">What we collect</h2>
          <p className="mt-2">
            When you chat with Joy, place an order or send an enquiry, we save what you share so {site.owner} can prepare and
            confirm your order: your name, phone number, email, occasion, date, delivery area, gift box, messages and the chat
            conversation.
          </p>
        </section>
        <section>
          <h2 className="font-display text-3xl text-ink">How we use it</h2>
          <p className="mt-2">
            Only to respond to you, confirm and deliver your order, and follow up about it. We don&apos;t sell your details or use
            them for unrelated marketing.
          </p>
        </section>
        <section>
          <h2 className="font-display text-3xl text-ink">Our AI assistant</h2>
          <p className="mt-2">
            Joy is an AI assistant powered by Anthropic&apos;s Claude. Your chat messages are sent to Anthropic to generate
            replies. Joy can make mistakes, so prices, availability and delivery are always confirmed by {site.owner} on WhatsApp.
            Please don&apos;t share payment card details in the chat.
          </p>
        </section>
        <section>
          <h2 className="font-display text-3xl text-ink">WhatsApp</h2>
          <p className="mt-2">
            When you tap a WhatsApp button, your order is typed out in WhatsApp for you to review and send. Conversations on
            WhatsApp are covered by WhatsApp&apos;s own terms and privacy policy.
          </p>
        </section>
        <section>
          <h2 className="font-display text-3xl text-ink">Your choices</h2>
          <p className="mt-2">
            To see, correct or delete the details you&apos;ve shared, message {site.owner} on WhatsApp at {site.phoneDisplay}.
            Your gift box and chat are also stored in your own browser so they&apos;re still there when you come back. Use
            &quot;Start a new chat&quot; in the chat window to clear the conversation on your device.
          </p>
        </section>
        <p className="text-sm text-muted">
          We use privacy-friendly Vercel Web Analytics to count page visits. It doesn&apos;t use cookies.
        </p>
      </div>
    </div>
  );
}

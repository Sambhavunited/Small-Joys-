import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = {
  title: "Your gift box",
  description: "Review your gift box and send your order on WhatsApp.",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="container-page pt-8 pb-20 sm:pt-12">
      <header className="mb-8 max-w-2xl">
        <p className="eyebrow">Checkout</p>
        <h1 className="mt-2 font-display text-5xl leading-[0.95] sm:text-6xl">
          Almost <span className="text-burgundy italic">there</span>
        </h1>
        <p className="mt-3 text-lg text-muted">
          Add your details and we&apos;ll type out your order for WhatsApp. No payment is taken on this website.
        </p>
      </header>
      <CheckoutForm />
    </div>
  );
}

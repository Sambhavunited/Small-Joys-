"use client";

import { useState, type FormEvent } from "react";
import { MessageCircle, Sparkles } from "lucide-react";
import { site } from "@/data/site";
import { formatDate } from "@/lib/format";
import { chatStore } from "@/lib/client/chat-store";
import { whatsappUrl } from "@/lib/whatsapp";

export function CakeBrief() {
  const [occasion, setOccasion] = useState("");
  const [guests, setGuests] = useState("");
  const [date, setDate] = useState("");
  const [flavour, setFlavour] = useState("");
  const [theme, setTheme] = useState("");

  const brief = () => {
    const parts = [
      "I'd like a custom cake.",
      occasion && `Occasion: ${occasion}.`,
      guests && `Servings: about ${guests} people.`,
      date && `Needed on ${formatDate(date)}.`,
      flavour && `Flavour: ${flavour}.`,
      theme && `Theme or design: ${theme}.`,
    ];
    return parts.filter(Boolean).join(" ");
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    chatStore.open(brief());
  };

  return (
    <form onSubmit={onSubmit} className="rounded-[1.75rem] bg-paper p-5 shadow-soft ring-1 ring-line sm:p-7">
      <h3 className="font-display text-3xl leading-tight">Start your cake brief</h3>
      <p className="mt-1 text-sm text-muted">Fill in what you know. Joy will ask about the rest and get you a quote.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="cb-occasion">
            Occasion
          </label>
          <input
            id="cb-occasion"
            className="field"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            placeholder="e.g. 40th birthday"
            maxLength={80}
          />
        </div>
        <div>
          <label className="label" htmlFor="cb-guests">
            Number of people
          </label>
          <input
            id="cb-guests"
            className="field"
            inputMode="numeric"
            value={guests}
            onChange={(e) => setGuests(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="e.g. 20"
          />
        </div>
        <div>
          <label className="label" htmlFor="cb-date">
            Date needed
          </label>
          <input id="cb-date" type="date" className="field" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="cb-flavour">
            Flavour
          </label>
          <input
            id="cb-flavour"
            className="field"
            value={flavour}
            onChange={(e) => setFlavour(e.target.value)}
            placeholder="e.g. Chocolate truffle"
            maxLength={80}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="cb-theme">
            Theme, colours or design idea
          </label>
          <textarea
            id="cb-theme"
            className="field min-h-24"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="e.g. white and gold with fresh roses, or a LEGO theme for a 6 year old"
            maxLength={500}
          />
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button type="submit" className="btn btn-primary px-6">
          <Sparkles className="size-4.5" aria-hidden="true" />
          Get a quote with Joy
        </button>
        <a
          href={whatsappUrl(`Hi ${site.name}! ${brief()}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-whatsapp px-6"
        >
          <MessageCircle className="size-4.5" aria-hidden="true" />
          Send on WhatsApp
        </a>
      </div>
    </form>
  );
}

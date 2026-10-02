"use client";

import { useState, type FormEvent } from "react";
import { CircleCheck, LoaderCircle, MessageCircle, Send } from "lucide-react";
import { site } from "@/data/site";

type Errors = Partial<Record<"name" | "phone" | "message" | "form", string>>;

export function EnquiryForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    occasion: "",
    eventDate: "",
    guests: "",
    message: "",
    website: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (busy) return;
    const found: Errors = {};
    if (!form.name.trim()) found.name = "Please enter your name.";
    const digits = form.phone.replace(/\D/g, "");
    if (!form.email.trim() && (digits.length < 10 || digits.length > 15))
      found.phone = "Please share a mobile number or email so we can reply.";
    if (!form.message.trim()) found.message = "Tell us a little about what you'd like.";
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        whatsappUrl?: string;
        error?: string;
        errors?: Errors;
      };
      if (!res.ok || !data.ok) {
        setErrors({ ...(data.errors ?? {}), form: data.error ?? "Something went wrong. Please try again." });
        return;
      }
      setSent(data.whatsappUrl ?? null);
    } catch {
      setErrors({ form: `We couldn't reach the server. Please message ${site.owner} on WhatsApp at ${site.phoneDisplay}.` });
    } finally {
      setBusy(false);
    }
  };

  if (sent !== null) {
    return (
      <div className="animate-pop rounded-[1.75rem] bg-paper p-7 text-center shadow-soft ring-1 ring-line">
        <CircleCheck className="mx-auto size-12 text-whatsapp" strokeWidth={1.5} aria-hidden="true" />
        <h2 className="mt-3 font-display text-4xl">Thank you!</h2>
        <p className="mt-2 text-muted">Your message is with {site.owner}. For the quickest reply, continue on WhatsApp.</p>
        {sent ? (
          <a href={sent} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp mt-6 px-6">
            <MessageCircle className="size-4.5" aria-hidden="true" />
            Continue on WhatsApp
          </a>
        ) : null}
      </div>
    );
  }

  const inv = (k: keyof Errors) => (errors[k] ? { "aria-invalid": true as const, "aria-describedby": `enq-${k}-error` } : {});
  const err = (k: keyof Errors) =>
    errors[k] ? (
      <p id={`enq-${k}-error`} className="mt-1.5 text-sm font-semibold text-[#b42318]">
        {errors[k]}
      </p>
    ) : null;

  return (
    <form onSubmit={onSubmit} noValidate className="relative rounded-[1.75rem] bg-paper p-5 shadow-soft ring-1 ring-line sm:p-7">
      <h2 className="font-display text-3xl">Send us a message</h2>
      <p className="mt-1 text-sm text-muted">For orders, events and corporate gifting. We usually reply on WhatsApp.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="enq-name">
            Name
          </label>
          <input
            id="enq-name"
            className="field"
            autoComplete="name"
            value={form.name}
            onChange={set("name")}
            maxLength={80}
            {...inv("name")}
          />
          {err("name")}
        </div>
        <div>
          <label className="label" htmlFor="enq-phone">
            WhatsApp number
          </label>
          <input
            id="enq-phone"
            className="field"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={set("phone")}
            maxLength={20}
            {...inv("phone")}
          />
          {err("phone")}
        </div>
        <div>
          <label className="label" htmlFor="enq-email">
            Email <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="enq-email"
            className="field"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={set("email")}
            maxLength={120}
          />
        </div>
        <div>
          <label className="label" htmlFor="enq-occasion">
            Occasion <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="enq-occasion"
            className="field"
            value={form.occasion}
            onChange={set("occasion")}
            maxLength={80}
            placeholder="e.g. Wedding favours"
          />
        </div>
        <div>
          <label className="label" htmlFor="enq-date">
            Date <span className="font-normal text-muted">(optional)</span>
          </label>
          <input id="enq-date" className="field" type="date" value={form.eventDate} onChange={set("eventDate")} />
        </div>
        <div>
          <label className="label" htmlFor="enq-guests">
            Guests or quantity <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="enq-guests"
            className="field"
            inputMode="numeric"
            value={form.guests}
            onChange={(e) => setForm((f) => ({ ...f, guests: e.target.value.replace(/\D/g, "").slice(0, 5) }))}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="enq-message">
            Message
          </label>
          <textarea
            id="enq-message"
            className="field min-h-28"
            value={form.message}
            onChange={set("message")}
            maxLength={1000}
            {...inv("message")}
          />
          {err("message")}
        </div>
      </div>
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="enq-website">Website</label>
        <input id="enq-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
      </div>
      {errors.form ? (
        <p role="alert" className="mt-4 rounded-2xl bg-rose p-4 text-sm font-semibold text-burgundy-deep">
          {errors.form}
        </p>
      ) : null}
      <button type="submit" disabled={busy} className="btn btn-primary mt-6 px-6">
        {busy ? (
          <LoaderCircle className="size-4.5 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="size-4.5" aria-hidden="true" />
        )}
        {busy ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

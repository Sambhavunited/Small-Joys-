"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import Link from "next/link";
import clsx from "clsx";
import { CircleCheck, LoaderCircle, MessageCircle, Minus, Plus, ShoppingBag, Store, Truck } from "lucide-react";
import { getProduct } from "@/data/menu";
import { site } from "@/data/site";
import { lineKey } from "@/lib/cart";
import { displayPhone, formatINR, todayIST } from "@/lib/format";
import { cartStore, useCart } from "@/lib/client/cart-store";
import { chatStore } from "@/lib/client/chat-store";
import { ProductImage } from "@/components/product-image";

const subscribeNoop = () => () => {};
function useHydrated() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

type Errors = Partial<Record<"name" | "phone" | "email" | "eventDate" | "fulfilment" | "area" | "cart" | "form", string>>;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm font-semibold text-[#b42318]">
      {message}
    </p>
  );
}

function OrderSummary() {
  const { priced } = useCart();
  return (
    <div className="rounded-[1.75rem] bg-paper p-5 shadow-soft ring-1 ring-line sm:p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-3xl">Your gift box</h2>
        <span className="text-sm text-muted">
          {priced.itemCount} item{priced.itemCount === 1 ? "" : "s"}
        </span>
      </div>
      {priced.lines.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-cream p-5 text-center">
          <ShoppingBag className="mx-auto size-7 text-burgundy" aria-hidden="true" />
          <p className="mt-2 font-bold">Your gift box is empty</p>
          <p className="mt-1 text-sm text-muted">
            Add treats from the{" "}
            <Link href="/menu" className="font-bold text-burgundy underline underline-offset-2">
              menu
            </Link>
            , or describe a custom order below.
          </p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-line">
          {priced.lines.map((line) => {
            const product = getProduct(line.productId);
            if (!product) return null;
            const min = product.minQty ?? 1;
            return (
              <li key={lineKey(line)} className="flex gap-3 py-3">
                <ProductImage product={product} sizes="64px" className="size-16 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="leading-snug font-bold">{product.name}</p>
                  {line.option ? <p className="text-sm text-muted">{line.option}</p> : null}
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 rounded-full bg-cream p-0.5 ring-1 ring-line">
                      <button
                        type="button"
                        className="flex size-7 items-center justify-center rounded-full hover:bg-paper"
                        onClick={() => cartStore.setQuantity(line, line.quantity <= min ? 0 : line.quantity - 1)}
                        aria-label={`One fewer ${product.name}`}
                      >
                        <Minus className="size-3.5" aria-hidden="true" />
                      </button>
                      <span className="min-w-6 text-center text-sm font-bold">{line.quantity}</span>
                      <button
                        type="button"
                        className="flex size-7 items-center justify-center rounded-full hover:bg-paper"
                        onClick={() => cartStore.setQuantity(line, line.quantity + 1)}
                        aria-label={`One more ${product.name}`}
                      >
                        <Plus className="size-3.5" aria-hidden="true" />
                      </button>
                    </div>
                    <span className="text-sm font-bold">
                      {line.lineTotal == null ? "On WhatsApp" : formatINR(line.lineTotal)}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <div className="mt-4 border-t border-line pt-4">
        <div className="flex items-baseline justify-between">
          <span className="font-semibold">Estimated total</span>
          <span className="font-display text-3xl text-burgundy">{formatINR(priced.subtotal)}</span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted">
          {priced.hasUnpriced ? "Some items are priced on WhatsApp. " : ""}
          Delivery charges, final price and payment are confirmed with you on WhatsApp before anything is baked.
        </p>
      </div>
    </div>
  );
}

function Success({ orderId, url }: { orderId: string; url: string }) {
  return (
    <div className="mx-auto max-w-xl animate-pop rounded-[2rem] bg-paper p-7 text-center shadow-lift ring-1 ring-line sm:p-10">
      <CircleCheck className="mx-auto size-14 text-whatsapp" strokeWidth={1.5} aria-hidden="true" />
      <p className="mt-4 eyebrow">Order {orderId}</p>
      <h2 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">One last tap</h2>
      <p className="mt-3 text-muted">
        Your order is saved. Send it to {site.owner} on WhatsApp to confirm the final price, delivery and payment. Your order
        details are already typed out.
      </p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp mt-7 w-full px-6 py-4 text-base">
        <MessageCircle className="size-5" aria-hidden="true" />
        Send order on WhatsApp
      </a>
      <p className="mt-4 text-sm text-muted">
        WhatsApp didn&apos;t open? Message {site.phoneDisplay} with your order reference {orderId}.
      </p>
      <Link href="/menu" className="mt-6 inline-block text-sm font-bold text-burgundy underline underline-offset-4">
        Back to the menu
      </Link>
    </div>
  );
}

function Form() {
  const { lines, priced } = useCart();
  const saved = chatStore.state.lead.details;
  const [name, setName] = useState(saved.name ?? "");
  const [phone, setPhone] = useState(saved.phone ? displayPhone(saved.phone) : "");
  const [email, setEmail] = useState(saved.email ?? "");
  const [occasion, setOccasion] = useState(saved.occasion ?? "");
  const [eventDate, setEventDate] = useState(saved.eventDate && saved.eventDate >= todayIST() ? saved.eventDate : "");
  const [fulfilment, setFulfilment] = useState<"delivery" | "pickup" | "">(saved.fulfilment ?? "");
  const [area, setArea] = useState(saved.area ?? "");
  const [giftMessage, setGiftMessage] = useState(saved.giftMessage ?? "");
  const [customRequest, setCustomRequest] = useState(saved.customRequest ?? "");
  const [notes, setNotes] = useState(saved.notes ?? "");
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ orderId: string; url: string } | null>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (dateRef.current) dateRef.current.min = todayIST();
  }, []);

  if (done) return <Success orderId={done.orderId} url={done.url} />;

  const validate = (): Errors => {
    const e: Errors = {};
    if (!name.trim()) e.name = "Please enter your name.";
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) e.phone = "Please enter a valid mobile number.";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "That email doesn't look right.";
    if (!eventDate) e.eventDate = "Choose the date you need it.";
    else if (eventDate < todayIST()) e.eventDate = "Please choose today or a later date.";
    if (!fulfilment) e.fulfilment = "Choose delivery or pickup.";
    if (fulfilment === "delivery" && !area.trim()) e.area = "Please enter your delivery area.";
    if (!priced.lines.length && !customRequest.trim()) e.cart = "Add something to your gift box, or describe what you'd like.";
    return e;
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (busy) return;
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    setBusy(true);
    try {
      const chat = chatStore.state;
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: chat.sessionId,
          orderId: chat.lead.orderId,
          website,
          cart: lines,
          details: {
            name,
            phone,
            email,
            occasion,
            eventDate,
            fulfilment,
            area: fulfilment === "delivery" ? area : "",
            giftMessage,
            customRequest,
            notes,
          },
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        orderId?: string;
        whatsappUrl?: string;
        error?: string;
        errors?: Errors;
      };
      if (!res.ok || !data.ok || !data.whatsappUrl || !data.orderId) {
        setErrors({ ...(data.errors ?? {}), form: data.error ?? "Something went wrong. Please try again." });
        return;
      }
      setDone({ orderId: data.orderId, url: data.whatsappUrl });
      cartStore.clear();
      chatStore.reset();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErrors({
        form: `We couldn't reach the server. Check your connection, or message ${site.owner} on WhatsApp at ${site.phoneDisplay}.`,
      });
    } finally {
      setBusy(false);
    }
  };

  const err = (k: keyof Errors) => (errors[k] ? { "aria-invalid": true as const, "aria-describedby": `${k}-error` } : {});

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
      <form ref={formRef} onSubmit={onSubmit} noValidate className="relative order-2 min-w-0 space-y-8 lg:order-1">
        <fieldset className="min-w-0 space-y-4">
          <legend className="font-display text-3xl">Your details</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="co-name">
                Name
              </label>
              <input
                id="co-name"
                className="field"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                {...err("name")}
              />
              <FieldError id="name-error" message={errors.name} />
            </div>
            <div>
              <label className="label" htmlFor="co-phone">
                WhatsApp number
              </label>
              <input
                id="co-phone"
                className="field"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={20}
                {...err("phone")}
              />
              <FieldError id="phone-error" message={errors.phone} />
            </div>
            <div>
              <label className="label" htmlFor="co-email">
                Email <span className="font-normal text-muted">(optional)</span>
              </label>
              <input
                id="co-email"
                className="field"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={120}
                {...err("email")}
              />
              <FieldError id="email-error" message={errors.email} />
            </div>
            <div>
              <label className="label" htmlFor="co-occasion">
                Occasion <span className="font-normal text-muted">(optional)</span>
              </label>
              <input
                id="co-occasion"
                className="field"
                placeholder="e.g. Diwali, birthday"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                maxLength={80}
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="min-w-0 space-y-4">
          <legend className="font-display text-3xl">When and where</legend>
          <div className="sm:max-w-xs">
            <label className="label" htmlFor="co-date">
              Date needed
            </label>
            <input
              ref={dateRef}
              id="co-date"
              type="date"
              className="field"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              {...err("eventDate")}
            />
            <FieldError id="eventDate-error" message={errors.eventDate} />
          </div>
          <div
            role="radiogroup"
            aria-label="Delivery or pickup"
            aria-describedby={errors.fulfilment ? "fulfilment-error" : undefined}
            className="grid gap-3 sm:grid-cols-2"
          >
            {(
              [
                { value: "delivery", label: "Delivery", hint: "Charges confirmed on WhatsApp", icon: Truck },
                { value: "pickup", label: "Pickup", hint: "Pickup details shared on WhatsApp", icon: Store },
              ] as const
            ).map((o) => (
              <label
                key={o.value}
                className={clsx(
                  "flex cursor-pointer items-center gap-3 rounded-2xl border-[1.5px] bg-paper p-4 transition",
                  fulfilment === o.value ? "border-burgundy ring-2 ring-burgundy/15" : "border-line hover:border-ink/30",
                )}
              >
                <input
                  type="radio"
                  name="fulfilment"
                  value={o.value}
                  checked={fulfilment === o.value}
                  onChange={() => setFulfilment(o.value)}
                  className="size-4 accent-burgundy"
                  {...(errors.fulfilment ? { "aria-invalid": true } : {})}
                />
                <o.icon className="size-5 text-olive-deep" aria-hidden="true" />
                <span>
                  <span className="block font-bold">{o.label}</span>
                  <span className="block text-xs text-muted">{o.hint}</span>
                </span>
              </label>
            ))}
          </div>
          <FieldError id="fulfilment-error" message={errors.fulfilment} />
          {fulfilment === "delivery" ? (
            <div>
              <label className="label" htmlFor="co-area">
                Delivery area or address
              </label>
              <textarea
                id="co-area"
                className="field min-h-20"
                autoComplete="street-address"
                placeholder="Area, landmark and city"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                maxLength={160}
                {...err("area")}
              />
              <FieldError id="area-error" message={errors.area} />
            </div>
          ) : null}
        </fieldset>

        <fieldset className="min-w-0 space-y-4">
          <legend className="font-display text-3xl">Little touches</legend>
          <div>
            <label className="label" htmlFor="co-gift">
              Gift message <span className="font-normal text-muted">(for the note card)</span>
            </label>
            <textarea
              id="co-gift"
              className="field min-h-20"
              placeholder="Happy Diwali! Love, the Sharmas"
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value)}
              maxLength={300}
            />
          </div>
          <div>
            <label className="label" htmlFor="co-custom">
              {priced.lines.length ? "Anything custom?" : "What would you like?"}{" "}
              {priced.lines.length ? <span className="font-normal text-muted">(optional)</span> : null}
            </label>
            <textarea
              id="co-custom"
              className="field min-h-20"
              placeholder="e.g. a chocolate cake for 20 people with a gold theme, or 25 hampers for my team"
              value={customRequest}
              onChange={(e) => setCustomRequest(e.target.value)}
              maxLength={1000}
              {...err("cart")}
            />
            <FieldError id="cart-error" message={errors.cart} />
          </div>
          <div>
            <label className="label" htmlFor="co-notes">
              Notes <span className="font-normal text-muted">(allergies, timing, anything else)</span>
            </label>
            <textarea
              id="co-notes"
              className="field min-h-20"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={600}
            />
          </div>
        </fieldset>

        {/* Hidden from people; bots tend to fill it in. */}
        <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
          <label htmlFor="co-website">Website</label>
          <input id="co-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>

        {errors.form ? (
          <p role="alert" className="rounded-2xl bg-rose p-4 text-sm font-semibold text-burgundy-deep">
            {errors.form}
          </p>
        ) : null}

        <div>
          <button type="submit" disabled={busy} className="btn btn-primary w-full py-4 text-base sm:w-auto sm:px-10">
            {busy ? (
              <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <MessageCircle className="size-5" aria-hidden="true" />
            )}
            {busy ? "Saving your order…" : "Place order and continue on WhatsApp"}
          </button>
          <p className="mt-3 text-sm text-muted">
            Nothing is charged here. {site.owner} confirms availability, the final price, delivery and payment with you on
            WhatsApp.
          </p>
        </div>
      </form>

      <div className="order-1 lg:sticky lg:top-28 lg:order-2">
        <OrderSummary />
      </div>
    </div>
  );
}

export function CheckoutForm() {
  const hydrated = useHydrated();
  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted">
        <LoaderCircle className="size-6 animate-spin" aria-hidden="true" />
        <span className="sr-only">Loading your gift box</span>
      </div>
    );
  }
  return <Form />;
}

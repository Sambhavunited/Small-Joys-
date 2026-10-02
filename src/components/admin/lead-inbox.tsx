"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  ArrowLeft,
  Bot,
  CalendarDays,
  ChevronDown,
  CircleAlert,
  Download,
  Inbox,
  LoaderCircle,
  LogOut,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
} from "lucide-react";
import { getProduct } from "@/data/menu";
import { describeLine, priceCart } from "@/lib/cart";
import { displayPhone, formatDate, formatDateTime, formatINR, todayIST } from "@/lib/format";
import { statusLabel, tierLabel, type Lead, type LeadStatus, type LeadTier } from "@/lib/leads";
import { customerFollowUpMessage, whatsappUrl } from "@/lib/whatsapp";

export type InboxSetup = {
  aiEnabled: boolean;
  storage: "blob" | "memory";
  email: boolean;
  push: boolean;
};

const tierStyle: Record<LeadTier, string> = {
  confirmed: "bg-whatsapp text-white",
  hot: "bg-burgundy text-paper",
  warm: "bg-gold/25 text-[#6b4f12]",
  cold: "bg-navy-soft text-navy",
};

const tierRank: Record<LeadTier, number> = { confirmed: 0, hot: 1, warm: 2, cold: 3 };
const STATUSES: LeadStatus[] = ["new", "contacted", "won", "lost"];

function TierBadge({ tier }: { tier: LeadTier }) {
  return (
    <span className={clsx("rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold tracking-wide uppercase", tierStyle[tier])}>
      {tierLabel[tier]}
    </span>
  );
}

function daysFromToday(iso?: string) {
  if (!iso) return null;
  const a = new Date(`${todayIST()}T00:00:00Z`).getTime();
  const b = new Date(`${iso}T00:00:00Z`).getTime();
  if (Number.isNaN(b)) return null;
  return Math.round((b - a) / 86_400_000);
}

function whenLabel(iso?: string) {
  const d = daysFromToday(iso);
  if (d == null) return "";
  if (d < 0) return `${formatDate(iso)} (passed)`;
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  return `${formatDate(iso)} · in ${d} days`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return formatDateTime(iso);
}

function LeadRow({ lead, active, onClick }: { lead: Lead; active: boolean; onClick: () => void }) {
  const d = lead.details;
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "w-full rounded-2xl p-4 text-left ring-1 transition",
        active ? "bg-paper shadow-lift ring-burgundy/40" : "bg-paper/80 ring-line hover:bg-paper hover:shadow-soft",
        lead.status === "lost" && "opacity-60",
      )}
    >
      <div className="flex items-center gap-2">
        <TierBadge tier={lead.tier} />
        {lead.status !== "new" ? (
          <span className="rounded-full bg-cream px-2 py-0.5 text-[0.7rem] font-bold text-muted uppercase">
            {statusLabel[lead.status]}
          </span>
        ) : (
          <span className="size-2 rounded-full bg-burgundy" aria-label="New" />
        )}
        <span className="ml-auto text-xs text-muted">{timeAgo(lead.updatedAt)}</span>
      </div>
      <p className="mt-2 font-bold">
        {d.name || "Visitor"}
        {d.phone ? <span className="font-medium text-muted"> · {displayPhone(d.phone)}</span> : null}
      </p>
      {lead.summary ? <p className="mt-0.5 line-clamp-2 text-sm text-ink/80">{lead.summary}</p> : null}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
        {d.eventDate ? (
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            {whenLabel(d.eventDate)}
          </span>
        ) : null}
        {lead.estimatedValue ? <span>{formatINR(lead.estimatedValue)}</span> : null}
        {lead.orderId ? <span>{lead.orderId}</span> : null}
        <span className="capitalize">{lead.source}</span>
      </div>
    </button>
  );
}

function LeadDetail({ lead, onBack, onSaved }: { lead: Lead; onBack: () => void; onSaved: (lead: Lead) => void }) {
  const d = lead.details;
  const priced = priceCart(lead.cart);
  const [notes, setNotes] = useState(lead.adminNotes ?? "");
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showChat, setShowChat] = useState(false);

  const patch = async (body: { status?: LeadStatus; adminNotes?: string }, label: string) => {
    setSaving(label);
    setError("");
    try {
      const res = await fetch(`/api/admin/leads/${encodeURIComponent(lead.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { lead?: Lead; error?: string };
      if (!res.ok || !data.lead) throw new Error(data.error ?? "Couldn't save");
      onSaved(data.lead);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save");
    } finally {
      setSaving(null);
    }
  };

  const rows: [string, string | undefined][] = [
    ["Phone", d.phone ? displayPhone(d.phone) : undefined],
    ["Email", d.email],
    ["Occasion", d.occasion],
    ["Needed on", d.eventDate ? whenLabel(d.eventDate) : undefined],
    [
      d.fulfilment === "pickup" ? "Pickup" : "Delivery",
      d.fulfilment ? d.area || (d.fulfilment === "pickup" ? "Pickup" : "Area not given") : d.area,
    ],
    ["Guests", d.guests ? String(d.guests) : undefined],
    ["Budget", d.budget],
    ["Order ref", lead.orderId],
    ["Source", `${lead.source}${lead.page ? ` · ${lead.page}` : ""}`],
    ["First seen", formatDateTime(lead.createdAt)],
    ["Order sent", lead.handoffAt ? formatDateTime(lead.handoffAt) : undefined],
  ];

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 self-start text-sm font-bold text-burgundy lg:hidden"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> All leads
      </button>

      <div className="rounded-[1.5rem] bg-paper p-5 shadow-soft ring-1 ring-line sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <TierBadge tier={lead.tier} />
          <span className="text-xs font-bold text-muted">Score {lead.score}</span>
        </div>
        <h2 className="mt-2 font-display text-4xl leading-tight">{d.name || "Visitor"}</h2>
        {lead.summary ? <p className="mt-1 text-ink/80">{lead.summary}</p> : null}
        {lead.reasons.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {lead.reasons.map((r) => (
              <span key={r} className="rounded-full bg-cream px-2.5 py-1 text-xs font-semibold text-ink/80">
                {r}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2">
          {d.phone ? (
            <>
              <a
                href={whatsappUrl(customerFollowUpMessage(d.name), d.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-sm"
              >
                <MessageCircle className="size-4" aria-hidden="true" /> WhatsApp
              </a>
              <a href={`tel:+${d.phone}`} className="btn btn-outline btn-sm">
                <Phone className="size-4" aria-hidden="true" /> Call
              </a>
            </>
          ) : null}
          {d.email ? (
            <a href={`mailto:${d.email}`} className="btn btn-outline btn-sm">
              <Mail className="size-4" aria-hidden="true" /> Email
            </a>
          ) : null}
          {!d.phone && !d.email ? (
            <p className="text-sm text-muted">No contact details shared yet. Check the conversation below.</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-[1.5rem] bg-paper p-5 shadow-soft ring-1 ring-line sm:p-6">
        <p className="text-sm font-bold">Status</p>
        <div className="mt-2 grid grid-cols-4 gap-1 rounded-full bg-cream p-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              disabled={saving != null}
              onClick={() => s !== lead.status && patch({ status: s }, "status")}
              className={clsx(
                "rounded-full px-2 py-2 text-sm font-bold transition",
                lead.status === s ? "bg-ink text-paper shadow-soft" : "text-muted hover:text-ink",
              )}
            >
              {statusLabel[s]}
            </button>
          ))}
        </div>
        <label htmlFor="admin-notes" className="mt-5 block text-sm font-bold">
          Your notes
        </label>
        <textarea
          id="admin-notes"
          className="field mt-2 min-h-24 text-sm"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Quoted ₹4,500 incl. delivery, waiting for confirmation"
          maxLength={2000}
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={saving != null || notes === (lead.adminNotes ?? "")}
            onClick={() => patch({ adminNotes: notes }, "notes")}
          >
            {saving === "notes" ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
            Save notes
          </button>
          {saving === "status" ? <LoaderCircle className="size-4 animate-spin text-muted" aria-hidden="true" /> : null}
          {error ? <p className="text-sm font-semibold text-[#b42318]">{error}</p> : null}
        </div>
      </div>

      <div className="rounded-[1.5rem] bg-paper p-5 shadow-soft ring-1 ring-line sm:p-6">
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          {rows
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs font-bold tracking-wide text-muted uppercase">{k}</dt>
                <dd className="mt-0.5 break-words">{v}</dd>
              </div>
            ))}
        </dl>
        {priced.lines.length ? (
          <div className="mt-5 border-t border-line pt-4">
            <p className="flex items-center gap-2 text-sm font-bold">
              <ShoppingBag className="size-4" aria-hidden="true" /> Gift box
            </p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {priced.lines.map((l) => (
                <li key={`${l.productId}-${l.option ?? ""}`} className="flex justify-between gap-3">
                  <span>
                    {describeLine(l)}
                    {l.note ? <span className="text-muted"> ({l.note})</span> : null}
                    {!getProduct(l.productId) ? <span className="text-muted"> (no longer on menu)</span> : null}
                  </span>
                  <span className="shrink-0 font-semibold">{l.lineTotal == null ? "Quote" : formatINR(l.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 flex justify-between border-t border-dashed border-line pt-2 text-sm font-bold">
              <span>Estimated</span>
              <span>
                {formatINR(priced.subtotal)}
                {priced.hasUnpriced ? " + quote" : ""}
              </span>
            </p>
          </div>
        ) : null}
        {[
          ["Custom request", d.customRequest],
          ["Gift message", d.giftMessage],
          ["Customer notes", d.notes],
        ].map(([k, v]) =>
          v ? (
            <div key={k} className="mt-4 border-t border-line pt-4 text-sm">
              <p className="font-bold">{k}</p>
              <p className="mt-1 whitespace-pre-wrap text-ink/85">{v}</p>
            </div>
          ) : null,
        )}
      </div>

      {lead.transcript?.length ? (
        <div className="rounded-[1.5rem] bg-paper p-5 shadow-soft ring-1 ring-line sm:p-6">
          <button
            type="button"
            onClick={() => setShowChat((v) => !v)}
            className="flex w-full items-center justify-between text-left text-sm font-bold"
          >
            <span className="inline-flex items-center gap-2">
              <Bot className="size-4" aria-hidden="true" /> Conversation with Joy ({lead.transcript.length} messages)
            </span>
            <ChevronDown className={clsx("size-4 transition", showChat && "rotate-180")} aria-hidden="true" />
          </button>
          {showChat ? (
            <div className="mt-4 flex flex-col gap-2.5">
              {lead.transcript.map((t, i) => (
                <div
                  key={i}
                  className={clsx(
                    "max-w-[88%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap",
                    t.role === "user" ? "self-end bg-burgundy text-paper" : "self-start bg-cream text-ink",
                  )}
                >
                  {t.text}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SetupPanel({ setup }: { setup: InboxSetup }) {
  const items = [
    {
      ok: setup.aiEnabled,
      label: setup.aiEnabled ? "AI assistant is on" : "AI assistant is in guided mode",
      hint: setup.aiEnabled ? "Joy replies with Claude." : "Add ANTHROPIC_API_KEY in Vercel to switch on full AI replies.",
    },
    {
      ok: setup.storage === "blob",
      label: setup.storage === "blob" ? "Leads are saved permanently" : "Leads are only kept temporarily",
      hint:
        setup.storage === "blob" ? "Stored privately in Vercel Blob." : "Connect a Vercel Blob store so leads are never lost.",
    },
    {
      ok: setup.email || setup.push,
      label:
        setup.email || setup.push
          ? `Instant alerts on (${[setup.email && "email", setup.push && "phone"].filter(Boolean).join(" + ")})`
          : "Instant alerts are off",
      hint:
        setup.email || setup.push
          ? "You'll hear about hot and confirmed leads right away."
          : "Add RESEND_API_KEY + ALERT_EMAIL_TO, or NTFY_TOPIC, for instant alerts.",
    },
  ];
  if (items.every((i) => i.ok)) return null;
  return (
    <div className="rounded-[1.5rem] bg-paper p-4 ring-1 ring-line">
      <ul className="grid gap-3 sm:grid-cols-3">
        {items.map((i) => (
          <li key={i.label} className="flex gap-2.5 text-sm">
            <span
              className={clsx("mt-1.5 size-2.5 shrink-0 rounded-full", i.ok ? "bg-whatsapp" : "bg-gold")}
              aria-hidden="true"
            />
            <span>
              <span className="block font-bold">{i.label}</span>
              <span className="block text-xs text-muted">{i.hint}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type LeadsResult = { leads?: Lead[]; error?: string; unauthorized?: boolean };

async function requestLeads(): Promise<LeadsResult> {
  try {
    const res = await fetch("/api/admin/leads", { cache: "no-store" });
    if (res.status === 401) return { unauthorized: true };
    const data = (await res.json().catch(() => ({}))) as { leads?: Lead[]; error?: string };
    if (!res.ok || !data.leads) return { error: data.error ?? "Couldn't load leads" };
    return { leads: data.leads };
  } catch {
    return { error: "Couldn't reach the server. Check your connection." };
  }
}

type TierFilter = LeadTier | "all";
type StatusFilter = "open" | "all" | LeadStatus;

export function LeadInbox({ setup }: { setup: InboxSetup }) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadedAt, setLoadedAt] = useState<number | null>(null);
  const [tier, setTier] = useState<TierFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("open");
  const [sort, setSort] = useState<"newest" | "priority">("priority");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const lastLoad = useRef(0);

  const apply = useCallback(
    (r: LeadsResult) => {
      setLoading(false);
      if (r.unauthorized) {
        router.refresh();
        return;
      }
      if (r.leads) {
        setLeads(r.leads);
        setLoadedAt(Date.now());
        setError("");
      } else {
        setError(r.error ?? "Couldn't load leads");
      }
    },
    [router],
  );

  const refresh = () => {
    setLoading(true);
    lastLoad.current = Date.now();
    void requestLeads().then(apply);
  };

  useEffect(() => {
    let active = true;
    const run = () => {
      lastLoad.current = Date.now();
      void requestLeads().then((r) => active && apply(r));
    };
    run();
    // Refresh when you come back to the tab (at most once a minute, to stay within storage limits).
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - lastLoad.current > 60_000) run();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [apply]);

  const counts = useMemo(() => {
    const c: Record<LeadTier, number> = { confirmed: 0, hot: 0, warm: 0, cold: 0 };
    for (const l of leads ?? []) if (l.status !== "lost" && l.status !== "won") c[l.tier]++;
    return c;
  }, [leads]);

  const pipeline = useMemo(
    () =>
      (leads ?? [])
        .filter((l) => (l.tier === "confirmed" || l.tier === "hot") && (l.status === "new" || l.status === "contacted"))
        .reduce((sum, l) => sum + (l.estimatedValue ?? 0), 0),
    [leads],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = (leads ?? []).filter((l) => {
      if (tier !== "all" && l.tier !== tier) return false;
      if (status === "open" && (l.status === "won" || l.status === "lost")) return false;
      if (status !== "open" && status !== "all" && l.status !== status) return false;
      if (q) {
        const hay = [l.details.name, l.details.phone, l.details.email, l.details.occasion, l.summary, l.orderId, l.details.area]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (sort === "priority") {
      list.sort((a, b) => tierRank[a.tier] - tierRank[b.tier] || b.score - a.score || b.updatedAt.localeCompare(a.updatedAt));
    }
    return list;
  }, [leads, tier, status, query, sort]);

  const selected = (leads ?? []).find((l) => l.id === selectedId) ?? null;

  const signOut = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Small Joys team</p>
          <h1 className="mt-1 font-display text-5xl leading-none">Lead inbox</h1>
          <p className="mt-2 text-sm text-muted">
            {loadedAt ? `Updated ${timeAgo(new Date(loadedAt).toISOString())}` : "Loading…"}
            {pipeline ? ` · Open hot and confirmed orders worth about ${formatINR(pipeline)}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={refresh} disabled={loading} className="btn btn-outline btn-sm">
            <RefreshCw className={clsx("size-4", loading && "animate-spin")} aria-hidden="true" /> Refresh
          </button>
          <a href="/api/admin/leads?format=csv" download className="btn btn-outline btn-sm">
            <Download className="size-4" aria-hidden="true" /> CSV
          </a>
          <button type="button" onClick={() => void signOut()} className="btn btn-outline btn-sm">
            <LogOut className="size-4" aria-hidden="true" /> Sign out
          </button>
        </div>
      </div>

      <SetupPanel setup={setup} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["confirmed", "hot", "warm", "cold"] as LeadTier[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTier(tier === t ? "all" : t)}
            aria-pressed={tier === t}
            className={clsx(
              "rounded-[1.25rem] p-4 text-left ring-1 transition",
              tier === t ? "bg-ink text-paper ring-ink" : "bg-paper ring-line hover:shadow-soft",
            )}
          >
            <span className="text-xs font-bold tracking-wider uppercase opacity-75">{tierLabel[t]}</span>
            <span className="mt-1 block font-display text-4xl leading-none">{counts[t]}</span>
            <span className="mt-1 block text-xs opacity-70">
              {t === "confirmed"
                ? "Sent order to WhatsApp"
                : t === "hot"
                  ? "Ready to buy, has contact"
                  : t === "warm"
                    ? "Interested"
                    : "Just browsing"}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative md:w-72">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <label htmlFor="lead-search" className="sr-only">
            Search leads
          </label>
          <input
            id="lead-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, order…"
            className="field min-h-10 rounded-full pl-10 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["open", "all", "new", "contacted", "won", "lost"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              aria-pressed={status === s}
              className={clsx(
                "rounded-full px-3.5 py-1.5 text-sm font-semibold transition",
                status === s ? "bg-ink text-paper" : "bg-paper ring-1 ring-line hover:ring-ink/40",
              )}
            >
              {s === "open" ? "Open" : s === "all" ? "All" : statusLabel[s]}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm md:ml-auto">
          <span className="text-muted">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "newest" | "priority")}
            className="field min-h-9 w-auto py-1 text-sm"
          >
            <option value="priority">Hottest first</option>
            <option value="newest">Newest first</option>
          </select>
        </label>
      </div>

      {error ? (
        <p role="alert" className="flex items-center gap-2 rounded-2xl bg-rose p-4 text-sm font-semibold text-burgundy-deep">
          <CircleAlert className="size-4" aria-hidden="true" /> {error}
        </p>
      ) : null}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className={clsx("flex flex-col gap-3", selected && "hidden lg:flex")}>
          {leads === null ? (
            <div className="flex justify-center py-16 text-muted">
              <LoaderCircle className="size-6 animate-spin" aria-hidden="true" />
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-[1.5rem] bg-paper p-10 text-center ring-1 ring-line">
              <Inbox className="mx-auto size-8 text-muted" aria-hidden="true" />
              <p className="mt-3 font-bold">{leads.length ? "No leads match these filters" : "No leads yet"}</p>
              <p className="mt-1 text-sm text-muted">
                {leads.length
                  ? "Try another filter."
                  : "When customers chat with Joy, order or send an enquiry, they appear here."}
              </p>
            </div>
          ) : (
            visible.map((l) => <LeadRow key={l.id} lead={l} active={l.id === selectedId} onClick={() => setSelectedId(l.id)} />)
          )}
        </div>
        <div
          className={clsx(
            !selected && "hidden lg:block",
            "lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:overscroll-contain lg:pb-2",
          )}
        >
          {selected ? (
            <LeadDetail
              key={selected.id}
              lead={selected}
              onBack={() => setSelectedId(null)}
              onSaved={(updated) => setLeads((all) => (all ?? []).map((l) => (l.id === updated.id ? updated : l)))}
            />
          ) : (
            <div className="rounded-[1.5rem] border-2 border-dashed border-line p-10 text-center text-sm text-muted">
              Select a lead to see the details, conversation and follow-up actions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

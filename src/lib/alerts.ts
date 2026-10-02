import { site } from "@/data/site";
import { describeLine, priceCart } from "@/lib/cart";
import { displayPhone, formatDate, formatINR } from "@/lib/format";
import { tierLabel, type Lead } from "@/lib/leads";
import { customerFollowUpMessage, whatsappUrl } from "@/lib/whatsapp";

// Instant alerts for hot and confirmed leads.
// Email: set RESEND_API_KEY and ALERT_EMAIL_TO (optionally ALERT_EMAIL_FROM).
// Phone push: set NTFY_TOPIC and subscribe to that topic in the free ntfy app.

export function alertChannels() {
  return {
    email: Boolean(process.env.RESEND_API_KEY && process.env.ALERT_EMAIL_TO),
    push: Boolean(process.env.NTFY_TOPIC),
  };
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function leadLines(lead: Lead) {
  const d = lead.details;
  const priced = priceCart(lead.cart);
  const lines: [string, string][] = [];
  if (d.name) lines.push(["Name", d.name]);
  if (d.phone) lines.push(["Phone", displayPhone(d.phone)]);
  if (d.email) lines.push(["Email", d.email]);
  if (d.occasion) lines.push(["Occasion", d.occasion]);
  if (d.eventDate) lines.push(["Needed on", formatDate(d.eventDate)]);
  if (d.fulfilment || d.area) lines.push([d.fulfilment === "pickup" ? "Pickup" : "Delivery", d.area || "-"]);
  if (d.guests) lines.push(["Guests", String(d.guests)]);
  if (d.budget) lines.push(["Budget", d.budget]);
  if (priced.lines.length) lines.push(["Gift box", priced.lines.map((l) => describeLine(l)).join(", ")]);
  if (priced.subtotal) lines.push(["Estimated value", formatINR(priced.subtotal)]);
  if (d.customRequest) lines.push(["Custom request", d.customRequest]);
  if (lead.summary) lines.push(["Summary", lead.summary]);
  if (lead.orderId) lines.push(["Order ref", lead.orderId]);
  return lines;
}

async function sendEmail(lead: Lead) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ALERT_EMAIL_TO;
  if (!key || !to) return;
  const from = process.env.ALERT_EMAIL_FROM || `${site.name} Leads <onboarding@resend.dev>`;
  const label = tierLabel[lead.tier];
  const who = lead.details.name || "A new customer";
  const subject = `${label} lead: ${who}${lead.details.occasion ? ` · ${lead.details.occasion}` : ""}`;
  const rows = leadLines(lead)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#7a6a5c;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;color:#2a2420">${esc(v)}</td></tr>`,
    )
    .join("");
  const waCustomer = lead.details.phone ? whatsappUrl(customerFollowUpMessage(lead.details.name), lead.details.phone) : null;
  const html = `<!doctype html><html><body style="margin:0;background:#f6efe4;font-family:Helvetica,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:28px 20px">
    <p style="margin:0 0 6px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#7a1f2b">${esc(label)} lead · score ${lead.score}</p>
    <h1 style="margin:0 0 18px;font-family:Georgia,serif;font-weight:400;font-size:26px;color:#2a2420">${esc(who)}</h1>
    <table style="border-collapse:collapse;font-size:14px;line-height:1.45">${rows}</table>
    <div style="margin-top:22px">
      ${waCustomer ? `<a href="${esc(waCustomer)}" style="display:inline-block;background:#1f8f4e;color:#fff;text-decoration:none;padding:11px 18px;border-radius:999px;font-size:14px;margin-right:8px">WhatsApp ${esc(lead.details.name || "customer")}</a>` : ""}
      <a href="${esc(site.url)}/admin" style="display:inline-block;background:#2a2420;color:#fff;text-decoration:none;padding:11px 18px;border-radius:999px;font-size:14px">Open lead inbox</a>
    </div>
    <p style="margin-top:26px;font-size:12px;color:#9a8a7c">Sent by your ${esc(site.name)} website.</p>
  </div></body></html>`;
  const text = `${subject}\n\n${leadLines(lead)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n")}\n\nLead inbox: ${site.url}/admin`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: to
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      subject,
      html,
      text,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) console.error("Lead email failed", res.status, await res.text().catch(() => ""));
}

async function sendPush(lead: Lead) {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) return;
  const label = tierLabel[lead.tier];
  const who = lead.details.name || "New customer";
  const body = leadLines(lead)
    .filter(([k]) => k !== "Name")
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  const res = await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
    method: "POST",
    headers: {
      Title: `${label} lead: ${who}`.replace(/[^\x20-\x7E]/g, ""),
      Priority: lead.tier === "confirmed" || lead.tier === "hot" ? "high" : "default",
      Tags: lead.tier === "confirmed" ? "tada" : "fire",
      Click: `${site.url}/admin`,
    },
    body,
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) console.error("Lead push failed", res.status);
}

/**
 * Sends one alert the first time a lead becomes hot and one when it is confirmed.
 * Returns the updated alert record to store on the lead.
 */
export async function alertIfNeeded(lead: Lead): Promise<Lead["alerts"]> {
  const alerts = { ...(lead.alerts ?? {}) };
  const now = new Date().toISOString();
  let shouldSend = false;
  if (lead.tier === "confirmed" && !alerts.confirmed) {
    alerts.confirmed = now;
    alerts.hot ??= now;
    shouldSend = true;
  } else if (lead.tier === "hot" && !alerts.hot) {
    alerts.hot = now;
    shouldSend = true;
  }
  if (!shouldSend) return lead.alerts;
  const results = await Promise.allSettled([sendEmail(lead), sendPush(lead)]);
  for (const r of results) if (r.status === "rejected") console.error("Lead alert error", r.reason);
  return alerts;
}

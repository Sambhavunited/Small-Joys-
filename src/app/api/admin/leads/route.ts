import { isAdmin } from "@/lib/admin-auth";
import { describeLine, priceCart } from "@/lib/cart";
import { json } from "@/lib/http";
import { statusLabel, tierLabel, type Lead } from "@/lib/leads";
import { listLeads, storageKind } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvCell(value: unknown) {
  let s = value == null ? "" : String(value);
  // Stop spreadsheet apps from treating text as a formula.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(leads: Lead[]) {
  const header = [
    "Created",
    "Updated",
    "Tier",
    "Score",
    "Status",
    "Source",
    "Order ref",
    "Name",
    "Phone",
    "Email",
    "Occasion",
    "Needed on",
    "Fulfilment",
    "Area",
    "Guests",
    "Budget",
    "Gift box",
    "Estimated value",
    "Custom request",
    "Gift message",
    "Notes",
    "Summary",
    "Your notes",
  ];
  const rows = leads.map((l) => {
    const d = l.details;
    return [
      l.createdAt,
      l.updatedAt,
      tierLabel[l.tier],
      l.score,
      statusLabel[l.status],
      l.source,
      l.orderId,
      d.name,
      d.phone ? `+${d.phone}` : "",
      d.email,
      d.occasion,
      d.eventDate,
      d.fulfilment,
      d.area,
      d.guests,
      d.budget,
      priceCart(l.cart)
        .lines.map((x) => describeLine(x))
        .join("; "),
      l.estimatedValue,
      d.customRequest,
      d.giftMessage,
      d.notes,
      l.summary,
      l.adminNotes,
    ].map(csvCell);
  });
  return [header.map(csvCell), ...rows].map((r) => r.join(",")).join("\r\n");
}

export async function GET(req: Request) {
  if (!(await isAdmin())) return json({ error: "Please sign in again." }, 401);
  try {
    const leads = await listLeads(300);
    if (new URL(req.url).searchParams.get("format") === "csv") {
      const date = new Date().toISOString().slice(0, 10);
      return new Response(`﻿${toCsv(leads)}`, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="small-joys-leads-${date}.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }
    return json({ leads, storage: storageKind() });
  } catch (err) {
    console.error("Could not list leads", err);
    return json({ error: "Couldn't load leads right now. Please try again." }, 500);
  }
}

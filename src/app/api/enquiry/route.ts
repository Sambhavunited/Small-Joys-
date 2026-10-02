import { site } from "@/data/site";
import { json, readJsonBody } from "@/lib/http";
import { sanitizeDetails } from "@/lib/lead-input";
import { upsertLead } from "@/lib/lead-service";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { whatsappUrl } from "@/lib/whatsapp";
import { formatDate } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await readJsonBody(req, 20_000);
  if (!body) return json({ error: "Invalid request" }, 400);
  if (typeof body.website === "string" && body.website.trim()) return json({ ok: true, whatsappUrl: whatsappUrl() });
  if (
    !rateLimit(`enquiry:${clientIp(req)}`, [
      { windowMs: 60_000, max: 4 },
      { windowMs: 3_600_000, max: 20 },
    ])
  ) {
    return json({ error: "Too many messages from this connection. Please wait a minute and try again." }, 429);
  }

  const details = sanitizeDetails({
    name: body.name,
    phone: body.phone,
    email: body.email,
    occasion: body.occasion,
    eventDate: body.eventDate,
    guests: body.guests,
    customRequest: body.message,
  });
  const errors: Record<string, string> = {};
  if (!details.name) errors.name = "Please enter your name.";
  if (!details.phone && !details.email) errors.phone = "Please share a mobile number or email so we can reply.";
  if (!details.customRequest) errors.message = "Tell us a little about what you'd like.";
  if (Object.keys(errors).length) return json({ error: "Please check the highlighted fields.", errors }, 422);

  try {
    await upsertLead({
      id: crypto.randomUUID(),
      source: "enquiry",
      state: { details, intent: "high", summary: `Enquiry: ${details.customRequest!.replace(/\s+/g, " ").slice(0, 160)}` },
      cart: [],
      page: "/contact",
    });
  } catch (err) {
    console.error("Enquiry save failed", err);
    return json({ error: `We couldn't send that just now. Please message ${site.owner} on WhatsApp instead.` }, 500);
  }

  const lines = [`Hi ${site.name}! I just sent an enquiry on your website.`, "", `Name: ${details.name}`];
  if (details.occasion) lines.push(`Occasion: ${details.occasion}`);
  if (details.eventDate) lines.push(`Date: ${formatDate(details.eventDate)}`);
  if (details.guests) lines.push(`Guests: ${details.guests}`);
  lines.push(`Message: ${details.customRequest}`);
  return json({ ok: true, whatsappUrl: whatsappUrl(lines.join("\n")) });
}

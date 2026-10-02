import { sanitizeDetails } from "@/lib/lead-input";
import { todayIST } from "@/lib/format";
import type { CustomerDetails } from "@/lib/leads";

// Picks contact and order details out of a customer's chat message.
// Used by the guided assistant (no AI key, or AI unavailable) so a customer
// who types their number or date still becomes a proper lead.

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const MONTH_RE =
  "(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)";

const pad = (n: number) => String(n).padStart(2, "0");

function isoDate(year: number, month: number, day: number) {
  const d = new Date(Date.UTC(year, month - 1, day));
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) return undefined;
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** A day and month without a year means the next time that date comes round. */
function upcoming(month: number, day: number, today: string) {
  const year = Number(today.slice(0, 4));
  const thisYear = isoDate(year, month, day);
  if (thisYear && thisYear >= today) return thisYear;
  return isoDate(year + 1, month, day);
}

function addDays(today: string, days: number) {
  const d = new Date(`${today}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function findDate(text: string, today: string): string | undefined {
  const t = text.toLowerCase();
  if (/\bday after tomorrow\b/.test(t)) return addDays(today, 2);
  if (/\btomorrow\b|\btmrw\b/.test(t)) return addDays(today, 1);
  if (/\btoday\b|\btonight\b/.test(t)) return today;

  let m = t.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/);
  if (m) return isoDate(Number(m[1]), Number(m[2]), Number(m[3]));

  // Indian order: day/month/year. Without a year only "12/10" counts, since
  // "5-6" or "1.5" are more often ranges and amounts than dates.
  m = t.match(/\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{4}|\d{2})\b/);
  if (m) {
    const year = m[3]!.length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    return isoDate(year, Number(m[2]), Number(m[1]));
  }
  m = t.match(/\b(\d{1,2})\/(\d{1,2})\b(?!\s*(?:kg|g|gm|gms|grams?|lbs?|pounds?|dozen|tiers?|pcs|pieces)\b)/);
  if (m) return upcoming(Number(m[2]), Number(m[1]), today);

  m = t.match(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?${MONTH_RE}\\b(?:,?\\s+(20\\d{2}))?`));
  if (m) {
    const month = MONTHS.indexOf(m[2]!.slice(0, 3)) + 1;
    return m[3] ? isoDate(Number(m[3]), month, Number(m[1])) : upcoming(month, Number(m[1]), today);
  }
  m = t.match(new RegExp(`\\b${MONTH_RE}\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b(?:,?\\s+(20\\d{2}))?`));
  if (m) {
    const month = MONTHS.indexOf(m[1]!.slice(0, 3)) + 1;
    return m[3] ? isoDate(Number(m[3]), month, Number(m[2])) : upcoming(month, Number(m[2]), today);
  }
  return undefined;
}

function findPhone(text: string) {
  const candidates = text.match(/\+?\d[\d\s-]{8,16}\d/g) ?? [];
  for (const c of candidates) {
    const digits = c.replace(/\D/g, "");
    // Indian mobile (optionally with 0 or 91), or any number written with a leading +
    if (/^(?:0|91)?[6-9]\d{9}$/.test(digits) || (c.trim().startsWith("+") && digits.length >= 11 && digits.length <= 15)) {
      return c;
    }
  }
  return undefined;
}

function findName(text: string) {
  const m = text.match(/\b(?:my name is|my name's|name is|name:)\s*([a-z][a-z.'-]*(?:\s+[a-z][a-z.'-]*){0,3})/i);
  if (!m) return undefined;
  const stop = /^(and|my|phone|number|mobile|from|for|i|i'm|pickup|delivery|on|here|please|email|contact)$/i;
  const words: string[] = [];
  for (const w of m[1]!.split(/\s+/)) {
    if (stop.test(w)) break;
    words.push(w.replace(/[.,]+$/, ""));
  }
  const name = words.filter(Boolean).join(" ");
  if (!name || name.length < 2) return undefined;
  return name.replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

export function extractDetails(message: string, now = new Date()): CustomerDetails {
  const text = message.slice(0, 1500);
  const today = todayIST(now);
  const t = text.toLowerCase();

  const pickup = /\b(pick\s?-?up|self[- ]pick|collect it|i'?ll collect|come and collect)\b/.test(t);
  const delivery = /\b(deliver(y|ed)?|home delivery|send it to)\b/.test(t) && !/\bno delivery\b/.test(t);
  const area = text
    .match(
      /\bdeliver(?:y|ed)?\s+(?:to|in|at)\s+([a-z0-9][a-z0-9 ,.'-]{2,60}?)(?=[.!?\n]|\s+(?:on|by|for|before|tomorrow|today)\b|$)/i,
    )?.[1]
    ?.replace(/[\s,]+(please|pls|plz|thanks|thank you)$/i, "")
    .trim();

  const email = text.match(/[^\s@<>(),;:]+@[^\s@<>(),;:]+\.[a-z]{2,}/i)?.[0];

  return sanitizeDetails({
    name: findName(text),
    phone: findPhone(text),
    email,
    eventDate: findDate(text, today),
    fulfilment: pickup && !delivery ? "pickup" : delivery && !pickup ? "delivery" : undefined,
    area: delivery && area ? area : undefined,
  });
}

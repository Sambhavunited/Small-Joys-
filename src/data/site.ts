// Business details shown across the site and used by the AI assistant.
// Edit these values to update the whole site.

function resolveSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const site = {
  name: "Small Joys",
  tagline: "Little delights, packaged with love",
  promise: "Gifts that spread smiles",
  owner: "Deepika Jain",
  phoneDisplay: "+91 95555 48126",
  phoneE164: "+919555548126",
  // WhatsApp number in international format without "+" (used for wa.me links)
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919555548126",
  instagram: "deepikajain199",
  instagramUrl: "https://www.instagram.com/deepikajain199/",
  assistantName: "Joy",
  url: resolveSiteUrl(),
  description:
    "Small Joys is a home bakery and gifting studio by Deepika Jain. Handmade brownies, cookies, cakes, cupcakes and festive gift hampers, packaged with love. Order with our 24x7 gifting assistant and confirm on WhatsApp.",
} as const;

export const navLinks = [
  { href: "/menu", label: "Menu" },
  { href: "/gifting", label: "Gifting" },
  { href: "/custom-cakes", label: "Custom cakes" },
  { href: "/catering", label: "Dessert tables" },
  { href: "/about", label: "Our story" },
  { href: "/contact", label: "Contact" },
] as const;

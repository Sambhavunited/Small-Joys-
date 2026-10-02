import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { site } from "@/data/site";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartDrawer, Toaster } from "@/components/cart-drawer";
import { ChatWidget } from "@/components/chat/chat-widget";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · ${site.promise} | Home bakery & gifting by ${site.owner}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "home bakery",
    "gift hampers",
    "Diwali gift hamper",
    "brownies",
    "cookies",
    "custom cakes",
    "corporate gifting",
    "dessert table",
    site.name,
    site.owner,
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} · ${site.promise}`,
    description: site.description,
    url: "/",
    locale: "en_IN",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `${site.name}: ${site.tagline}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} · ${site.promise}`,
    description: site.description,
    images: ["/og.jpg"],
  },
  alternates: { canonical: "/" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#7a1f2b",
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Bakery",
  name: site.name,
  description: site.description,
  url: site.url,
  image: `${site.url}/og.jpg`,
  logo: `${site.url}/images/brand/logo.png`,
  telephone: site.phoneE164,
  founder: { "@type": "Person", name: site.owner },
  sameAs: [site.instagramUrl],
  priceRange: "₹₹",
  servesCuisine: "Bakery",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${manrope.variable} ${instrument.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex flex-1 flex-col">
          {children}
        </main>
        <SiteFooter />
        <CartDrawer />
        <ChatWidget />
        <Toaster />
        <script
          type="application/ld+json"
          // JSON-LD built from our own constants, with "<" escaped.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        <Analytics />
      </body>
    </html>
  );
}

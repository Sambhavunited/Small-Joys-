# Small Joys

The website for **Small Joys**, a home bakery and gifting studio by Deepika Jain: _Gifts that spread smiles · little delights, packaged with love._

It includes:

- **The website**: home, menu with search and categories, gifting and hampers, custom cakes, dessert tables and catering, our story, contact, privacy.
- **Joy, a 24x7 AI sales assistant** (Claude) that recommends treats, shows product cards, builds the customer's gift box, collects their details and hands the finished order to WhatsApp with everything typed out.
- **Lead capture and scoring**: every chat, checkout and enquiry becomes a lead tagged **Confirmed**, **Hot**, **Warm** or **Cold**.
- **A private lead inbox** at `/admin` with filters, follow-up buttons (WhatsApp, call, email), status tracking, notes, the full conversation and CSV export.
- **Instant alerts** (optional) by email and phone push when a lead turns hot or confirmed.

## How ordering works

1. A customer browses the menu or tells Joy what they're celebrating.
2. Items go into a gift box (the cart). Joy can add, change or remove items.
3. The customer sends the order on WhatsApp (from the chat, or from `/checkout`). WhatsApp opens with the order, reference number, date, delivery details and estimated total typed out.
4. Deepika confirms the final price, delivery and payment on WhatsApp. No payment is taken on the website.

### Lead tiers

| Tier | Meaning |
| --- | --- |
| Confirmed | Tapped "Send order on WhatsApp" in the chat, or placed an order at checkout |
| Hot | Strong buying signals (items in the box, a date, ready to order) **and** shared a phone number or email |
| Warm | Interested: has items, an occasion, a date or a request, but not ready yet |
| Cold | Just browsing |

Scoring lives in `src/lib/leads.ts`.

## Editing the menu and business details

- **Products, prices, photos, occasions, catering menus and gallery**: `src/data/menu.ts`. Joy reads the same file, so the AI always quotes the current menu.
- **Name, phone, WhatsApp, Instagram, owner**: `src/data/site.ts`.
- **Photos**: `public/images/` (`products/` are transparent cut-outs, `gallery/` and `scenes/` are photos). If you add gallery photos, also add their pixel sizes to `src/data/image-sizes.ts`.

## Environment variables

See `.env.example` for the full list. The important ones:

| Variable | What it does |
| --- | --- |
| `ANTHROPIC_API_KEY` | Turns on full AI replies. Without it, Joy runs in guided mode. |
| `ADMIN_PASSWORD` | Password for the lead inbox at `/admin`. |
| `BLOB_READ_WRITE_TOKEN` | Set automatically when a Vercel Blob store is connected. Leads are stored there privately. |
| `RESEND_API_KEY`, `ALERT_EMAIL_TO` | Email alerts for hot and confirmed leads. |
| `NTFY_TOPIC` | Phone push alerts through the free ntfy app. |
| `NEXT_PUBLIC_SITE_URL` | The public URL once a custom domain is connected. |

After changing environment variables on Vercel, redeploy for them to take effect.

## Development

```bash
npm install
cp .env.example .env.local   # fill in what you need
npm run dev                  # http://localhost:3000
```

Checks: `npm run typecheck`, `npm run lint`, `npm run build`. Format with `npm run format`.

## Tech

Next.js 16 (App Router), React 19, Tailwind CSS 4, the Anthropic TypeScript SDK (streaming tool use), Vercel Blob for lead storage and Vercel Analytics. Hosted on Vercel.

Key files:

- `src/lib/agent/` — Joy's instructions (`prompt.ts`), tools (`tools.ts`), the tool-use loop (`run.ts`) and the guided fallback (`guided.ts`).
- `src/app/api/chat/route.ts` — streams Joy's replies to the browser and saves leads.
- `src/app/api/orders`, `src/app/api/enquiry`, `src/app/api/chat/handoff` — checkout, contact form and WhatsApp handoff.
- `src/app/admin/` and `src/app/api/admin/` — the lead inbox.
- `src/components/chat/chat-widget.tsx` — the chat window.

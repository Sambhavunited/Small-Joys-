@AGENTS.md

# Small Joys website

The live website for Small Joys, a home bakery and gifting brand run by Deepika Jain. Public site: https://smalljoys.vercel.app. Lead inbox: `/admin`. The owner of this repository is not a developer: explain what changed in plain words, give links, and say what they need to do next.

## Going live

- `claude/small-joys-site-z8znuc` is the default branch and Vercel's production branch (Vercel team `sambhav-united`, project `small-joys`). Whatever lands on it is live within a couple of minutes.
- Work on your session's own branch and push it. Vercel builds a preview of every pushed branch. Open a pull request into `claude/small-joys-site-z8znuc` and give the owner the preview link (Vercel's comment on the pull request, or the Vercel connector). Preview links ask the owner to sign in to Vercel.
- The owner decides when a change goes live. When they ask for it ("put it live", "merge it", "publish"), in their first message or later, merge the pull request, or push directly if your session's branch is `claude/small-joys-site-z8znuc`. Then check that the production deployment is Ready and that the change shows on https://smalljoys.vercel.app.
- Before pushing, run `npm ci`, `npm run typecheck`, `npm run lint` and `npm run build`. All four must pass.
- To undo a live change, revert it on `claude/small-joys-site-z8znuc` the same way (a pull request that the owner asks to put live). Use Vercel Instant Rollback only when the site is broken and the owner wants the old version back at once; afterwards new pushes don't go live until the rollback is undone, so tell the owner.

## Where things are

- Products, prices, photos, occasions, catering menus and gallery: `src/data/menu.ts`. Joy, the chat assistant, reads the same file.
- Business name, phone, WhatsApp, Instagram and owner: `src/data/site.ts`.
- Photos: `public/images/`. Add pixel sizes of new gallery photos to `src/data/image-sizes.ts`. Stock photo credits: `PHOTO-CREDITS.md`.
- Joy's instructions, tools and guided mode: `src/lib/agent/`.
- Pages: `src/app/<page>/page.tsx`. The look follows the festive menu: cream, burgundy, navy and olive.

## Rules

- Never commit secrets. API keys and passwords live only in Vercel (Settings, Environment Variables), and the owner adds them there; a change to them needs a redeploy.
- Photos are Small Joys' own or free for commercial use (Unsplash, Pexels, Pixabay), credited in `PHOTO-CREDITS.md`. Never copy pictures from Pinterest or Google Images. Leave no empty image spots.
- Don't invent customer reviews, names, ratings, founding dates or ingredient claims.
- Prices are in INR as on the menu. Custom cakes, baskets, catering and delivery are priced on WhatsApp (+91 95555 48126).
- The site is hosted on Vercel only. Don't deploy it to Netlify, Railway or anywhere else.

# Sustain

A mobile-first Progressive Web App that helps you make sustainable choices at the grocery store. Enter your location, discover what's locally grown and in season near you, build a grocery list, then get AI-generated recipes from what you bought — all enriched with nutritional data.

## What it does

1. **Discover** — AI (Claude) recommends 12–16 locally sourced, in-season produce items for your region and the current month, enriched with nearby farmers market data (USDA)
2. **Grocery list** — Select items, set quantities, and check them off as you shop. Works offline after first load.
3. **Recipes** — After shopping, Claude generates 3 recipes tailored to your purchased items and dietary preferences. Nutritional data is fetched from Edamam per recipe.
4. **Markets map** — See nearby farmers markets on a map (Leaflet + USDA API)
5. **Profile** — Manage dietary preferences (vegan, gluten-free, allergies). Sign in to sync lists and history across devices.

## Tech stack

| Concern | Choice |
|---|---|
| Platform | Mobile-first PWA (installable, offline-capable) |
| Framework | Next.js 16 App Router (Turbopack) |
| Hosting | Vercel |
| AI | Claude via Vercel AI Gateway (`ai` SDK v6) |
| Local state | IndexedDB (Dexie.js) |
| Cloud state | Postgres (Vercel Marketplace) — auth users only |
| Auth | NextAuth.js v4 (Google + email magic link, optional) |
| Nutrition data | Edamam Nutrition API |
| Market data | USDA Farmers Market Directory API |
| Maps | Leaflet |
| Testing | Vitest + msw, Playwright |

## Getting started

### Prerequisites

- Node.js 20+
- A [Vercel](https://vercel.com) account (for AI Gateway OIDC auth — requires a credit card on file to unlock free credits)
- Optional: Google OAuth credentials for sign-in and cross-device sync
- Optional: Postgres `DATABASE_URL` for cloud sync (local-only works without it)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
# Link to your Vercel project and pull OIDC token for AI Gateway
vercel link
vercel env pull .env.local
```

Then add to `.env.local`:
```
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
# Optional — for Google sign-in and cloud sync:
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DATABASE_URL=
```

> **AI Gateway**: requires a credit card on file at vercel.com to unlock free monthly credits. Run `vercel env pull` after adding the card to get a fresh `VERCEL_OIDC_TOKEN`.

> **Nutrition data** (Edamam): no free tier available — the app degrades gracefully without it.

### 3. Set up the database (optional — only needed for cloud sync)

```bash
npx prisma migrate dev
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/                    # Next.js App Router pages + API routes
  api/
    produce/            # Claude seasonal produce endpoint
    recipes/            # Claude streaming recipe endpoint
    nutrition/          # Edamam proxy
    markets/            # USDA proxy
    sync/               # Cloud sync (auth-gated)
    auth/               # NextAuth
components/             # UI components (including BottomNav)
hooks/                  # React hooks (IndexedDB + API)
lib/                    # Clients, prompt builders, sync logic
types/                  # Shared TypeScript types
prisma/                 # Postgres schema
tests/
  unit/                 # Vitest unit tests
  integration/          # Vitest + msw integration tests
  e2e/                  # Playwright E2E tests
docs/
  superpowers/
    specs/              # Design spec
    plans/              # Implementation plan
```

## Testing

```bash
# Unit + integration
npm run test

# E2E (requires dev server running)
npm run test:e2e
```

## Architecture decisions

- **Local-first**: All data lives in IndexedDB. The app works fully offline after the first load. Postgres sync is additive, not required.
- **Optional auth**: Anonymous users get the full experience. Signing in enables cross-device history.
- **AI Gateway**: All Claude calls route through the Vercel AI Gateway using OIDC auth — no raw Anthropic API keys in the app.
- **Prompt caching**: Seasonal produce is cached in IndexedDB by `region:month` for 7 days. Recipes are cached by `groceryListId`. Neither re-calls Claude if a valid cache exists.
- **Known limitations**: USDA Farmers Market API cert is currently expired — markets degrade to an empty list. Edamam Nutrition API has no free tier — nutrition data is unavailable without a paid plan.

## Out of scope

- Social/sharing features
- Price comparison or store inventory
- Barcode scanning
- Push notifications
- Multi-language support

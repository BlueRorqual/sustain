# Project Context — Sustain

## What this project is

Sustain is a mobile-first PWA that helps users make sustainable grocery choices. It uses the device's location (or a manual city/zip entry) to surface locally sourced, in-season produce for that region and time of year, then helps the user build a grocery list and generate AI-powered recipes from what they actually bought.

## Core user journey

```
Set location + dietary prefs
        ↓
AI discovers what's in season + locally grown nearby
        ↓
User selects items → builds grocery list
        ↓
User shops, checks off items (offline-capable)
        ↓
AI generates 3 recipes from purchased items (streaming)
        ↓
Nutritional data enriches each recipe
        ↓
History saved locally; synced to cloud if signed in
```

## Design decisions and why

| Decision | Reason |
|---|---|
| PWA over native app | No app store friction, location access works, installable, offline-capable |
| Local-first (IndexedDB) | Works offline immediately; no backend required for basic use; privacy-respecting |
| Optional auth | Lower barrier to entry; anonymous users get full experience; sign-in adds value (sync), doesn't gate it |
| AI Gateway for Claude | OIDC auth, no raw API keys, built-in failover and cost tracking |
| Hybrid produce data | Claude for seasonal intelligence (works globally), USDA for real local market locations |
| AI-generated recipes + Edamam | Claude for creative, personalized recipes; Edamam for accurate nutritional data |
| Last-write-wins sync | Single-user data; no multi-device conflicts in practice; simplest correct behavior |

## Dietary preferences supported

Structured flags (not free-text):
- Vegan
- Gluten-free
- Allergies (free-text list, e.g. `["nuts", "soy"]`)

These flow through every Claude prompt for both produce and recipe generation.

## Caching strategy

| Data | Cache | TTL |
|---|---|---|
| Seasonal produce | IndexedDB (`region:month` key) | 7 days |
| Grocery lists | IndexedDB (persistent) | Forever (until deleted) |
| Recipes | IndexedDB (persistent) | Forever (until deleted) |
| Farmers markets | Next.js `revalidate: 86400` | 24 hours (server-side) |
| Nutritional data | Embedded in Recipe record | Permanent |

## External API dependencies

| API | Used for | Failure behavior |
|---|---|---|
| Vercel AI Gateway → Claude | Produce recommendations, recipe generation | Retry once; show cached or graceful error |
| USDA Farmers Market Directory | Nearby market locations and names | Silent omission of market hints |
| Edamam Nutrition Analysis | Per-recipe nutritional data | Nutrition panel shows "unavailable" |
| Nominatim (OpenStreetMap) | Reverse geocoding GPS coords to city name | Falls back to manual city entry |

## File ownership map

```
types/index.ts          — canonical type definitions (source of truth)
lib/db.ts               — Dexie instance (singleton, never re-instantiate)
lib/sync.ts             — all cloud sync logic
lib/ai-schemas.ts       — Zod schemas for Claude responses
lib/produce-prompt.ts   — prompt builder for /api/produce
lib/recipe-prompt.ts    — prompt builder for /api/recipes
lib/edamam.ts           — Edamam client
lib/usda.ts             — USDA Farmers Market client
lib/auth.ts             — NextAuth config
lib/prisma.ts           — Prisma client singleton
```

## Key documents

| Document | Path |
|---|---|
| Design spec | `docs/superpowers/specs/2026-04-10-sustain-design.md` |
| Implementation plan | `docs/superpowers/plans/2026-04-10-sustain-implementation.md` |
| Developer guide | `CLAUDE.md` |

## Out of scope (explicitly)

- Social features (sharing lists, recipes, follows)
- Price comparison or store inventory lookup
- Barcode scanning
- Push notifications
- Multi-language / i18n
- Admin dashboard

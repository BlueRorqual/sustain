# CLAUDE.md — Sustain

Guidance for Claude Code when working in this repository.

## Project overview

Sustain is a mobile-first PWA that helps users find locally sourced seasonal produce, build grocery lists, and get AI-generated recipes. See `README.md` for the full overview and `docs/superpowers/specs/2026-04-10-sustain-design.md` for the approved design spec.

## Implementation plan

The step-by-step implementation plan is at:
`docs/superpowers/plans/2026-04-10-sustain-implementation.md`

Use `superpowers:executing-plans` or `superpowers:subagent-driven-development` to execute it task-by-task.

## Key conventions

### AI SDK

- Uses **AI SDK v6** (`ai` package). All APIs have changed from v5.
- `generateObject` is gone — use `generateText` with `output: Output.object({ schema })`.
- `streamObject` is gone — use `streamText` with `output: Output.object({ schema })`.
- All model calls use **Vercel AI Gateway** model strings: `'anthropic/claude-sonnet-4.6'` (dots for version numbers, not hyphens).
- No `@ai-sdk/anthropic` package — the `ai` package routes gateway strings automatically.
- Auth is OIDC via `vercel env pull` (writes `VERCEL_OIDC_TOKEN`). No raw `ANTHROPIC_API_KEY`.

Before writing any AI SDK code, check `node_modules/ai/docs/` for current APIs. Do not rely on training data — it is outdated.

### Data layer

- **IndexedDB (Dexie.js)** is the primary data store for all users. Always write to IndexedDB first.
- Postgres (via Prisma) is only used for cloud sync for authenticated users. It is not the primary store.
- The Dexie instance is exported from `lib/db.ts`. Never create new instances.
- All sync logic lives in `lib/sync.ts`. Conflict resolution is last-write-wins on `updatedAt`.

### Types

All shared types are in `types/index.ts`. Do not duplicate type definitions elsewhere. The canonical types are:
- `UserPrefs`, `UserLocation`, `DietaryPrefs`
- `GroceryList`, `GroceryItem`
- `Recipe`, `RecipeIngredient`, `NutritionData`
- `ProduceItem`, `SeasonalProduceCache`
- `FarmersMarket`

### Components

- All components are client components (`'use client'`) unless they have no interactivity.
- `MarketsMap` uses a dynamic import (`next/dynamic`, `ssr: false`) because Leaflet requires browser APIs.
- Styling is Tailwind CSS only — no CSS modules or styled-components.
- The color palette is dark (slate-950 background, green-600 primary).

### API routes

| Route | Purpose | Notes |
|---|---|---|
| `/api/produce` | Claude seasonal produce | Cached by client in IndexedDB 7 days |
| `/api/recipes` | Claude streaming recipes | Returns `toUIMessageStreamResponse()` |
| `/api/nutrition` | Edamam proxy | Graceful null on failure |
| `/api/markets` | USDA proxy | Graceful empty array on failure |
| `/api/sync` | Postgres sync | Auth-gated — requires NextAuth session |

### Error handling rules

- **Claude failure**: Retry once, then fall back to cached produce if available. Never expose raw errors to the UI.
- **Geolocation denied**: Immediately show manual city/zip input. No blocking dialogs.
- **Edamam/USDA failure**: Silent degradation — recipe and produce still display without enrichment.
- **Offline**: Service worker serves cached assets. All IndexedDB data is accessible. AI-dependent actions show an inline "you're offline" message.

### Testing

- Unit and integration tests use **Vitest** with `fake-indexeddb` (auto-imported in `tests/setup.ts`).
- Integration tests mock external APIs with **msw**.
- E2E tests use **Playwright** targeting Mobile Chrome (`Pixel 5` device profile).
- Every new API route needs an integration test. Every new hook needs a unit test.
- Run tests: `npm run test` (unit/integration), `npm run test:e2e` (Playwright).

## What NOT to do

- Do not create a new Dexie instance — use `lib/db.ts`.
- Do not call the Anthropic API directly — use gateway model strings through `ai`.
- Do not put `ANTHROPIC_API_KEY` in `.env.local` — use `vercel env pull` for OIDC.
- Do not add features outside the spec (no social sharing, no barcode scanning, no push notifications).
- Do not use `generateObject` or `streamObject` — they are removed in AI SDK v6.
- Do not call hooks conditionally or inside callbacks (React rules).

## Environment setup

```bash
vercel link
vercel env pull .env.local   # Gets VERCEL_OIDC_TOKEN for AI Gateway
```

See `.env.local.example` for all required variables.

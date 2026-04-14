# Sustain — Design Spec

**Date:** 2026-04-10  
**Status:** Approved

---

## Overview

Sustain is a mobile-first Progressive Web App (PWA) that helps people make sustainable choices at the grocery store. Given a user's location, it surfaces locally sourced, in-season produce using AI-powered recommendations grounded in real farmers market data. After shopping, it generates personalized recipes from the groceries purchased, enriched with nutritional information.

---

## Platform & Stack

| Concern | Choice |
|---|---|
| Platform | Mobile-first PWA (installable, offline-capable) |
| Framework | Next.js 15 App Router |
| Hosting | Vercel |
| AI | Claude API via Vercel AI SDK |
| Local state | IndexedDB via Dexie.js |
| Cloud state | Postgres (Vercel Marketplace) — auth users only |
| Auth | NextAuth.js (Google / GitHub / email magic link) — optional |
| Nutrition data | Edamam Nutrition API |
| Market data | USDA Farmers Market Directory API |
| Maps | Leaflet |
| Testing | Vitest + msw (unit/integration), Playwright (E2E) |

---

## Architecture

**Approach: Local-First + Cloud Sync**

IndexedDB is the primary data store for all users. The app works fully offline after first load. Logged-in users get their data synced to Postgres in the background (last-write-wins on `updatedAt`). Anonymous users have a complete experience; signing in adds cross-device access and history without gating any features.

### Layers

```
Browser (PWA)
  └── Next.js App Router (UI)
  └── IndexedDB / Dexie.js (primary store)
  └── Service Worker (offline + background sync)
  └── Geolocation API

Next.js API Routes (Vercel)
  └── /api/produce      → Claude (seasonal produce JSON)
  └── /api/recipes      → Claude (streaming recipe objects)
  └── /api/nutrition    → Edamam proxy
  └── /api/markets      → USDA proxy
  └── /api/sync         → Postgres sync (auth-gated)

External Services
  └── Claude API (Anthropic)
  └── USDA Farmers Market Directory API
  └── Edamam Nutrition API
  └── Postgres (Vercel Marketplace)
```

---

## Core User Flow

1. **Onboarding** — User sets location (device GPS or manual city/zip) and dietary preferences (vegan, gluten-free, allergies[])
2. **Discover** — AI generates 12–16 locally sourced, in-season produce items for the region and month; USDA farmers market data enriches items with nearby market names
3. **Grocery list** — User selects items and quantities to build a grocery list; list is saved locally immediately
4. **Shop** — User checks off items as they shop (offline-capable)
5. **Recipes** — After shopping, user triggers recipe generation; Claude streams 3 recipes tailored to purchased items and dietary prefs; Edamam fetches nutritional data per recipe
6. **History** — Lists and recipes persist locally; logged-in users access history cross-device

---

## Pages

| Route | Purpose |
|---|---|
| `/` | Onboarding: location setup + dietary prefs |
| `/discover` | Seasonal local produce grid |
| `/grocery` | Grocery list builder + shopping checklist |
| `/markets` | Nearby farmers markets map |
| `/recipes` | AI-generated recipes from grocery list |
| `/recipe/[id]` | Recipe detail with nutritional panel |
| `/profile` | Preferences + history (full with auth) |

---

## Data Model

All entities stored in IndexedDB. Synced to Postgres for authenticated users.

### UserPrefs
```
location: { city, region, country, coords? }
dietary: {
  vegan: boolean
  glutenFree: boolean
  allergies: string[]
}
updatedAt: timestamp
```

### GroceryList
```
id: uuid
name: string               // e.g. "Week of Apr 10"
items: GroceryItem[]
status: "draft" | "shopping" | "done"
createdAt: timestamp
updatedAt: timestamp
```

### GroceryItem
```
id: uuid
name: string
category: "vegetable" | "fruit" | "staple"
localSource: string        // farm or market name hint
checked: boolean
quantity: number
unit: string
```

### Recipe
```
id: uuid
title: string
groceryListId: uuid
ingredients: { name, quantity, unit }[]
instructions: string       // markdown
nutrition: NutritionData
servings: number
prepTime: number           // minutes
cookTime: number           // minutes
dietaryTags: string[]
createdAt: timestamp
```

### NutritionData (embedded in Recipe)
```
calories: number
protein: number            // grams
carbs: number
fat: number
fiber: number
sugar: number
sodium: number
vitamins: { name, amount, unit }[]
```

### SeasonalProduce (cached, not synced)
```
region: string             // normalized location key
month: number              // 1–12
items: {
  name: string
  category: "vegetable" | "fruit" | "staple"
  whyLocal: string         // 1 sentence
  sustainabilityTip: string
  typicalAvailability: string
}[]
fetchedAt: timestamp       // TTL: 7 days
```

---

## AI Integration

### Flow 1 — Seasonal Produce Discovery

**Endpoint:** `POST /api/produce`

**Input to Claude:**
```
Location: {region}, {country}
Month: {month name}
Dietary: vegan={bool}, gluten_free={bool}, allergies=[...]

Return JSON array of 12-16 seasonal produce items.
Each: { name, category, whyLocal, sustainabilityTip, typicalAvailability }
```

**Caching:** Response cached in IndexedDB keyed by `{region}:{month}`. TTL: 7 days. Cache hit → instant load. Background revalidation after expiry.

**USDA enrichment:** After Claude responds, `/api/markets` is called with user coordinates to find nearby farmers markets. Market names surface on produce cards as sourcing hints.

**Prompt caching:** System instruction block marked with `cache_control` breakpoints. Only the user-specific variables change per request, keeping API costs low.

### Flow 2 — Recipe Generation (streaming)

**Endpoint:** `POST /api/recipes`

**Input to Claude:**
```
Groceries purchased: [item1, item2, ...]
Dietary: vegan={bool}, gluten_free={bool}, allergies=[...]
Servings: {n}

Generate 3 recipes. Each: title, description, ingredients with
quantities, step-by-step instructions (markdown), prep_time,
cook_time, servings, dietary_tags[].
```

**Streaming:** Uses Vercel AI SDK `streamObject` with a Zod schema. Recipes stream to the UI as Claude generates them — users see content appear immediately.

**Nutrition enrichment:** After each recipe streams in, `/api/nutrition` calls Edamam with the ingredient list. Nutrition panel renders with a skeleton state until enrichment completes.

---

## Component Structure

### UI Components
- `LocationPicker` — GPS prompt with instant fallback to manual city/zip input
- `DietaryPrefsForm` — structured checkboxes (vegan, GF) + free-text allergy input
- `ProduceCard` — item name, category badge, local source hint, sustainability tip
- `GroceryList` — add/remove items, quantity controls, check-off during shopping
- `RecipeCard` — streaming render (title + ingredients appear first, instructions stream in)
- `NutritionPanel` — skeleton → nutritional data table
- `MarketsMap` — Leaflet embed showing nearby farmers markets

### Hooks
- `useUserPrefs()` — reads/writes UserPrefs in IndexedDB; triggers sync on auth
- `useGroceryList(id)` — full CRUD for a list; queues sync on change
- `useSeasonalProduce()` — cache-first fetch; calls `/api/produce` on miss/expiry
- `useRecipes(listId)` — initiates streaming recipe fetch; saves results locally
- `useLocation()` — requests GPS; falls back to manual entry on denial

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Claude API failure | Retry once with backoff; show cached produce if available; else graceful "try again" state |
| Geolocation denied | Immediately show inline manual city/zip input — no blocking dialog |
| Edamam unavailable | Nutrition panel shows "unavailable" state; recipe still displays |
| USDA unavailable | Market sourcing hints omitted silently; produce loads normally |
| Offline | Service worker serves cached assets; all local lists/recipes accessible; AI actions show inline "you're offline" |
| Sync conflict | Silent last-write-wins on `updatedAt`; no user-facing conflict UI |

---

## Sync Strategy

- **Trigger points:** on login, on app foreground, on list status change to "done"
- **Background sync:** Service Worker queues sync requests when offline; replays on reconnect
- **Anonymous → auth upgrade:** On first sign-in, local IndexedDB data is merged into the cloud account automatically (local wins for any conflicting records at upgrade time)
- **Conflict resolution:** Last-write-wins on `updatedAt` — sufficient for single-user data

---

## Testing

| Layer | Tool | Coverage |
|---|---|---|
| Unit | Vitest | Hooks, cache TTL logic, dietary filter logic, Zod schema validation |
| Integration | Vitest + msw | API routes with mocked Claude/Edamam/USDA; prompt construction, response parsing, error fallbacks |
| E2E | Playwright | Onboarding → discover → grocery → recipes flow; geolocation denial fallback; offline mode with service worker |

---

## Out of Scope

- Social features (sharing lists/recipes)
- Price comparison or store inventory
- Barcode scanning
- Push notifications
- Multi-language support

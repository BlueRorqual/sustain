import { db } from './db'
import type { GroceryList, Recipe, UserPrefs } from '@/types'

export async function pushToCloud(): Promise<void> {
  const [lists, recipes, prefs] = await Promise.all([
    db.groceryLists.toArray(),
    db.recipes.toArray(),
    db.userPrefs.get('singleton'),
  ])

  await fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lists, recipes, prefs }),
  })
}

export async function pullFromCloud(): Promise<void> {
  const res = await fetch('/api/sync')
  if (!res.ok) return
  const { lists, recipes, prefs } = await res.json()

  // Last-write-wins: merge cloud data with local using updatedAt
  for (const cloudList of (lists as GroceryList[])) {
    const local = await db.groceryLists.get(cloudList.id)
    if (!local || cloudList.updatedAt > local.updatedAt) {
      await db.groceryLists.put(cloudList)
    }
  }

  for (const cloudRecipe of (recipes as Recipe[])) {
    const local = await db.recipes.get(cloudRecipe.id)
    if (!local) await db.recipes.put(cloudRecipe)
  }

  if (prefs) {
    const local = await db.userPrefs.get('singleton')
    if (!local || (prefs as UserPrefs).updatedAt > local.updatedAt) {
      await db.userPrefs.put(prefs as UserPrefs)
    }
  }
}

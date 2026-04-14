import Dexie, { type Table } from 'dexie'
import type { UserPrefs, GroceryList, Recipe, SeasonalProduceCache } from '@/types'

class SustainDB extends Dexie {
  userPrefs!: Table<UserPrefs, 'singleton'>
  groceryLists!: Table<GroceryList, string>
  recipes!: Table<Recipe, string>
  seasonalProduce!: Table<SeasonalProduceCache, string>

  constructor() {
    super('sustain')
    this.version(1).stores({
      userPrefs: 'id',
      groceryLists: 'id, status, createdAt, updatedAt',
      recipes: 'id, groceryListId, createdAt',
      seasonalProduce: 'id, region, month, fetchedAt',
    })
  }
}

export const db = new SustainDB()

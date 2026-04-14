import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import type { GroceryList } from '@/types'

beforeEach(async () => {
  await db.groceryLists.clear()
})

describe('db.groceryLists', () => {
  it('stores and retrieves a grocery list', async () => {
    const list: GroceryList = {
      id: 'test-1',
      name: 'Week of Apr 10',
      items: [],
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    await db.groceryLists.put(list)
    const retrieved = await db.groceryLists.get('test-1')
    expect(retrieved?.name).toBe('Week of Apr 10')
  })
})

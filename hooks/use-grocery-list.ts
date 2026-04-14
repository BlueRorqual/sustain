'use client'
import { useState, useEffect, useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import { db } from '@/lib/db'
import type { GroceryList, GroceryItem } from '@/types'

export function useGroceryList(id?: string) {
  const [list, setList] = useState<GroceryList | null>(null)
  const [allLists, setAllLists] = useState<GroceryList[]>([])

  useEffect(() => {
    db.groceryLists.orderBy('createdAt').reverse().toArray().then(setAllLists)
  }, [])

  useEffect(() => {
    if (!id) return
    db.groceryLists.get(id).then((l) => setList(l ?? null))
  }, [id])

  const save = useCallback(async (updated: GroceryList) => {
    const withTimestamp = { ...updated, updatedAt: Date.now() }
    await db.groceryLists.put(withTimestamp)
    setList(withTimestamp)
    setAllLists((prev) => {
      const idx = prev.findIndex((l) => l.id === updated.id)
      return idx >= 0
        ? prev.map((l) => (l.id === updated.id ? withTimestamp : l))
        : [withTimestamp, ...prev]
    })
    return withTimestamp
  }, [])

  const createList = useCallback(async (name: string): Promise<GroceryList> => {
    const newList: GroceryList = {
      id: uuid(),
      name,
      items: [],
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    return save(newList)
  }, [save])

  const addItem = useCallback(async (item: Omit<GroceryItem, 'id' | 'checked'>) => {
    if (!list) return
    const newItem: GroceryItem = { ...item, id: uuid(), checked: false }
    await save({ ...list, items: [...list.items, newItem] })
  }, [list, save])

  const toggleItem = useCallback(async (itemId: string) => {
    if (!list) return
    await save({
      ...list,
      items: list.items.map((i) => i.id === itemId ? { ...i, checked: !i.checked } : i),
    })
  }, [list, save])

  const removeItem = useCallback(async (itemId: string) => {
    if (!list) return
    await save({ ...list, items: list.items.filter((i) => i.id !== itemId) })
  }, [list, save])

  const setStatus = useCallback(async (status: GroceryList['status']) => {
    if (!list) return
    await save({ ...list, status })
  }, [list, save])

  return { list, allLists, createList, addItem, toggleItem, removeItem, setStatus }
}

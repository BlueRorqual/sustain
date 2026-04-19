'use client'
import { useState, useCallback, useEffect } from 'react'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { v4 as uuid } from 'uuid'
import { db } from '@/lib/db'
import { recipeResponseSchema } from '@/lib/ai-schemas'
import type { Recipe, GroceryItem, DietaryPrefs } from '@/types'

export function useRecipes(groceryListId: string) {
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [nutritionLoading, setNutritionLoading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!groceryListId) return
    db.recipes.where('groceryListId').equals(groceryListId).toArray().then((stored) => {
      if (stored.length > 0) setSavedRecipes(stored)
    })
  }, [groceryListId])

  const fetchNutritionForAll = useCallback(async (recipes: Recipe[]) => {
    setNutritionLoading(Object.fromEntries(recipes.map((r) => [r.id, true])))
    await Promise.allSettled(
      recipes.map(async (recipe) => {
        try {
          const res = await fetch('/api/nutrition', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: recipe.title, ingredients: recipe.ingredients }),
          })
          if (!res.ok) return
          const { nutrition } = await res.json()
          if (!nutrition) return
          const updated = { ...recipe, nutrition }
          await db.recipes.put(updated)
          setSavedRecipes((prev) => prev.map((r) => r.id === recipe.id ? updated : r))
        } finally {
          setNutritionLoading((prev) => ({ ...prev, [recipe.id]: false }))
        }
      })
    )
  }, [])

  const { object, submit, isLoading } = useObject({
    api: '/api/recipes',
    schema: recipeResponseSchema,
    onFinish: async ({ object: result }) => {
      if (!result?.recipes) return
      const now = Date.now()
      const recipes: Recipe[] = result.recipes.map((r) => ({
        id: uuid(),
        groceryListId,
        createdAt: now,
        nutrition: undefined,
        ...r,
      }))
      await db.recipes.bulkPut(recipes)
      setSavedRecipes(recipes)
      fetchNutritionForAll(recipes)
    },
  })

  const generateRecipes = useCallback((items: GroceryItem[], dietary: DietaryPrefs, servings = 2) => {
    submit({ items, dietary, servings })
  }, [submit])

  return {
    streamingRecipes: object?.recipes ?? [],
    savedRecipes,
    isGenerating: isLoading,
    nutritionLoading,
    generateRecipes,
  }
}

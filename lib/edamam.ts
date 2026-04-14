import type { NutritionData, RecipeIngredient } from '@/types'

const APP_ID = process.env.EDAMAM_APP_ID!
const APP_KEY = process.env.EDAMAM_APP_KEY!

function formatIngredient(ing: RecipeIngredient): string {
  return `${ing.quantity} ${ing.unit} ${ing.name}`
}

export async function fetchNutrition(
  title: string,
  ingredients: RecipeIngredient[]
): Promise<NutritionData | null> {
  if (!APP_ID || !APP_KEY) return null
  try {
    const res = await fetch(
      `https://api.edamam.com/api/nutrition-details?app_id=${APP_ID}&app_key=${APP_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          ingr: ingredients.map(formatIngredient),
        }),
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    const n = data.totalNutrients

    return {
      calories: Math.round(data.calories ?? 0),
      protein: Math.round((n?.PROCNT?.quantity ?? 0) * 10) / 10,
      carbs: Math.round((n?.CHOCDF?.quantity ?? 0) * 10) / 10,
      fat: Math.round((n?.FAT?.quantity ?? 0) * 10) / 10,
      fiber: Math.round((n?.FIBTG?.quantity ?? 0) * 10) / 10,
      sugar: Math.round((n?.SUGAR?.quantity ?? 0) * 10) / 10,
      sodium: Math.round((n?.NA?.quantity ?? 0) * 10) / 10,
      vitamins: [
        { name: 'Vitamin C', amount: Math.round((n?.VITC?.quantity ?? 0) * 10) / 10, unit: 'mg' },
        { name: 'Iron', amount: Math.round((n?.FE?.quantity ?? 0) * 10) / 10, unit: 'mg' },
        { name: 'Calcium', amount: Math.round((n?.CA?.quantity ?? 0) * 10) / 10, unit: 'mg' },
      ],
    }
  } catch {
    return null
  }
}

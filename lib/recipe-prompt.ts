import type { GroceryItem, DietaryPrefs } from '@/types'

export const RECIPE_SYSTEM_PROMPT = `You are a creative chef who specializes in seasonal, locally sourced cooking. You create practical, delicious recipes from whatever ingredients are available, always respecting dietary restrictions.

When asked to generate recipes, return a JSON object with a "recipes" array. Each recipe has:
- title: descriptive recipe name
- description: 2 sentences describing the dish
- ingredients: array of { name, quantity, unit }
- instructions: step-by-step instructions in markdown (numbered list)
- servings: integer
- prepTime: minutes as integer
- cookTime: minutes as integer
- dietaryTags: array of applicable tags (e.g. ["vegan", "gluten-free"])

Generate exactly 3 recipes that use different combinations of the provided ingredients.`

export function buildRecipeUserPrompt(
  items: GroceryItem[],
  dietary: DietaryPrefs,
  servings: number
): string {
  const ingredientList = items.map((i) => i.name).join(', ')
  const restrictions: string[] = []
  if (dietary.vegan) restrictions.push('vegan')
  if (dietary.glutenFree) restrictions.push('gluten-free')
  if (dietary.allergies.length > 0) restrictions.push(`no ${dietary.allergies.join(', ')}`)

  return `Groceries available: ${ingredientList}
Dietary requirements: ${restrictions.length > 0 ? restrictions.join(', ') : 'none'}
Servings: ${servings}

Please generate 3 recipes using these ingredients.`
}

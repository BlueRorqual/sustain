import { z } from 'zod'

const produceItemSchema = z.object({
  name: z.string(),
  category: z.enum(['vegetable', 'fruit', 'staple']),
  whyLocal: z.string(),
  sustainabilityTip: z.string(),
  typicalAvailability: z.string(),
})

export const produceResponseSchema = z.object({
  items: z.array(produceItemSchema).min(1).max(20),
})

const recipeIngredientSchema = z.object({
  name: z.string(),
  quantity: z.number().positive(),
  unit: z.string(),
})

const recipeSchema = z.object({
  title: z.string(),
  description: z.string(),
  ingredients: z.array(recipeIngredientSchema).min(1),
  instructions: z.string(),
  servings: z.number().int().positive(),
  prepTime: z.number().int().min(0),
  cookTime: z.number().int().min(0),
  dietaryTags: z.array(z.string()),
})

export const recipeResponseSchema = z.object({
  recipes: z.array(recipeSchema).min(1).max(5),
})

export type ProduceResponse = z.infer<typeof produceResponseSchema>
export type RecipeResponse = z.infer<typeof recipeResponseSchema>

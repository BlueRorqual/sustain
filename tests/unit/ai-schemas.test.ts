import { describe, it, expect } from 'vitest'
import { produceResponseSchema, recipeResponseSchema } from '@/lib/ai-schemas'

describe('produceResponseSchema', () => {
  it('accepts a valid produce array', () => {
    const result = produceResponseSchema.safeParse({
      items: [
        {
          name: 'Spinach',
          category: 'vegetable',
          whyLocal: 'Grown in nearby farms.',
          sustainabilityTip: 'Buy loose to avoid plastic.',
          typicalAvailability: 'April–June',
        },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid category', () => {
    const result = produceResponseSchema.safeParse({
      items: [{ name: 'X', category: 'meat', whyLocal: '', sustainabilityTip: '', typicalAvailability: '' }],
    })
    expect(result.success).toBe(false)
  })
})

describe('recipeResponseSchema', () => {
  it('accepts valid recipes', () => {
    const result = recipeResponseSchema.safeParse({
      recipes: [
        {
          title: 'Spinach Salad',
          description: 'A fresh salad.',
          ingredients: [{ name: 'Spinach', quantity: 2, unit: 'cups' }],
          instructions: '1. Wash spinach.',
          servings: 2,
          prepTime: 5,
          cookTime: 0,
          dietaryTags: ['vegan'],
        },
      ],
    })
    expect(result.success).toBe(true)
  })
})

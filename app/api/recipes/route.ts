import { streamText, Output } from 'ai'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { recipeResponseSchema } from '@/lib/ai-schemas'
import { RECIPE_SYSTEM_PROMPT, buildRecipeUserPrompt } from '@/lib/recipe-prompt'
import type { GroceryItem, DietaryPrefs } from '@/types'

const requestSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    category: z.enum(['vegetable', 'fruit', 'staple']),
    localSource: z.string(),
    checked: z.boolean(),
    quantity: z.number(),
    unit: z.string(),
  })),
  dietary: z.object({
    vegan: z.boolean(),
    glutenFree: z.boolean(),
    allergies: z.array(z.string()),
  }),
  servings: z.number().int().positive().default(2),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { items, dietary, servings } = parsed.data

    const result = streamText({
      model: 'anthropic/claude-sonnet-4.6',
      output: Output.object({ schema: recipeResponseSchema }),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: RECIPE_SYSTEM_PROMPT },
            { type: 'text', text: buildRecipeUserPrompt(items as GroceryItem[], dietary as DietaryPrefs, servings) },
          ],
        },
      ],
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('[api/recipes]', error)
    return NextResponse.json({ error: 'Failed to generate recipes' }, { status: 500 })
  }
}

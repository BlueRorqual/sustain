import { generateText, Output } from 'ai'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { produceResponseSchema } from '@/lib/ai-schemas'
import { PRODUCE_SYSTEM_PROMPT, buildProduceUserPrompt } from '@/lib/produce-prompt'
import type { UserLocation, DietaryPrefs } from '@/types'

const requestSchema = z.object({
  location: z.object({
    city: z.string(),
    region: z.string(),
    country: z.string(),
    coords: z.object({ lat: z.number(), lng: z.number() }).optional(),
  }),
  month: z.number().int().min(1).max(12),
  dietary: z.object({
    vegan: z.boolean(),
    glutenFree: z.boolean(),
    allergies: z.array(z.string()),
  }),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { location, month, dietary } = parsed.data

    const result = await generateText({
      model: 'anthropic/claude-sonnet-4.6',
      output: Output.object({ schema: produceResponseSchema }),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: PRODUCE_SYSTEM_PROMPT },
            { type: 'text', text: buildProduceUserPrompt(location as UserLocation, month, dietary as DietaryPrefs) },
          ],
        },
      ],
    })

    return NextResponse.json(result.output)
  } catch (error) {
    console.error('[api/produce]', error)
    return NextResponse.json({ error: 'Failed to fetch produce' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { fetchNutrition } from '@/lib/edamam'

const requestSchema = z.object({
  title: z.string(),
  ingredients: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    unit: z.string(),
  })),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const nutrition = await fetchNutrition(parsed.data.title, parsed.data.ingredients)
    // Return null gracefully — client handles "unavailable" state
    return NextResponse.json({ nutrition })
  } catch (error) {
    console.error('[api/nutrition]', error)
    return NextResponse.json({ nutrition: null })
  }
}

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { findNearbyMarkets } from '@/lib/usda'

const querySchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const parsed = querySchema.safeParse({
    lat: searchParams.get('lat'),
    lng: searchParams.get('lng'),
  })
  if (!parsed.success) {
    return NextResponse.json({ error: 'lat and lng required' }, { status: 400 })
  }

  try {
    const markets = await findNearbyMarkets(parsed.data.lat, parsed.data.lng)
    return NextResponse.json({ markets })
  } catch (error) {
    console.error('[api/markets]', error)
    return NextResponse.json({ markets: [] }) // silent failure per spec
  }
}

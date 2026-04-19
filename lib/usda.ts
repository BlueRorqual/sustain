import type { FarmersMarket } from '@/types'

const USDA_BASE = 'https://search.ams.usda.gov/farmersmarkets/v1/data.svc'

type USDAMarketResult = {
  id: string
  marketname: string
}

type USDAMarketDetail = {
  GoogleLink?: string
  x?: string
  y?: string
  Schedule?: string
  [key: string]: string | undefined
}

export async function findNearbyMarkets(
  lat: number,
  lng: number,
  radiusMiles = 25
): Promise<FarmersMarket[]> {
  const res = await fetch(
    `${USDA_BASE}/locSearch?lat=${lat}&lng=${lng}&radius=${radiusMiles}`,
    { next: { revalidate: 86400 } } // cache 24h
  )
  if (!res.ok) return []

  const data: { results: USDAMarketResult[] } = await res.json()
  if (!data.results?.length) return []

  const markets: FarmersMarket[] = []
  for (const market of data.results.slice(0, 10)) {
    try {
      const detail = await fetch(`${USDA_BASE}/mktDetail?id=${market.id}`)
      if (!detail.ok) continue
      const d: { marketdetails: USDAMarketDetail } = await detail.json()
      const md = d.marketdetails
      if (!md.x || !md.y) continue
      markets.push({
        id: market.id,
        name: market.marketname,
        address: md.GoogleLink ?? '',
        lat: parseFloat(md.y),
        lng: parseFloat(md.x),
        schedule: md.Schedule,
      })
    } catch {
      // skip markets that fail detail lookup
    }
  }
  return markets
}

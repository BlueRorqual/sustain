'use client'
import { useState, useEffect, useCallback } from 'react'
import { db } from '@/lib/db'
import type { ProduceItem, UserPrefs, FarmersMarket } from '@/types'

const TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function cacheKey(region: string, month: number) {
  return `${region.toLowerCase().replace(/\s+/g, '-')}:${month}`
}

type ProduceState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'resolved'; items: ProduceItem[]; markets: FarmersMarket[] }
  | { status: 'error'; cached?: ProduceItem[] }

export function useSeasonalProduce(prefs: UserPrefs | null) {
  const [state, setState] = useState<ProduceState>({ status: 'idle' })

  const fetchProduce = useCallback(async (force = false) => {
    if (!prefs?.location.region) return
    const month = new Date().getMonth() + 1
    const key = cacheKey(prefs.location.region, month)

    if (!force) {
      const cached = await db.seasonalProduce.get(key)
      if (cached && Date.now() - cached.fetchedAt < TTL_MS) {
        setState({ status: 'resolved', items: cached.items, markets: [] })
        return
      }
    }

    setState({ status: 'loading' })

    try {
      const [produceRes, marketsRes] = await Promise.allSettled([
        fetch('/api/produce', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ location: prefs.location, month, dietary: prefs.dietary }),
        }),
        prefs.location.coords
          ? fetch(`/api/markets?lat=${prefs.location.coords.lat}&lng=${prefs.location.coords.lng}`)
          : Promise.reject('no coords'),
      ])

      let items: ProduceItem[] = []
      if (produceRes.status === 'fulfilled' && produceRes.value.ok) {
        const data = await produceRes.value.json()
        items = data.items ?? []
        await db.seasonalProduce.put({ id: key, region: prefs.location.region, month, items, fetchedAt: Date.now() })
      } else {
        const cached = await db.seasonalProduce.get(key)
        setState({ status: 'error', cached: cached?.items })
        return
      }

      let markets: FarmersMarket[] = []
      if (marketsRes.status === 'fulfilled' && marketsRes.value.ok) {
        const data = await marketsRes.value.json()
        markets = data.markets ?? []
        if (markets.length > 0) {
          items = items.map((item, i) => ({
            ...item,
            localSource: markets[i % markets.length]?.name ?? '',
          }))
        }
      }

      setState({ status: 'resolved', items, markets })
    } catch {
      const cached = await db.seasonalProduce.get(key)
      setState({ status: 'error', cached: cached?.items })
    }
  }, [prefs])

  useEffect(() => {
    if (prefs?.location.region) fetchProduce()
  }, [prefs?.location.region, fetchProduce])

  return { state, refetch: () => fetchProduce(true) }
}

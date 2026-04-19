'use client'
import { useEffect, useState } from 'react'
import { MarketsMap } from '@/components/markets-map'
import { useUserPrefs } from '@/hooks/use-user-prefs'
import type { FarmersMarket } from '@/types'

export default function MarketsPage() {
  const { prefs } = useUserPrefs()
  const [markets, setMarkets] = useState<FarmersMarket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!prefs.location.coords) { setLoading(false); return }
    const { lat, lng } = prefs.location.coords
    fetch(`/api/markets?lat=${lat}&lng=${lng}`)
      .then((r) => r.json())
      .then((d) => setMarkets(d.markets ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [prefs.location.coords])

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">Nearby Farmers Markets</h1>
      {loading ? (
        <div className="h-80 animate-pulse rounded-xl bg-slate-800" />
      ) : markets.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">
          No markets found nearby. Try enabling location access.
        </p>
      ) : (
        <>
          <MarketsMap markets={markets} center={prefs.location.coords} />
          <ul className="mt-4 flex flex-col gap-2">
            {markets.map((m) => (
              <li key={m.id} className="rounded-lg border border-slate-700 bg-slate-900 p-3">
                <p className="font-medium text-sm">{m.name}</p>
                {m.schedule && <p className="text-xs text-slate-500 mt-1">{m.schedule}</p>}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  )
}

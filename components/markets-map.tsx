'use client'
import dynamic from 'next/dynamic'
import type { FarmersMarket } from '@/types'

// Leaflet requires browser APIs — must be dynamic with no SSR
const MapInner = dynamic(() => import('./markets-map-inner'), { ssr: false })

type Props = { markets: FarmersMarket[]; center?: { lat: number; lng: number } }

export function MarketsMap(props: Props) {
  return (
    <div className="h-80 w-full overflow-hidden rounded-xl border border-slate-700">
      <MapInner {...props} />
    </div>
  )
}

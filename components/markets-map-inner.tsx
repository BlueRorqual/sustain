'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import type { FarmersMarket } from '@/types'

// Fix Leaflet default icon path in Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

type Props = { markets: FarmersMarket[]; center?: { lat: number; lng: number } }

export default function MarketsMapInner({ markets, center }: Props) {
  const mapCenter: [number, number] = center
    ? [center.lat, center.lng]
    : markets.length > 0
    ? [markets[0].lat, markets[0].lng]
    : [39.5, -98.35] // continental US center

  return (
    <MapContainer center={mapCenter} zoom={11} className="h-full w-full" scrollWheelZoom={false}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {markets.map((market) => (
        <Marker key={market.id} position={[market.lat, market.lng]}>
          <Popup>
            <strong>{market.name}</strong>
            {market.schedule && <p className="mt-1 text-xs">{market.schedule}</p>}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

'use client'
import { useState } from 'react'
import { useLocation } from '@/hooks/use-location'
import type { UserLocation } from '@/types'

type Props = {
  onLocation: (loc: UserLocation) => void
}

export function LocationPicker({ onLocation }: Props) {
  const { state, requestGPS } = useLocation()
  const [manual, setManual] = useState({ city: '', region: '', country: '' })
  const [showManual, setShowManual] = useState(false)

  if (state.status === 'resolved') {
    return (
      <div className="rounded-lg border border-green-700 bg-green-950 p-4">
        <p className="text-sm text-green-400">Location detected</p>
        <p className="font-medium">{state.location.city}, {state.location.region}</p>
        <button
          onClick={() => onLocation(state.location)}
          className="mt-3 w-full rounded-md bg-green-600 py-2 text-sm font-medium"
        >
          Use this location
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={requestGPS}
        disabled={state.status === 'loading'}
        className="w-full rounded-lg bg-green-600 py-3 font-medium disabled:opacity-50"
      >
        {state.status === 'loading' ? 'Detecting...' : 'Use my location'}
      </button>
      <button
        onClick={() => setShowManual(true)}
        className="text-sm text-slate-400 underline"
      >
        Enter manually
      </button>
      {(state.status === 'denied' || showManual) && (
        <div className="flex flex-col gap-2 rounded-lg border border-slate-700 p-4">
          <input
            placeholder="City"
            value={manual.city}
            onChange={(e) => setManual((m) => ({ ...m, city: e.target.value }))}
            className="rounded-md bg-slate-800 px-3 py-2 text-sm outline-none"
          />
          <input
            placeholder="Region / State"
            value={manual.region}
            onChange={(e) => setManual((m) => ({ ...m, region: e.target.value }))}
            className="rounded-md bg-slate-800 px-3 py-2 text-sm outline-none"
          />
          <input
            placeholder="Country"
            value={manual.country}
            onChange={(e) => setManual((m) => ({ ...m, country: e.target.value }))}
            className="rounded-md bg-slate-800 px-3 py-2 text-sm outline-none"
          />
          <button
            onClick={() => {
              if (manual.city && manual.country) onLocation(manual)
            }}
            className="rounded-md bg-green-600 py-2 text-sm font-medium"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  )
}

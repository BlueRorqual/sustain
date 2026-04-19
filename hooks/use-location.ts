'use client'
import { useState, useCallback } from 'react'
import type { UserLocation } from '@/types'

type LocationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'resolved'; location: UserLocation }
  | { status: 'denied' }
  | { status: 'error'; message: string }

export function useLocation() {
  const [state, setState] = useState<LocationState>({ status: 'idle' })

  const requestGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ status: 'denied' })
      return
    }
    setState({ status: 'loading' })
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
          const data = await res.json()
          const location: UserLocation = {
            city: data.address.city || data.address.town || data.address.village || '',
            region: data.address.state || data.address.county || '',
            country: data.address.country || '',
            coords: { lat: latitude, lng: longitude },
          }
          setState({ status: 'resolved', location })
        } catch {
          setState({ status: 'error', message: 'Could not resolve location name' })
        }
      },
      () => setState({ status: 'denied' })
    )
  }, [])

  return { state, requestGPS }
}

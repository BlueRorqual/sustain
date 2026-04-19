'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { db } from '@/lib/db'
import type { UserPrefs, DietaryPrefs, UserLocation } from '@/types'

const DEFAULT_PREFS: UserPrefs = {
  id: 'singleton',
  location: { city: '', region: '', country: '' },
  dietary: { vegan: false, glutenFree: false, allergies: [] },
  updatedAt: 0,
}

export function useUserPrefs() {
  const [prefs, setPrefs] = useState<UserPrefs>(DEFAULT_PREFS)
  const [loading, setLoading] = useState(true)
  const prefsRef = useRef(prefs)

  useEffect(() => {
    prefsRef.current = prefs
  }, [prefs])

  useEffect(() => {
    db.userPrefs.get('singleton').then((stored) => {
      if (stored) setPrefs(stored)
      setLoading(false)
    }).catch((err) => {
      console.error('[useUserPrefs] IndexedDB error:', err)
      setLoading(false)
    })
  }, [])

  const updateLocation = useCallback(async (location: UserLocation) => {
    const updated: UserPrefs = { ...prefsRef.current, location, updatedAt: Date.now() }
    await db.userPrefs.put(updated)
    setPrefs(updated)
  }, [])

  const updateDietary = useCallback(async (dietary: DietaryPrefs) => {
    const updated: UserPrefs = { ...prefsRef.current, dietary, updatedAt: Date.now() }
    await db.userPrefs.put(updated)
    setPrefs(updated)
  }, [])

  return { prefs, loading, updateLocation, updateDietary }
}

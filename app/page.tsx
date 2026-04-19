'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LocationPicker } from '@/components/location-picker'
import { DietaryPrefsForm } from '@/components/dietary-prefs-form'
import { useUserPrefs } from '@/hooks/use-user-prefs'
import type { UserLocation, DietaryPrefs } from '@/types'

export default function OnboardingPage() {
  const router = useRouter()
  const { prefs, loading, updateLocation, updateDietary } = useUserPrefs()
  const [step, setStep] = useState<'location' | 'dietary'>('location')

  useEffect(() => {
    if (!loading && prefs.location.city && prefs.updatedAt > 0) {
      router.replace('/discover')
    }
  }, [loading, prefs, router])

  if (loading || (prefs.location.city && prefs.updatedAt > 0)) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading…</div>
  }

  async function handleLocation(loc: UserLocation) {
    await updateLocation(loc)
    setStep('dietary')
  }

  async function handleDietary(dietary: DietaryPrefs) {
    await updateDietary(dietary)
    router.push('/discover')
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-green-400">Sustain</h1>
        <p className="mt-2 text-slate-400">Locally sourced groceries, personalized recipes</p>
      </div>

      {step === 'location' ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Where are you shopping?</h2>
          <LocationPicker onLocation={handleLocation} />
        </section>
      ) : (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Any dietary preferences?</h2>
          <DietaryPrefsForm onSave={handleDietary} />
          <button
            onClick={() => handleDietary({ vegan: false, glutenFree: false, allergies: [] })}
            className="mt-3 w-full text-sm text-slate-500 underline"
          >
            Skip for now
          </button>
        </section>
      )}
    </main>
  )
}

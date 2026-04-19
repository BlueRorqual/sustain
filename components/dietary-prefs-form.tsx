'use client'
import { useState } from 'react'
import type { DietaryPrefs } from '@/types'

type Props = {
  initial?: DietaryPrefs
  onSave: (prefs: DietaryPrefs) => void
}

export function DietaryPrefsForm({ initial, onSave }: Props) {
  const [vegan, setVegan] = useState(initial?.vegan ?? false)
  const [glutenFree, setGlutenFree] = useState(initial?.glutenFree ?? false)
  const [allergyInput, setAllergyInput] = useState(initial?.allergies.join(', ') ?? '')

  const handleSave = () => {
    const allergies = allergyInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    onSave({ vegan, glutenFree, allergies })
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={vegan}
          onChange={(e) => setVegan(e.target.checked)}
          className="h-4 w-4 accent-green-500"
        />
        <span className="text-sm">Vegan</span>
      </label>
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={glutenFree}
          onChange={(e) => setGlutenFree(e.target.checked)}
          className="h-4 w-4 accent-green-500"
        />
        <span className="text-sm">Gluten-free</span>
      </label>
      <div>
        <label className="mb-1 block text-xs text-slate-400">Allergies (comma-separated)</label>
        <input
          value={allergyInput}
          onChange={(e) => setAllergyInput(e.target.value)}
          placeholder="nuts, soy, dairy"
          className="w-full rounded-md bg-slate-800 px-3 py-2 text-sm outline-none"
        />
      </div>
      <button
        onClick={handleSave}
        className="rounded-lg bg-green-600 py-2.5 text-sm font-medium"
      >
        Save preferences
      </button>
    </div>
  )
}

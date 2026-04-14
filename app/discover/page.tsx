'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserPrefs } from '@/hooks/use-user-prefs'
import { useSeasonalProduce } from '@/hooks/use-seasonal-produce'
import { useGroceryList } from '@/hooks/use-grocery-list'
import { ProduceCard } from '@/components/produce-card'
import type { ProduceItem } from '@/types'

export default function DiscoverPage() {
  const router = useRouter()
  const { prefs } = useUserPrefs()
  const { state, refetch } = useSeasonalProduce(prefs.updatedAt > 0 ? prefs : null)
  const { createList, addItem } = useGroceryList()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [activeListId, setActiveListId] = useState<string | null>(null)

  async function ensureList() {
    if (activeListId) return activeListId
    const list = await createList(`Week of ${new Date().toLocaleDateString()}`)
    setActiveListId(list.id)
    return list.id
  }

  async function handleToggle(item: ProduceItem) {
    const key = item.name
    if (selected.has(key)) {
      setSelected((s) => { const n = new Set(s); n.delete(key); return n })
    } else {
      setSelected((s) => new Set(s).add(key))
      await ensureList()
      await addItem({
        name: item.name,
        category: item.category,
        localSource: item.localSource ?? '',
        quantity: 1,
        unit: 'unit',
      })
    }
  }

  if (state.status === 'idle' || state.status === 'loading') {
    return (
      <main className="mx-auto max-w-md px-4 py-8">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-800" />
          ))}
        </div>
      </main>
    )
  }

  if (state.status === 'error' && !state.cached) {
    return (
      <main className="mx-auto max-w-md px-4 py-8 text-center">
        <p className="text-slate-400">Could not load produce recommendations.</p>
        <button onClick={refetch} className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-sm">
          Try again
        </button>
      </main>
    )
  }

  const items = state.status === 'resolved' ? state.items : (state.cached ?? [])

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">In season near you</h1>
          <p className="text-xs text-slate-500">{prefs.location.city}, {prefs.location.region}</p>
        </div>
        <button onClick={refetch} className="text-xs text-slate-400 underline">Refresh</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <ProduceCard
            key={item.name}
            item={item}
            selected={selected.has(item.name)}
            onToggle={() => handleToggle(item)}
          />
        ))}
      </div>

      {selected.size > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4">
          <button
            onClick={() => router.push('/grocery')}
            className="rounded-full bg-green-600 px-6 py-3 font-medium shadow-lg"
          >
            View grocery list ({selected.size} items)
          </button>
        </div>
      )}
    </main>
  )
}

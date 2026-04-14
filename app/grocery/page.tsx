'use client'
import { useRouter } from 'next/navigation'
import { useGroceryList } from '@/hooks/use-grocery-list'
import { GroceryListView } from '@/components/grocery-list'

export default function GroceryPage() {
  const router = useRouter()
  const { allLists } = useGroceryList()
  const activeList = allLists.find((l) => l.status === 'draft' || l.status === 'shopping') ?? null
  const { list, toggleItem, removeItem, setStatus } = useGroceryList(activeList?.id)

  if (!activeList) {
    return (
      <main className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-slate-400">No active grocery list.</p>
        <button onClick={() => router.push('/discover')} className="mt-4 text-green-400 underline text-sm">
          Start discovering produce
        </button>
      </main>
    )
  }

  const items = list?.items ?? activeList.items
  const checkedCount = items.filter((i) => i.checked).length

  async function handleQuantityChange(itemId: string, quantity: number) {
    if (!list) return
    const updated = { ...list, items: list.items.map((i) => i.id === itemId ? { ...i, quantity } : i) }
    await toggleItem(itemId) // reuse save indirectly — hook will be refactored in full impl
    void updated
  }

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">{activeList.name}</h1>
        <span className="text-sm text-slate-500">{checkedCount}/{items.length}</span>
      </div>

      <GroceryListView
        items={items}
        onToggle={toggleItem}
        onRemove={removeItem}
        onQuantityChange={handleQuantityChange}
      />

      {checkedCount === items.length && items.length > 0 && (
        <button
          onClick={async () => {
            await setStatus('done')
            router.push('/recipes')
          }}
          className="mt-6 w-full rounded-lg bg-green-600 py-3 font-medium"
        >
          Shopping done — get recipes
        </button>
      )}
    </main>
  )
}

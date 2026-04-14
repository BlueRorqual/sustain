'use client'
import type { GroceryItem } from '@/types'

type Props = {
  items: GroceryItem[]
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  onQuantityChange: (id: string, quantity: number) => void
}

export function GroceryListView({ items, onToggle, onRemove, onQuantityChange }: Props) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        No items yet — add produce from the Discover tab.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li
          key={item.id}
          className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
            item.checked ? 'border-slate-800 bg-slate-900 opacity-60' : 'border-slate-700 bg-slate-900'
          }`}
        >
          <button
            onClick={() => onToggle(item.id)}
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
              item.checked ? 'border-green-500 bg-green-500' : 'border-slate-500'
            }`}
          >
            {item.checked && (
              <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            )}
          </button>
          <span className={`flex-1 text-sm ${item.checked ? 'line-through text-slate-500' : ''}`}>
            {item.name}
          </span>
          <input
            type="number"
            min={1}
            value={item.quantity}
            onChange={(e) => onQuantityChange(item.id, Number(e.target.value))}
            className="w-12 rounded bg-slate-800 px-1 py-0.5 text-center text-sm"
          />
          <span className="text-xs text-slate-500">{item.unit}</span>
          <button
            onClick={() => onRemove(item.id)}
            className="text-slate-600 hover:text-red-400"
            aria-label="Remove item"
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  )
}

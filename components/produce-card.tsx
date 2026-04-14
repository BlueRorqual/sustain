import type { ProduceItem } from '@/types'

const CATEGORY_STYLES = {
  vegetable: 'bg-green-900 text-green-300',
  fruit: 'bg-orange-900 text-orange-300',
  staple: 'bg-amber-900 text-amber-300',
}

type Props = {
  item: ProduceItem
  selected: boolean
  onToggle: () => void
}

export function ProduceCard({ item, selected, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className={`w-full rounded-xl border p-4 text-left transition-colors ${
        selected
          ? 'border-green-500 bg-green-950'
          : 'border-slate-700 bg-slate-900 hover:border-slate-500'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium">{item.name}</h3>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_STYLES[item.category]}`}>
          {item.category}
        </span>
      </div>
      {item.localSource && (
        <p className="mt-1 text-xs text-green-400">at {item.localSource}</p>
      )}
      <p className="mt-2 text-xs text-slate-400">{item.whyLocal}</p>
      <p className="mt-1 text-xs text-slate-500 italic">{item.sustainabilityTip}</p>
      {selected && (
        <div className="mt-3 flex items-center gap-1 text-xs text-green-400">
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
          Added to list
        </div>
      )}
    </button>
  )
}

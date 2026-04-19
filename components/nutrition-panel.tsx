import type { NutritionData } from '@/types'

type Props = {
  nutrition?: NutritionData
  loading?: boolean
}

export function NutritionPanel({ nutrition, loading }: Props) {
  if (loading) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
        <p className="text-xs text-slate-500 mb-3">Nutritional info</p>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-slate-800" />
          ))}
        </div>
      </div>
    )
  }

  if (!nutrition) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
        <p className="text-xs text-slate-500">Nutritional info unavailable</p>
      </div>
    )
  }

  const macros = [
    { label: 'Calories', value: nutrition.calories, unit: 'kcal' },
    { label: 'Protein', value: nutrition.protein, unit: 'g' },
    { label: 'Carbs', value: nutrition.carbs, unit: 'g' },
    { label: 'Fat', value: nutrition.fat, unit: 'g' },
    { label: 'Fiber', value: nutrition.fiber, unit: 'g' },
    { label: 'Sodium', value: nutrition.sodium, unit: 'mg' },
  ]

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
      <p className="text-xs font-medium text-slate-400 mb-3 uppercase tracking-wide">Nutritional info per serving</p>
      <div className="grid grid-cols-3 gap-2">
        {macros.map(({ label, value, unit }) => (
          <div key={label} className="rounded-md bg-slate-800 p-2 text-center">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="font-semibold">{value}</p>
            <p className="text-xs text-slate-600">{unit}</p>
          </div>
        ))}
      </div>
      {nutrition.vitamins.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {nutrition.vitamins.map((v) => (
            <span key={v.name} className="text-xs text-slate-500">
              {v.name}: {v.amount}{v.unit}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

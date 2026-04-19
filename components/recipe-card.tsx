import Link from 'next/link'
import type { Recipe } from '@/types'

// Accept any object shape — streaming partials are deeply nested
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props = {
  recipe: Record<string, any>
  isStreaming?: boolean
  recipeId?: string
}

export function RecipeCard({ recipe, isStreaming, recipeId }: Props) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
      <div className="flex items-start justify-between gap-2">
        {recipe.title
          ? <h3 className="text-lg font-semibold">{recipe.title}</h3>
          : <span className="animate-pulse bg-slate-700 rounded h-5 w-40 block" />
        }
        {isStreaming && <span className="text-xs text-green-400 animate-pulse">generating…</span>}
      </div>

      {recipe.description && (
        <p className="mt-2 text-sm text-slate-400">{recipe.description}</p>
      )}

      <div className="mt-3 flex gap-4 text-xs text-slate-500">
        {recipe.prepTime !== undefined && <span>Prep: {recipe.prepTime}m</span>}
        {recipe.cookTime !== undefined && <span>Cook: {recipe.cookTime}m</span>}
        {recipe.servings !== undefined && <span>Serves: {recipe.servings}</span>}
      </div>

      {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {(recipe.dietaryTags as string[]).map((tag) => (
            <span key={tag} className="rounded-full bg-green-900 px-2 py-0.5 text-xs text-green-300">
              {tag}
            </span>
          ))}
        </div>
      )}

      {recipeId && !isStreaming && (
        <Link
          href={`/recipe/${recipeId}`}
          className="mt-4 block rounded-lg bg-slate-800 py-2 text-center text-sm font-medium hover:bg-slate-700"
        >
          View full recipe
        </Link>
      )}
    </div>
  )
}

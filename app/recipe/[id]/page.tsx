'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { db } from '@/lib/db'
import { NutritionPanel } from '@/components/nutrition-panel'
import type { Recipe } from '@/types'

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [recipe, setRecipe] = useState<Recipe | null>(null)

  useEffect(() => {
    db.recipes.get(id).then((r) => setRecipe(r ?? null))
  }, [id])

  if (!recipe) {
    return (
      <main className="mx-auto max-w-md px-4 py-8">
        <div className="animate-pulse h-40 rounded-xl bg-slate-800" />
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <h1 className="text-2xl font-bold">{recipe.title}</h1>
      <p className="mt-2 text-slate-400 text-sm">{recipe.description}</p>

      <div className="mt-4 flex gap-4 text-xs text-slate-500">
        <span>Prep: {recipe.prepTime}m</span>
        <span>Cook: {recipe.cookTime}m</span>
        <span>Serves: {recipe.servings}</span>
      </div>

      {recipe.dietaryTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {recipe.dietaryTags.map((tag) => (
            <span key={tag} className="rounded-full bg-green-900 px-2 py-0.5 text-xs text-green-300">
              {tag}
            </span>
          ))}
        </div>
      )}

      <section className="mt-6">
        <h2 className="mb-3 font-semibold">Ingredients</h2>
        <ul className="flex flex-col gap-1">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="flex justify-between text-sm">
              <span>{ing.name}</span>
              <span className="text-slate-500">{ing.quantity} {ing.unit}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 font-semibold">Instructions</h2>
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{recipe.instructions}</ReactMarkdown>
        </div>
      </section>

      <section className="mt-6">
        <NutritionPanel nutrition={recipe.nutrition} loading={!recipe.nutrition} />
      </section>
    </main>
  )
}

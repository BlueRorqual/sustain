'use client'
import { useGroceryList } from '@/hooks/use-grocery-list'
import { useRecipes } from '@/hooks/use-recipes'
import { useUserPrefs } from '@/hooks/use-user-prefs'
import { RecipeCard } from '@/components/recipe-card'

export default function RecipesPage() {
  const { prefs } = useUserPrefs()
  const { allLists } = useGroceryList()
  const doneList = allLists.find((l) => l.status === 'done')
  const { streamingRecipes, savedRecipes, isGenerating, generateRecipes } =
    useRecipes(doneList?.id ?? '')

  const checkedItems = doneList?.items.filter((i) => i.checked) ?? []

  if (!doneList || checkedItems.length === 0) {
    return (
      <main className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-slate-400">Finish shopping first to get recipes.</p>
      </main>
    )
  }

  const displayRecipes = savedRecipes.length > 0 ? savedRecipes : streamingRecipes

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Your recipes</h1>
        {!isGenerating && displayRecipes.length === 0 && (
          <button
            onClick={() => generateRecipes(checkedItems, prefs.dietary)}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium"
          >
            Generate recipes
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {(displayRecipes as object[]).filter(Boolean).map((recipe, i) => (
          <RecipeCard
            key={savedRecipes[i]?.id ?? i}
            recipe={recipe}
            isStreaming={isGenerating && savedRecipes.length === 0}
            recipeId={savedRecipes[i]?.id}
          />
        ))}
        {isGenerating && displayRecipes.length === 0 && (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-800" />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

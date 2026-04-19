'use client'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useEffect } from 'react'
import { useUserPrefs } from '@/hooks/use-user-prefs'
import { DietaryPrefsForm } from '@/components/dietary-prefs-form'
import { useGroceryList } from '@/hooks/use-grocery-list'
import { pushToCloud, pullFromCloud } from '@/lib/sync'
import type { DietaryPrefs } from '@/types'

export default function ProfilePage() {
  const { data: session } = useSession()
  const { prefs, updateDietary } = useUserPrefs()
  const { allLists } = useGroceryList()

  useEffect(() => {
    if (session) pullFromCloud()
  }, [session])

  async function handleDietaryUpdate(dietary: DietaryPrefs) {
    await updateDietary(dietary)
    if (session) pushToCloud()
  }

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">Profile</h1>

      {session ? (
        <div className="mb-6 rounded-lg border border-slate-700 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">Signed in as</p>
          <p className="font-medium">{session.user?.email}</p>
          <button
            onClick={() => signOut()}
            className="mt-3 text-sm text-red-400 underline"
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="mb-6 rounded-lg border border-slate-700 bg-slate-900 p-4">
          <p className="text-sm text-slate-400 mb-3">Sign in to sync your lists across devices.</p>
          <button
            onClick={() => signIn('google')}
            className="w-full rounded-lg bg-white py-2.5 text-sm font-medium text-slate-900"
          >
            Continue with Google
          </button>
        </div>
      )}

      <section className="mb-6">
        <h2 className="mb-4 font-semibold">Dietary preferences</h2>
        <DietaryPrefsForm initial={prefs.dietary} onSave={handleDietaryUpdate} />
      </section>

      <section>
        <h2 className="mb-3 font-semibold">History</h2>
        {allLists.length === 0 ? (
          <p className="text-sm text-slate-500">No grocery lists yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {allLists.map((l) => (
              <li key={l.id} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 p-3">
                <span className="text-sm">{l.name}</span>
                <span className="text-xs text-slate-500">{l.items.length} items</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

'use client'
import { useOnlineStatus } from '@/hooks/use-online-status'

export function OfflineBanner() {
  const online = useOnlineStatus()
  if (online) return null
  return (
    <div className="fixed left-0 right-0 top-0 z-50 bg-slate-800 px-4 py-2 text-center text-sm text-slate-300">
      You're offline — AI features unavailable, local data still works
    </div>
  )
}

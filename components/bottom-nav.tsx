'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/discover', label: 'Discover', icon: '🌱' },
  { href: '/grocery', label: 'Grocery', icon: '🛒' },
  { href: '/recipes', label: 'Recipes', icon: '🍳' },
  { href: '/markets', label: 'Markets', icon: '📍' },
  { href: '/profile', label: 'Profile', icon: '👤' },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-950">
      <ul className="mx-auto flex max-w-md justify-around">
        {links.map(({ href, label, icon }) => {
          const active = pathname === href
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 px-3 py-3 text-xs ${
                  active ? 'text-green-400' : 'text-slate-500'
                }`}
              >
                <span className="text-xl leading-none">{icon}</span>
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

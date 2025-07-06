'use client'

import Link from 'next/link'
import { Switch } from '@/components/ui/switch'

export default function HeaderBar({
  dark,
  onToggleDark,
}: {
  dark: boolean
  onToggleDark: () => void
}) {
  return (
    <header className="bg-card border-b px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Left - Logo */}
        <h1 className="text-2xl font-bold text-green-400">PokerProfile</h1>

        {/* Center - Navigation */}
        <nav className="flex gap-6 text-m font-medium">
          <Link href="/search" className="text-blue-300 hover:text-blue-100">
            Search
          </Link>
          <Link href="/watchlist" className="text-blue-300 hover:text-blue-100">
            Watchlist
          </Link>
        </nav>

        {/* Right - Toggle theme */}
        <div className="flex items-center gap-2">
          <span className="text-m text-muted-foreground">{dark ? 'Dark' : 'Light'}</span>
          <Switch checked={dark} onCheckedChange={onToggleDark} />
        </div>
      </div>
    </header>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, User, LogOut } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabaseClient'
import { useUser } from '@/lib/user-session'
import SearchResults, { PlayerResult } from './SearchResults'

interface Props {
  onSearchSelect: (p: PlayerResult) => void
  onClearWatchlist: () => void
}

export default function WatchlistHeader({
  onSearchSelect,
  onClearWatchlist,
}: Props) {
  const router = useRouter()
  const { session } = useUser()
  const token = session?.access_token ?? ''
  const [term, setTerm] = useState('')
  const [results, setResults] = useState<PlayerResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!term.trim()) {
      setResults([])
      return
    }
    const t = setTimeout(async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('player_aliases')
        .select('username, platform')
        .ilike('username', `%${term.trim()}%`)
        .limit(5)
      setResults(error ? [] : data || [])
      setLoading(false)
    }, 300)
    return () => clearTimeout(t)
  }, [term])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
      <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold whitespace-nowrap">
          <span className="text-green-400">Poker</span>
          <span className="text-white">Genie</span>
        </Link>

        {/* Search */}
        <div className="relative flex-1 mx-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search any poker player..."
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="pl-10 pr-4 bg-slate-700 border-slate-600 placeholder-slate-400 focus:border-green-400 focus:ring-green-400"
          />
          {results.length > 0 && (
            <SearchResults
              results={results}
              onSelect={(p) => {
                onSearchSelect(p)
                setTerm('')
              }}
            />
          )}
        </div>

        {/* Clear & Profile/Logout */}
        <div className="flex items-center gap-4">
          <button
            onClick={onClearWatchlist}
            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded"
          >
            Clear
          </button>
          <User className="h-6 w-6 text-gray-300" />
          <LogOut
            onClick={handleLogout}
            className="h-6 w-6 text-gray-300 cursor-pointer hover:text-white"
          />
        </div>
      </div>
    </header>
  )
}

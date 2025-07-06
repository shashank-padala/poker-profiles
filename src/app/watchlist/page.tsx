'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useUser } from '@/lib/user-session'
import WatchlistHeader from '@/components/WatchlistHeader'
import PlayerCard, { Player } from '@/components/PlayerCard/PlayerCard'
import { Loader } from '@/components/ui/loader'

export default function WatchlistPage() {
  const { accessToken, user } = useUser()
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWatchlist = async () => {
    if (!accessToken) return
    setLoading(true)

    // 1️⃣ Get watched player IDs from your API
    const res = await fetch('/api/watchlist', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) {
      console.warn('Failed to fetch watchlist')
      setPlayers([])
      setLoading(false)
      return
    }
    const ids: number[] = await res.json()
    if (ids.length === 0) {
      setPlayers([])
      setLoading(false)
      return
    }

    // 2️⃣ Resolve IDs to usernames via player_aliases
    const { data: aliases, error } = await supabase
      .from('player_aliases')
      .select('username')
      .in('player_id', ids)
    if (error || !aliases) {
      console.warn('Failed to fetch player aliases', error)
      setPlayers([])
      setLoading(false)
      return
    }

    // 3️⃣ Update state with valid usernames
    setPlayers(
      aliases.map((a) => ({
        username: a.username,
      }))
    )
    setLoading(false)
  }

  useEffect(() => {
    if (accessToken) fetchWatchlist()
  }, [accessToken])

  // Add from header
  const handleSearchSelect = async (p: { username: string }) => {
    if (!accessToken) return
    await fetch('/api/watchlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ username: p.username }),
    })
    await fetchWatchlist()
  }

  // Clear all
  const handleClear = async () => {
    if (!user) return
    // You can bulk-delete via your API or Supabase client
    await supabase.from('user_watchlist').delete().eq('user_id', user.id)
    setPlayers([])
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <WatchlistHeader
        onSearchSelect={handleSearchSelect}
        onClearWatchlist={handleClear}
      />

      <main className="w-full mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader />
          </div>
        ) : players.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            Your watchlist is empty. Search above to add players.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {players.map((pl) => (
              <PlayerCard
                key={pl.username}
                player={pl}
                accessToken={accessToken || undefined}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

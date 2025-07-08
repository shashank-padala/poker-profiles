'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useUser } from '@/lib/user-session'
import WatchlistHeader from '@/components/WatchlistHeader'
import PlayerCard, { Player } from '@/components/PlayerCard/PlayerCard'
import { Loader } from '@/components/ui/loader'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd'

export default function WatchlistPage() {
  const { accessToken, user } = useUser()
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  // 1️⃣ Initial load
  const fetchWatchlist = useCallback(async () => {
    if (!accessToken) return
    setLoading(true)
    try {
      const res = await fetch('/api/watchlist', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) throw new Error('Failed to fetch watchlist')
      const ids: number[] = await res.json()
      if (ids.length === 0) {
        setPlayers([])
      } else {
        const { data: aliases, error } = await supabase
          .from('player_aliases')
          .select('username')
          .in('player_id', ids)
        if (error) throw error
        setPlayers(aliases.map((a) => ({ username: a.username })))
      }
    } catch (err) {
      console.warn(err)
      setPlayers([])
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    if (accessToken) fetchWatchlist()
  }, [accessToken, fetchWatchlist])

  // 2️⃣ Add new player (optimistic)
  const handleSearchSelect = useCallback(
    async (p: { username: string }) => {
      if (!accessToken) return
      setPlayers((prev) => [
        { username: p.username },
        ...prev.filter((pl) => pl.username !== p.username),
      ])
      try {
        await fetch('/api/watchlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ username: p.username }),
        })
      } catch (err) {
        console.warn('Failed to add to watchlist', err)
      }
    },
    [accessToken]
  )

  // 3️⃣ Remove player (optimistic)
  const handleRemove = useCallback(
    async (username: string) => {
      if (!user || !accessToken) return
      setPlayers((prev) => prev.filter((pl) => pl.username !== username))
      try {
        await fetch('/api/watchlist', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ username }),
        })
      } catch (err) {
        console.warn('Failed to remove from watchlist', err)
      }
    },
    [accessToken, user]
  )

  // 4️⃣ Clear all (optimistic + API)
  const handleClear = useCallback(async () => {
    if (!user || !accessToken) return
    setPlayers([])
    try {
      await fetch('/api/watchlist', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    } catch (err) {
      console.warn('Failed to clear watchlist', err)
    }
  }, [accessToken, user])

  // 5️⃣ Drag & drop reorder + persist
  const onDragEnd = useCallback(
    async (result: DropResult) => {
      if (!result.destination) return
      const reordered = Array.from(players)
      const [moved] = reordered.splice(result.source.index, 1)
      reordered.splice(result.destination.index, 0, moved)
      setPlayers(reordered)

      try {
        await fetch('/api/watchlist/order', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            order: reordered.map((p) => p.username),
          }),
        })
      } catch (err) {
        console.warn('Failed to persist watchlist order', err)
      }
    },
    [players, accessToken]
  )

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
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="watchlist" direction="horizontal">
              {(provided) => (
                <div
                  className="grid grid-flow-row-dense grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {players.map((pl, index) => (
                    <Draggable
                      key={pl.username}
                      draggableId={pl.username}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <PlayerCard
                            player={pl}
                            accessToken={accessToken || undefined}
                            onRemove={() => handleRemove(pl.username)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </main>
    </div>
  )
}

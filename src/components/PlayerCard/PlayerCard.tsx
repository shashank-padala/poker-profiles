// app/components/PlayerCard.tsx

'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, ChangeEvent } from 'react'
import { Bookmark, Eye, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'

import Section from './Section'
import NotesSection from './NotesSection'

export interface Player {
  username: string
  notes?: string
}

interface StatItem {
  label: string
  value: string
}

interface ProfileData {
  player_tags: string[] | null
  exploit_strategy: string[] | null
  profile_summary: string | null
  stats: {
    preflop: StatItem[]
    postflop: StatItem[]
    tournament: StatItem[]
  } | null
}

export default function PlayerCard({
  player,
  accessToken,
  compact = false,
  onRemove,
}: {
  player: Player
  accessToken?: string
  compact?: boolean
  onRemove?: () => void
}) {
  const router = useRouter()
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isWatchlisted, setIsWatchlisted] = useState(false)
  const [notes, setNotes] = useState(player.notes ?? '')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
  }

  useEffect(() => {
    setLoading(true)
    fetch(`/api/player/${player.username}`, { headers })
      .then((r) => r.json())
      .then((json) => {
        setData(json.profile)
        setIsWatchlisted(json.isWatchlisted)
        if (!player.notes) setNotes(json.userNote ?? '')
      })
      .finally(() => setLoading(false))
  }, [player.username, player.notes, accessToken])

  const toggleWatch = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const method = isWatchlisted ? 'DELETE' : 'POST'

    // update backend
    await fetch('/api/watchlist', {
      method,
      headers,
      body: JSON.stringify({ username: player.username }),
    })

    // flip local state
    setIsWatchlisted(!isWatchlisted)

    if (method === 'DELETE') {
      // when removing, tell parent to drop this card
      onRemove?.()
    } else {
      // when adding, you can still refresh or let parent handle it
      router.refresh()
    }
  }

  const handleSaveNote = async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    await fetch('/api/notes', {
      method: 'POST',
      headers,
      body: JSON.stringify({ username: player.username, note: draft }),
    })
    setEditing(false)
    const res = await fetch(`/api/notes?username=${player.username}`, { headers })
    const { note } = await res.json()
    setNotes(note)
  }

  const handleStartEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setDraft(notes)
    setEditing(true)
  }
  const handleDraftChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setDraft(e.target.value)
  const handleCancelEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setEditing(false)
  }

  if (loading)
    return (
      <Card>
        <CardContent>Loading…</CardContent>
      </Card>
    )
  if (!data)
    return (
      <Card>
        <CardContent>No data available for this player.</CardContent>
      </Card>
    )

  const tags = data.player_tags ?? []
  const strategy = data.exploit_strategy ?? []
  const summary = data.profile_summary ?? ''
  const stats = data.stats!

  // utility formatters
  const formatPct = (raw: string) =>
    `${Math.round(parseFloat(raw.replace('%', '')))}%`

  const formatNum = (raw: string) =>
    parseInt(raw, 10).toLocaleString()

  const formatROI = (raw: string) => {
    const n = Math.round(parseFloat(raw) * 100)
    const sign = n > 0 ? '+' : ''
    return `${sign}${n}%`
  }

  // chunk into two rows of three
  const chunk3 = (arr: StatItem[]) => [arr.slice(0, 3), arr.slice(3, 6)]

  // color map for tags
  const tagColorMap: Record<string, string> = {
    TAG: 'bg-red-600 text-white',
    NIT: 'bg-orange-500 text-white',
    LAG: 'bg-yellow-300 text-black',
    Fish: 'bg-green-500 text-white',
    'Weak Reg': 'bg-green-500 text-white',
    'Calling Station': 'bg-sky-500 text-white',
    'Volatile Fish': 'bg-pink-400 text-white',
    'Elite/GTO': 'bg-blue-900 text-white',
  }

  

  // compact view omitted for brevity...

  return (
    <Card className="bg-card border-border hover:border-green-400 hover:shadow-lg hover:shadow-green-400/20 w-full">
      {/* — Header & actions — */}
      <CardHeader className="flex justify-between items-center p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
            {player.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-green-400">{player.username}</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {tags.map((t) => (
                <Badge key={t} className={tagColorMap[t] ?? 'bg-slate-600 text-white'}>
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Summary */}
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-green-500 text-white hover:bg-green-600">
                Summary
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Profile Summary</DialogTitle>
              </DialogHeader>
              <Section
                title="📋 Profile Summary"
                variant="blue"
                onCopy={() => navigator.clipboard.writeText(summary)}
              >
                {summary || 'No summary available.'}
              </Section>
              <DialogClose asChild>
                <Button size="sm" className="mt-4 w-full">
                  Close
                </Button>
              </DialogClose>
            </DialogContent>
          </Dialog>

          {/* Exploit */}
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-orange-500 text-white hover:bg-orange-600">
                Exploit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Exploit for {player.username}</DialogTitle>
              </DialogHeader>
              <Section
                title="🎯 Strategy"
                variant="orange"
                onCopy={() => navigator.clipboard.writeText(strategy.join('\n'))}
              >
                {strategy.length > 0 ? (
                  strategy.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span>•</span>
                      <span className="text-sm text-muted-foreground">{s}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No strategy available.</p>
                )}
              </Section>
              <DialogClose asChild>
                <Button size="sm" className="mt-4 w-full">
                  Close
                </Button>
              </DialogClose>
            </DialogContent>
          </Dialog>

          {/* Profile & Bookmark */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/player/${player.username}`)}
            title="Profile"
          >
            <Eye />
          </Button>
          <Button size="sm" variant="ghost" onClick={toggleWatch} title={isWatchlisted ? 'Unbookmark' : 'Bookmark'}>
            <Bookmark
              className={`transition ${
                isWatchlisted ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'
              }`}
            />
          </Button>
          {onRemove && (
            <Button size="sm" variant="ghost" onClick={onRemove} title="Remove from watchlist">
              <Trash2 className="text-red-400 hover:text-red-300" />
            </Button>
          )}
        </div>
      </CardHeader>

      {/* — Stats Card + Notes — */}
      <CardContent className="space-y-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          {/* Preflop */}
          <div>
            <h4 className="text-lg font-semibold text-green-400">♠️ Preflop</h4>
            {chunk3(stats.preflop).map((row, i) => (
              <div key={i} className="grid grid-cols-3 gap-4 mt-2 text-m text-gray-200">
                {row.map((s) => (
                  <div key={s.label}>
                    <span className="text-slate-400">{s.label}:</span>{' '}
                    <span className="text-base font-bold text-white">{formatPct(s.value)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <hr className="my-3 border-gray-700" />

          {/* Postflop */}
          <div>
            <h4 className="text-lg font-semibold text-blue-400">🧠 Postflop</h4>
            {chunk3(stats.postflop).map((row, i) => (
              <div key={i} className="grid grid-cols-3 gap-4 mt-2 text-m text-gray-200">
                {row.map((s) => (
                  <div key={s.label}>
                    <span className="text-slate-400">{s.label}:</span>{' '}
                    <span className="text-base font-bold text-white">{formatPct(s.value)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <hr className="my-3 border-gray-700" />

          {/* Tournament */}
          <div>
            <h4 className="text-lg font-semibold text-yellow-300">🏆 Tournament</h4>
            <div className="mt-2 text-m text-gray-200 flex flex-wrap gap-x-6 gap-y-2">
              {stats.tournament.map((s) => {
                let disp: string
                if (s.label === 'Total Tournaments' || s.label === 'Avg Buy-In') {
                  disp = formatNum(s.value)
                } else {
                  disp = formatROI(s.value)
                }
                return (
                  <div key={s.label}>
                    <span className="text-slate-400">{s.label}:</span>{' '}
                    {s.label === 'ROI' ? (
                      <span
                        className={`text-base font-bold ${
                          disp.startsWith('+') ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {disp}
                      </span>
                    ) : (
                      <span className="text-base font-bold text-white">{disp}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <NotesSection
          notes={notes}
          editing={editing}
          draft={draft}
          onStartEdit={handleStartEdit}
          onDraftChange={handleDraftChange}
          onSave={handleSaveNote}
          onCancel={handleCancelEdit}
        />
      </CardContent>

    </Card>
  )
}

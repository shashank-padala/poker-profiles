'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, ChangeEvent } from 'react'
import { Bookmark, Eye } from 'lucide-react'
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
import StatsBlock from './StatsBlock'

export interface Player {
  username: string
  notes?: string
}

interface ProfileData {
  player_tags: string[] | null
  exploit_strategy: string[] | null
  profile_summary: string | null
  stats: {
    preflop: { label: string; value: string }[] | null
    postflop: { label: string; value: string }[] | null
  } | null
}

export default function PlayerCard({ player, accessToken, compact = false }: { player: Player; accessToken?: string; compact?: boolean }) {
  const router = useRouter()
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  const [isWatchlisted, setIsWatchlisted] = useState(false)
  const [notes, setNotes] = useState(player.notes ?? '')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const headers = { 'Content-Type': 'application/json', ...(accessToken && { Authorization: `Bearer ${accessToken}` }) }

  useEffect(() => {
    setLoading(true)
    fetch(`/api/player/${player.username}`, { headers })
      .then(r => r.json())
      .then(json => {
        setData(json?.profile ?? null)
        setIsWatchlisted(json?.isWatchlisted ?? false)
        if (!player.notes) setNotes(json?.userNote ?? '')
      })
      .finally(() => setLoading(false))
  }, [player.username, player.notes, accessToken])

  const refreshNote = async () => {
    const res = await fetch(`/api/notes?username=${player.username}`, { headers })
    const { note } = await res.json()
    setNotes(note)
  }

  const toggleWatch = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const method = isWatchlisted ? 'DELETE' : 'POST'
    await fetch('/api/watchlist', { method, headers, body: JSON.stringify({ username: player.username }) })
    setIsWatchlisted(!isWatchlisted)
  }

  const handleSaveNote = async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    await fetch('/api/notes', { method: 'POST', headers, body: JSON.stringify({ username: player.username, note: draft }) })
    setEditing(false)
    await refreshNote()
  }

  const handleStartEdit = (e?: React.MouseEvent) => { e?.stopPropagation(); setDraft(notes); setEditing(true) }
  const handleDraftChange = (e: ChangeEvent<HTMLTextAreaElement>) => setDraft(e.target.value)
  const handleCancelEdit = (e?: React.MouseEvent) => { e?.stopPropagation(); setEditing(false) }

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

  if (loading) return <Card><CardContent>Loading…</CardContent></Card>
  if (!data) return <Card><CardContent>No data available for this player.</CardContent></Card>

  const tags = data.player_tags ?? []
  const strategy = data.exploit_strategy ?? []
  const preflop = data.stats?.preflop ?? []
  const postflop = data.stats?.postflop ?? []
  const summary = data.profile_summary ?? ''

  // Compact view
  if (compact) {
    return (
      <Card className="bg-card border-border w-full">
        <CardHeader className="flex justify-between items-center p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
              {player.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-semibold text-green-400">{player.username}</h3>
              {tags.length > 0 && (
                <Badge className={tagColorMap[tags[0]]}>{tags[0]}</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => router.push(`/player/${player.username}`)} title="Profile"><Eye /></Button>
            <Button size="sm" variant="ghost" onClick={toggleWatch} title={isWatchlisted ? 'Unbookmark' : 'Bookmark'}>
              <Bookmark className={isWatchlisted ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'} />
            </Button>
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border hover:border-green-400 hover:shadow-lg hover:shadow-green-400/20 w-full">
      <CardHeader className="flex justify-between items-center p-4">
        {/* Left: avatar, name, tags */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
            {player.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-green-400">{player.username}</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {tags.map(t => (
                <Badge key={t} className={tagColorMap[t] ?? 'bg-slate-600 text-white'}>{t}</Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-green-500 text-white hover:bg-green-600">View Stats</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Stats for {player.username}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <StatsBlock title="♠️ Preflop" stats={preflop} borderColor="border-red-500/20" from="from-red-500/10" to="to-blue-500/10" />
                <StatsBlock title="🧠 Postflop" stats={postflop} borderColor="border-purple-500/20" from="from-purple-500/10" to="to-pink-500/10" />
              </div>
              <DialogClose asChild>
                <Button size="sm" className="mt-4 w-full">Close</Button>
              </DialogClose>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-orange-500 text-white hover:bg-orange-600">Exploit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Exploit for {player.username}</DialogTitle></DialogHeader>
              <Section title="🎯 Strategy" variant="orange" onCopy={() => navigator.clipboard.writeText(strategy.join('\n'))}>
                {strategy.length > 0 ? (
                  strategy.map((s, i) => (
                    <div key={i} className="flex items-start gap-2"><span>•</span><span className="text-sm text-muted-foreground">{s}</span></div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No strategy available.</p>
                )}
              </Section>
              <DialogClose asChild>
                <Button size="sm" className="mt-4 w-full">Close</Button>
              </DialogClose>
            </DialogContent>
          </Dialog>

          <Button size="sm" variant="ghost" onClick={() => router.push(`/player/${player.username}`)} title="Profile"><Eye /></Button>
          <Button size="sm" variant="ghost" onClick={toggleWatch} title={isWatchlisted ? 'Unbookmark' : 'Bookmark'}>
            <Bookmark className={`transition-colors ${isWatchlisted ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Section title="📋 Profile Summary" variant="blue" onCopy={() => navigator.clipboard.writeText(summary)}>
          {summary || 'No summary available.'}
        </Section>
        <NotesSection notes={notes} editing={editing} draft={draft} onStartEdit={handleStartEdit} onDraftChange={handleDraftChange} onSave={handleSaveNote} onCancel={handleCancelEdit} />
      </CardContent>
    </Card>
  )
}
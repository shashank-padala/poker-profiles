'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@/lib/user-session'
import { supabase } from '@/lib/supabaseClient'
import { Loader } from '@/components/ui/loader'

import HeaderBar from '@/components/PlayerProfile/HeaderBar'
import SummarySection from '@/components/PlayerProfile/SummarySection'
import NotesSection from '@/components/PlayerProfile/NotesSection'
import ExploitSection from '@/components/PlayerProfile/ExploitSection'
import CommunityReview from '@/components/PlayerProfile/CommunityReview'
import StatsSection from '@/components/PlayerProfile/StatsSection'
import TournamentSection from '@/components/PlayerProfile/TournamentSection'

function parsePct(s: string) {
  const n = parseFloat(s.replace('%', ''))
  return isNaN(n) ? 0 : n
}

export default function PlayerProfilePage() {
  const { username } = useParams()
  const router = useRouter()
  const { accessToken, user } = useUser()

  const [dark, setDark] = useState(true)
  const [loading, setLoading] = useState(true)

  const [profile, setProfile] = useState<{
    player_tags: string[]
    profile_summary: string
    exploit_strategy: string[]
    stats: {
      preflop: { label: string; value: string }[]
      postflop: { label: string; value: string }[]
    }
  } | null>(null)

  const [tourney, setTourney] = useState<{
    total_tournaments: number
    itm_percent: number
    final_table_percent: number
    win_percent: number
  } | null>(null)

  const [communityReview, setCommunityReview] = useState<string[]>([])
  const [userNotes, setUserNotes] = useState('')
  const [editingNotes, setEditingNotes] = useState(false)
  const [isWatchlisted, setIsWatchlisted] = useState(false)

  // normalize param
  const usernameStr = Array.isArray(username) ? username[0] : username ?? ''

  useEffect(() => {
    if (!usernameStr) return

    async function load() {
      setLoading(true)
      const headers: Record<string,string> = {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      }

      // 1) Core profile + stats + userNote + isWatchlisted
      const res = await fetch(`/api/player/${usernameStr}`, { headers })
      if (!res.ok) {
        setLoading(false)
        return
      }
      const json = await res.json()
      setProfile(json.profile)
      setUserNotes(json.userNote ?? '')
      setIsWatchlisted(json.isWatchlisted)

      // 2) Look up player_id via aliases
      const { data: aliasRow } = await supabase
        .from('player_aliases')
        .select('player_id')
        .eq('username', usernameStr)
        .single()
      const pid = aliasRow?.player_id

      if (pid) {
        // 3) Community summary from player_profiles
        const { data: profRow } = await supabase
          .from('player_profiles')
          .select('community_notes_summary')
          .eq('id', pid)
          .single()
        if (profRow?.community_notes_summary) {
          setCommunityReview(
            profRow.community_notes_summary
              .split(/[\.\!]\s*/)
              .filter(Boolean)
          )
        }

        // 4) Tournament stats from player_stats
        const { data: tourRow } = await supabase
          .from('player_stats')
          .select(
            'total_tournaments,itm_percent,final_table_percent,win_percent'
          )
          .eq('player_id', pid)
          .single()
        if (tourRow) {
          setTourney(tourRow)
        }
      }

      setLoading(false)
    }

    load()
  }, [usernameStr, accessToken])

  // toggle watch/unwatch via API
  const toggleWatch = async () => {
    if (!user) {
      router.push('/login')
      return
    }
    const headers: Record<string,string> = {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    }

    await fetch('/api/watchlist', {
      method: isWatchlisted ? 'DELETE' : 'POST',
      headers,
      body: JSON.stringify({ username: usernameStr }),
    })
    // refresh flag
    const res2 = await fetch(`/api/player/${usernameStr}`, { headers })
    const { isWatchlisted: fresh } = await res2.json()
    setIsWatchlisted(fresh)
  }

  // copy summary
  const copySummary = () =>
    profile &&
    navigator.clipboard.writeText(profile.profile_summary)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader />
      </div>
    )
  }
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-2xl">Player not found.</p>
      </div>
    )
  }

  return (
    <div className={dark ? 'dark' : ''}>
      <HeaderBar
        dark={dark}
        onToggleDark={() => setDark(!dark)}
      />

      <main className="bg-background text-foreground transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
          <SummarySection
            username={usernameStr}
            summary={profile.profile_summary}
            tags={profile.player_tags}
            isWatchlisted={isWatchlisted}
            onToggleWatch={toggleWatch}
            onShare={copySummary}
          />

          <NotesSection
            notes={userNotes}
            editing={editingNotes}
            onEdit={() => {
              if (!user) return router.push('/login')
              setEditingNotes(!editingNotes)
            }}
            onChange={setUserNotes}
            onSave={async () => {
              const headers: Record<string,string> = {
                'Content-Type': 'application/json',
                ...(accessToken && {
                  Authorization: `Bearer ${accessToken}`,
                }),
              }
              const res3 = await fetch(`/api/notes`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  username: usernameStr,
                  note: userNotes,
                }),
              })
              if (!res3.ok) {
                console.error('Failed to save note')
                return
              }
              // refresh note from API
              const res4 = await fetch(`/api/player/${usernameStr}`, {
                headers,
              })
              const { userNote } = await res4.json()
              setUserNotes(userNote ?? '')
              setEditingNotes(false)
            }}
          />

          <div className="space-y-8">
            <ExploitSection items={profile.exploit_strategy} />
            <CommunityReview items={communityReview} />

            <StatsSection
              title="Preflop Statistics"
              hands={0} // update as needed
              data={profile.stats.preflop.map((s) => ({
                label: s.label,
                value: parsePct(s.value),
                gto: parsePct(s.value),
              }))}
              colorClass="text-blue-400"
            />

            <StatsSection
              title="Postflop Statistics"
              hands={0}
              data={profile.stats.postflop.map((s) => ({
                label: s.label,
                value: parsePct(s.value),
                gto: parsePct(s.value),
              }))}
              colorClass="text-purple-400"
            />

            {tourney && <TournamentSection data={tourney} />}
          </div>
        </div>
      </main>
    </div>
  )
}

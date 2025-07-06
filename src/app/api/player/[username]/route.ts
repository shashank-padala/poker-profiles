import { NextRequest, NextResponse } from 'next/server'
import { createUserClient } from '@/lib/supabaseClient'

function getAccessToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('Authorization')
  return authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
}

export async function GET(req: NextRequest) {
  const { pathname } = new URL(req.url)
  const segments = pathname.split('/')
  const username = segments[segments.length - 1]

  const token = getAccessToken(req)
  const supabase = token ? createUserClient(token) : null

  let user = null
  if (supabase) {
    const {
      data: { user: sessionUser },
    } = await supabase.auth.getUser()
    user = sessionUser
  }

  // 2) Fetch profile + AI fields
  const { data: profile, error: pErr } = await (supabase ?? createUserClient('')).from('player_profiles')
    .select('id, player_summary, exploit_strategies, player_tags')
    .eq('username', username)
    .single()

  if (pErr || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // 3) Fetch stats
  const { data: statsRow, error: sErr } = await (supabase ?? createUserClient('')).from('player_stats')
    .select(`
      vpip, pfr, three_bet, fold_to_three_bet, steal, check_raise,
      cbet, fold_to_cbet, wtsd, wsd, fold, total_tournaments, avg_buyin, roi
    `)
    .eq('player_id', profile.id)
    .single()

  if (sErr || !statsRow) {
    return NextResponse.json({ error: 'Stats not found' }, { status: 404 })
  }

  // 4) Fetch user note & watchlist
  let userNote: string | null = null
  let isWatchlisted = false
  if (user && supabase) {
    const { data: noteRow } = await supabase
      .from('user_notes')
      .select('note')
      .eq('user_id', user.id)
      .eq('player_id', profile.id)
      .single()
    userNote = noteRow?.note ?? null

    const { count } = await supabase
      .from('user_watchlist')
      .select('id', { head: true, count: 'exact' })
      .eq('user_id', user.id)
      .eq('player_id', profile.id)
    isWatchlisted = (count ?? 0) > 0
  }

  // 5) Shape stats arrays
  const preflop = [
    { label: 'VPIP', value: `${statsRow.vpip}%` },
    { label: 'PFR', value: `${statsRow.pfr}%` },
    { label: '3Bet', value: `${statsRow.three_bet}%` },
    { label: 'Fold to 3Bet', value: `${statsRow.fold_to_three_bet}%` },
    { label: 'Steal', value: `${statsRow.steal}%` },
  ]
  const postflop = [
    { label: 'C-Bet', value: `${statsRow.cbet}%` },
    { label: 'Fold to C-Bet', value: `${statsRow.fold_to_cbet}%` },
    { label: 'Check-Raise', value: `${statsRow.check_raise}%` },
    { label: 'Fold', value: `${statsRow.fold}%` },
    { label: 'WTSD', value: `${statsRow.wtsd}%` },
    { label: 'W$SD', value: `${statsRow.wsd}%` },
  ]

  const tournament = [
    { label: 'Total Tournaments', value: `${statsRow.total_tournaments}` },
    { label: 'Avg Buy-In', value: `${statsRow.avg_buyin}` },
    { label: 'ROI', value: `${statsRow.roi}` },
  ]

  return NextResponse.json({
    profile: {
      player_tags: profile.player_tags,
      exploit_strategy: profile.exploit_strategies,
      profile_summary: profile.player_summary,
      stats: { preflop, postflop, tournament },
    },
    userNote,
    isWatchlisted,
  })
}

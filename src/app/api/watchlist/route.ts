import { NextRequest, NextResponse } from 'next/server'
import { createUserClient } from '@/lib/supabaseClient'

function getAccessToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('Authorization')
  return authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
}

// GET /api/watchlist — return the current user’s watchlisted usernames
export async function GET(req: NextRequest) {
  const token = getAccessToken(req)
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 })
  }

  const supabase = createUserClient(token)

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: rows, error: wErr } = await supabase
    .from('user_watchlist')
    .select('player_id')
    .eq('user_id', user.id)

  if (wErr) {
    return NextResponse.json({ error: wErr.message }, { status: 500 })
  }

  return NextResponse.json(rows.map((r) => r.player_id))
}

// POST /api/watchlist — add one
export async function POST(req: NextRequest) {
  const token = getAccessToken(req)
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 })
  }

  const supabase = createUserClient(token)
  const { username } = await req.json()

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: profile, error: pErr } = await supabase
    .from('player_profiles')
    .select('id')
    .eq('username', username)
    .single()
  if (pErr || !profile) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 })
  }

  const { error: insErr } = await supabase
    .from('user_watchlist')
    .insert({ user_id: user.id, player_id: profile.id })

  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// DELETE /api/watchlist — remove one
export async function DELETE(req: NextRequest) {
  const token = getAccessToken(req)
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 })
  }

  const supabase = createUserClient(token)
  const { username } = await req.json()

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: profile, error: pErr } = await supabase
    .from('player_profiles')
    .select('id')
    .eq('username', username)
    .single()
  if (pErr || !profile) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 })
  }

  const { error: delErr } = await supabase
    .from('user_watchlist')
    .delete()
    .eq('user_id', user.id)
    .eq('player_id', profile.id)

  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

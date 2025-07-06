import { NextRequest, NextResponse } from 'next/server'
import { createUserClient } from '@/lib/supabaseClient'

function getAccessToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('Authorization')
  return authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')
  if (!username) {
    return NextResponse.json({ error: 'Missing username' }, { status: 400 })
  }

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

  const { data: profile, error: pErr } = await supabase
    .from('player_profiles')
    .select('id')
    .eq('username', username)
    .single()
  if (pErr || !profile) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 })
  }

  const { data: noteRow, error: nErr } = await supabase
    .from('user_notes')
    .select('note')
    .eq('user_id', user.id)
    .eq('player_id', profile.id)
    .single()
  if (nErr) {
    return NextResponse.json({ error: nErr.message }, { status: 500 })
  }

  return NextResponse.json({ note: noteRow?.note ?? '' })
}

export async function POST(req: NextRequest) {
  const { username, note } = await req.json()
  console.log('POST /api/notes — incoming:', { username, note })
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

  const { data: profile, error: pErr } = await supabase
    .from('player_profiles')
    .select('id')
    .eq('username', username)
    .single()
  if (pErr || !profile) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 })
  }

  const { error: upErr } = await supabase
    .from('user_notes')
    .upsert(
      { user_id: user.id, player_id: profile.id, note },
      { onConflict: 'user_id,player_id' }
    )
  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

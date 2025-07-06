'use client'

import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import type { Session, User } from '@supabase/supabase-js'

export function useUser() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const accessToken = session?.access_token ?? null
  return { session, user, accessToken }
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabaseClient'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    emailRef.current?.focus()
  }, [mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    let res
    if (mode === 'login') {
      res = await supabase.auth.signInWithPassword({ email, password })
      if (res.error) {
        setError(res.error.message)
      } else {
        router.push('/watchlist')
      }
    } else {
      res = await supabase.auth.signUp({ email, password })
      if (res.error) {
        setError(res.error.message)
      } else {
        setShowVerifyDialog(true)
      }
    }

    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header />

      <div className="flex-grow container mx-auto px-6 py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
            </h1>
            <p className="text-gray-400">
              {mode === 'login'
                ? 'Sign in to your PokerGenie account'
                : 'Sign up for a PokerGenie account'}
            </p>
          </div>

          <div className="bg-gray-800 p-8 rounded-2xl shadow-lg">
            {error && (
              <div className="text-red-500 mb-4 text-center">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  ref={emailRef}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-green-500 hover:bg-green-600 transition-opacity"
              >
                {mode === 'login' ? 'Sign In' : 'Sign Up'}
              </Button>
            </form>

            <p className="mt-6 text-center text-gray-400 text-sm">
              {mode === 'login'
                ? "Don't have an account? "
                : 'Already have an account? '}
              <button
                className="text-green-400 hover:opacity-80 font-medium"
                onClick={() =>
                  setMode(mode === 'login' ? 'signup' : 'login')
                }
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Verify Email Dialog */}
      {showVerifyDialog && (
        <Dialog open={true} onOpenChange={() => setShowVerifyDialog(false)}>
          <DialogContent className="bg-gray-800 text-white border border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-lg">Verify Your Email</DialogTitle>
            </DialogHeader>
            <p className="text-sm mt-2 text-gray-300">
              A verification link has been sent to <strong>{email}</strong>.
              <br />
              Please check your inbox to confirm your account before logging in.
            </p>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

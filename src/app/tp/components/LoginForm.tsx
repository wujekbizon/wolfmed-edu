'use client'

import { useActionState } from 'react'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import { loginAction } from '@/actions/actions'
import FieldError from '@/components/FieldError'
import { useAuthStore } from '@/store/useAuthStore'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SubmitButton from '@/components/SubmitButton'

export default function LoginForm() {
  const [state, action] = useActionState(loginAction, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)
  const login = useAuthStore((state) => state.login)
  const router = useRouter()

  useEffect(() => {
    if (state.status === 'SUCCESS' && state.values?.username) {
      // Try to login with the credentials
      const username = String(state.values.username)
      const password = String(state.values?.password || '')
      const loginSuccess = login(username, password)
      
      if (loginSuccess) {
        // Only redirect if login was successful
        router.push('/tp')
      }
    }
  }, [state.status, state.values, login, router])

  return (
    <div className="bg-zinc-800 shadow-xl rounded-xl border border-zinc-700 p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent mb-2">
          Teaching Playground
        </h1>
        <p className="text-zinc-400">Sign in to continue</p>
      </div>

      <form action={action} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="username">
            Username
          </label>
          <input
            className="w-full px-4 py-2 bg-zinc-900/50 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 transition-colors"
            id="username"
            name="username"
            type="text"
            placeholder="Enter your username"
            defaultValue={state.values?.username || ''}
          />
          <FieldError name="username" formState={state} />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="w-full px-4 py-2 bg-zinc-900/50 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 transition-colors"
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
          />
          <FieldError name="password" formState={state} />
        </div>

        <SubmitButton
          label="Sign In"
          loading="Signing in..."
          disabled={state.status === 'SUCCESS'}
          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/20"
        />
      </form>

      <p className="mt-8 text-center text-sm text-zinc-500">
        Need help? Contact{' '}
        <a href="mailto:support@wolfmed.com" className="text-blue-400 hover:text-blue-300">
          support@wolfmed.com
        </a>
      </p>
      {noScriptFallback}
    </div>
  )
} 
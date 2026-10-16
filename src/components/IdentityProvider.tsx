import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  getUser,
  handleAuthCallback,
  onAuthChange,
  type CallbackResult,
  type User,
} from '@netlify/identity'

type IdentityState = {
  user: User | null
  ready: boolean
  error: string | null
  callback: CallbackResult | null
}

const IdentityContext = createContext<IdentityState | null>(null)

const CALLBACK_KEYS = [
  'confirmation_token',
  'recovery_token',
  'invite_token',
  'email_change_token',
  'access_token',
]

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<IdentityState>({
    user: null,
    ready: false,
    error: null,
    callback: null,
  })

  useEffect(() => {
    let active = true
    const unsubscribe = onAuthChange((_event, user) => {
      if (active) setState((previous) => ({ ...previous, user }))
    })
    async function initialize() {
      try {
        const params = new URLSearchParams(window.location.hash.slice(1))
        const hasCallback = CALLBACK_KEYS.some((key) => params.has(key))
        const callback = hasCallback ? await handleAuthCallback() : null
        const user = await getUser()
        if (active) setState({ user, ready: true, error: null, callback })
      } catch {
        if (active)
          setState({
            user: null,
            ready: true,
            error: 'Authentication could not be initialized.',
            callback: null,
          })
      }
    }
    void initialize()
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return <IdentityContext.Provider value={state}>{children}</IdentityContext.Provider>
}

export function useIdentity() {
  const state = useContext(IdentityContext)
  if (!state) throw new Error('IdentityProvider is required')
  return state
}

/**
 * Session state for the tree.
 *
 * The marketing site has no protected page and never will — every address here is public, and a
 * page that bounced a reader to sign in before showing them what the company does would be the
 * single most self-defeating thing on the surface. So `ProtectedRoute`, which the web template
 * ships, is deliberately absent from this instantiation rather than present and unused. The
 * template's own note says the gate is per route rather than per app, "because a marketing page
 * inside a product app must not bounce a reader to sign in"; this is that case, entire.
 *
 * What remains is worth keeping: a reader who already has a CloudsForge session sees their handle
 * in the shared bar and a switcher that works, instead of a "Sign in" button they have already
 * used. The tokens are the estate-wide ones, so a session established at the account portal is
 * picked up here with no round trip.
 *
 * The identity call is allowed to fail quietly. An unreachable account service must never make the
 * front door of the company look broken — the worst it may cost is a handle in a bar.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AccountState } from '@cloudsforge/ui'
import { AUTH_EXPIRED_EVENT, clearTokens, hasSession, nimbus, signIn, signOut } from './api.ts'

/** What the account service answers at `/auth/me`, narrowed to what the bar needs. */
interface Me {
  handle?: string | null
  roles?: readonly string[] | null
}

export type SessionStatus = 'loading' | 'anonymous' | 'signedIn'

export interface Session {
  status: SessionStatus
  account: AccountState
  signIn: (returnTo?: string) => void
  signOut: () => void
}

const SessionContext = createContext<Session | null>(null)

export function useSession(): Session {
  const value = useContext(SessionContext)
  // Throwing beats returning a signed-out default: a component rendered outside the provider would
  // otherwise show an anonymous UI to a signed-in user and nobody would ever see why.
  if (!value) throw new Error('useSession must be used inside <AuthProvider>')
  return value
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>(() => (hasSession() ? 'loading' : 'anonymous'))
  const [me, setMe] = useState<Me | null>(null)

  useEffect(() => {
    if (!hasSession()) return
    let live = true
    nimbus<Me>('/auth/me')
      .then((profile) => {
        if (!live) return
        setMe(profile)
        setStatus('signedIn')
      })
      .catch(() => {
        if (!live) return
        setStatus(hasSession() ? 'signedIn' : 'anonymous')
      })
    return () => {
      live = false
    }
  }, [])

  useEffect(() => {
    const onExpired = () => {
      clearTokens()
      setMe(null)
      setStatus('anonymous')
    }
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired)
  }, [])

  const doSignOut = useCallback(() => {
    setMe(null)
    setStatus('anonymous')
    signOut()
  }, [])

  const value = useMemo<Session>(
    () => ({
      status,
      account: {
        signedIn: status === 'signedIn',
        handle: me?.handle ?? null,
        roles: me?.roles ?? null,
      },
      signIn,
      signOut: doSignOut,
    }),
    [status, me, doSignOut],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

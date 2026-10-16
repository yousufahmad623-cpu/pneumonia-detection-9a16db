import { useEffect } from 'react'
import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'

import { useIdentity } from '@/components/IdentityProvider'
import { ScreeningProvider } from '@/lib/screening'

export const Route = createFileRoute('/check')({
  component: CheckLayout,
})

function CheckLayout() {
  const { user, ready } = useIdentity()
  const navigate = useNavigate()

  useEffect(() => {
    if (ready && !user) void navigate({ to: '/' })
  }, [ready, user, navigate])

  if (!ready || !user) {
    return (
      <div className="grid min-h-screen place-items-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin motion-reduce:animate-none" aria-label="Loading" />
      </div>
    )
  }

  return (
    <ScreeningProvider>
      <Outlet />
    </ScreeningProvider>
  )
}

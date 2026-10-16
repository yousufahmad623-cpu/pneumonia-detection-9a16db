import type { ReactNode } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { logout } from '@netlify/identity'
import { ArrowLeft, ArrowRight, Check, LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { useIdentity } from '@/components/IdentityProvider'
import { STEPS } from '@/lib/screening'
import { cn } from '@/lib/utils'

type StepPath = (typeof STEPS)[number]['to']

type StepShellProps = {
  step: number
  eyebrow: string
  title: string
  subtitle?: string
  children: ReactNode
  next?: { to: StepPath; label?: string; disabled?: boolean; onBeforeNext?: () => boolean } | null
  nextSlot?: ReactNode
}

export function StepShell({ step, eyebrow, title, subtitle, children, next, nextSlot }: StepShellProps) {
  const { user } = useIdentity()
  const navigate = useNavigate()
  const previous = step > 0 ? STEPS[step - 1] : null

  async function signOut() {
    try {
      await logout()
    } finally {
      sessionStorage.removeItem('pneumoscan:screening')
      await navigate({ to: '/' })
    }
  }

  return (
    <div className="bg-grid min-h-screen pb-32">
      <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user?.name || user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut /> Sign out
            </Button>
          </div>
        </div>
        <nav aria-label="Progress" className="mx-auto max-w-content px-4 pb-3 sm:px-6">
          <ol className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <li key={s.to} className="flex flex-1 items-center gap-2">
                <span
                  className={cn(
                    'grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors motion-reduce:transition-none',
                    i < step && 'bg-primary text-primary-foreground',
                    i === step && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                    i > step && 'bg-muted text-muted-foreground',
                  )}
                  aria-current={i === step ? 'step' : undefined}
                >
                  {i < step ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span
                  className={cn(
                    'hidden text-sm font-medium md:inline',
                    i === step ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <span className={cn('h-0.5 flex-1 rounded-full', i < step ? 'bg-primary' : 'bg-border')} />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </header>

      <main className="mx-auto max-w-content px-4 pt-10 sm:px-6">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">{eyebrow}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-reading text-muted-foreground">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </main>

      {/* Back (bottom-left) and Next (bottom-right) corner controls */}
      {previous && (
        <div className="fixed bottom-6 left-4 z-30 sm:left-6">
          <Button asChild variant="outline" size="lg" className="h-12 rounded-full bg-card px-5 shadow-md">
            <Link to={previous.to}>
              <ArrowLeft /> Back
            </Link>
          </Button>
        </div>
      )}
      <div className="fixed right-4 bottom-6 z-30 sm:right-6">
        {nextSlot ??
          (next && (
            <Button
              size="lg"
              disabled={next.disabled}
              onClick={() => {
                if (next.onBeforeNext && !next.onBeforeNext()) return
                void navigate({ to: next.to })
              }}
              className="h-12 rounded-full px-7 text-base shadow-lg shadow-primary/25"
            >
              {next.label ?? 'Next'} <ArrowRight />
            </Button>
          ))}
      </div>
    </div>
  )
}

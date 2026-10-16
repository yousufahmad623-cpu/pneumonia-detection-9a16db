import { useEffect, useState, type FormEvent } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AuthError, MissingIdentityError, login, signup } from '@netlify/identity'
import { Activity, Camera, Loader2, ScanLine, ShieldCheck, Stethoscope } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useIdentity } from '@/components/IdentityProvider'
import { Logo } from '@/components/Logo'

export const Route = createFileRoute('/')({
  component: LoginPage,
})

type Mode = 'login' | 'signup'

function describeError(error: unknown, mode: Mode) {
  if (error instanceof MissingIdentityError) return 'Sign-in is not available right now. Please try again shortly.'
  if (error instanceof AuthError) {
    if (error.status === 401) return 'Invalid email or password.'
    if (error.status === 403) return 'New sign-ups are currently closed.'
    if (error.status === 422)
      return mode === 'signup'
        ? 'Please use a valid email and a password of at least 6 characters.'
        : 'Please check your email and password.'
    if (/confirm/i.test(error.message)) return 'Please confirm your email first — check your inbox.'
    return error.message
  }
  return 'Something went wrong. Please try again.'
}

function LoginPage() {
  const { user, ready, callback } = useIdentity()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (callback?.type === 'confirmation') toast.success('Email confirmed. Welcome to PneumoScan AI!')
  }, [callback])

  useEffect(() => {
    if (ready && user) void navigate({ to: '/check/instructions' })
  }, [ready, user, navigate])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const fields = new FormData(event.currentTarget)
    const email = String(fields.get('email'))
    const password = String(fields.get('password'))
    setPending(true)
    setError(null)
    setNotice(null)
    try {
      if (mode === 'login') {
        await login(email, password)
        await navigate({ to: '/check/instructions' })
      } else {
        const created = await signup(email, password, { full_name: String(fields.get('name') ?? '') })
        if (created.emailVerified) {
          await navigate({ to: '/check/instructions' })
        } else {
          setNotice('Account created! Check your email to confirm it, then sign in here.')
          setMode('login')
        }
      }
    } catch (err) {
      setError(describeError(err, mode))
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Visual panel */}
      <section className="relative hidden overflow-hidden bg-ink text-primary-foreground lg:block">
        <img
          src="/.netlify/images?url=/img/lungs-hero.png&w=1100&fm=webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo inverted />
          <div className="max-w-md space-y-6">
            <h2 className="font-display text-4xl leading-tight font-semibold">
              Early answers for every breath.
            </h2>
            <p className="text-primary-foreground/75">
              PneumoScan AI combines a clinical symptom checker with a deep-learning model that reads chest X-rays —
              uploaded or captured live with your camera.
            </p>
            <ul className="grid grid-cols-3 gap-3 text-sm">
              {[
                { icon: Stethoscope, label: 'Symptom check' },
                { icon: ScanLine, label: 'X-ray AI' },
                { icon: Camera, label: 'Live camera' },
              ].map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex flex-col gap-2 rounded-xl border border-white/15 bg-white/5 p-3 backdrop-blur"
                >
                  <Icon className="size-5 text-[oklch(0.85_0.1_180)]" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Form panel */}
      <section className="bg-grid flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            <Activity className="size-3.5" /> Pneumonia screening
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {mode === 'login'
              ? 'Sign in to start your pneumonia check. · Login karein aur check shuru karein.'
              : 'Sign up free to screen symptoms and X-rays. · Muft account banayein.'}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <fieldset disabled={pending} className="space-y-4">
              <legend className="sr-only">{mode === 'login' ? 'Sign in details' : 'Sign up details'}</legend>
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" name="name" autoComplete="name" placeholder="Ayesha Khan" className="h-11 bg-card" />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="h-11 bg-card"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  placeholder="••••••••"
                  className="h-11 bg-card"
                />
              </div>
              <Button type="submit" size="lg" className="h-11 w-full text-base">
                {pending && <Loader2 className="animate-spin motion-reduce:animate-none" />}
                {mode === 'login' ? (pending ? 'Signing in…' : 'Sign in') : pending ? 'Creating…' : 'Create account'}
              </Button>
            </fieldset>
            {error && (
              <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            {notice && (
              <p role="status" className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
                {notice}
              </p>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === 'login' ? "Don't have an account?" : 'Already registered?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login')
                setError(null)
              }}
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <p className="mt-10 flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            PneumoScan AI is a screening aid, not a diagnosis. Always consult a qualified doctor.
          </p>
        </div>
      </section>
    </main>
  )
}

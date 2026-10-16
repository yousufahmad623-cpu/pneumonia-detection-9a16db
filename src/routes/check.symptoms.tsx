import { createFileRoute } from '@tanstack/react-router'
import { AlertTriangle, Check } from 'lucide-react'

import { StepShell } from '@/components/StepShell'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { SYMPTOMS, redFlags, symptomScore, useScreening, type AgeGroup, type SymptomId } from '@/lib/screening'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/check/symptoms')({
  component: SymptomsPage,
})

const AGE_GROUPS: { id: AgeGroup; label: string; sub: string }[] = [
  { id: 'child', label: 'Child', sub: 'Under 5' },
  { id: 'adult', label: 'Adult', sub: '5 – 64' },
  { id: 'senior', label: 'Senior', sub: '65+' },
]

function SymptomsPage() {
  const { symptoms, profile, update } = useScreening()
  const score = symptomScore(symptoms, profile)
  const flags = redFlags(symptoms, profile)

  function toggle(id: SymptomId) {
    update({ symptoms: symptoms.includes(id) ? symptoms.filter((s) => s !== id) : [...symptoms, id] })
  }

  const tone = score >= 60 ? 'bg-destructive' : score >= 30 ? 'bg-warning' : 'bg-success'

  return (
    <StepShell
      step={1}
      eyebrow="Step 2 · Symptoms / Alamaat"
      title="What are you feeling?"
      subtitle="Select every symptom you have had recently. Your answers are scored with a weighted clinical model."
      next={{ to: '/check/scan', label: 'Next: X-ray' }}
    >
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <fieldset>
          <legend className="sr-only">Symptoms</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {SYMPTOMS.map((s) => {
              const selected = symptoms.includes(s.id)
              return (
                <button
                  key={s.id}
                  type="button"
                  role="checkbox"
                  aria-checked={selected}
                  onClick={() => toggle(s.id)}
                  className={cn(
                    'group flex items-start gap-3 rounded-xl border bg-card p-4 text-left transition-colors motion-reduce:transition-none hover:border-primary/50',
                    selected && 'border-primary bg-secondary ring-1 ring-primary',
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border',
                      selected ? 'border-primary bg-primary text-primary-foreground' : 'border-input',
                    )}
                  >
                    {selected && <Check className="size-3.5" />}
                  </span>
                  <span>
                    <span className="block font-medium">{s.label}</span>
                    <span className="block text-xs text-muted-foreground">
                      {s.urdu} · {s.hint}
                    </span>
                    {s.redFlag && (
                      <span className="mt-1 inline-block rounded bg-destructive/10 px-1.5 py-0.5 text-[11px] font-semibold text-destructive">
                        Warning sign
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </fieldset>

        <aside className="space-y-6 lg:sticky lg:top-36 lg:self-start">
          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="font-semibold">About you</h2>
            <div className="mt-4 space-y-5">
              <div>
                <p className="mb-2 text-sm font-medium">Age group</p>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Age group">
                  {AGE_GROUPS.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      role="radio"
                      aria-checked={profile.ageGroup === g.id}
                      onClick={() => update({ profile: { ...profile, ageGroup: g.id } })}
                      className={cn(
                        'rounded-lg border px-2 py-2 text-center text-sm',
                        profile.ageGroup === g.id
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'bg-background hover:border-primary/50',
                      )}
                    >
                      <span className="block font-semibold">{g.label}</span>
                      <span className="block text-[11px] opacity-80">{g.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="days">Days unwell</Label>
                  <Input
                    id="days"
                    type="number"
                    min={0}
                    max={60}
                    value={profile.days}
                    onChange={(e) => update({ profile: { ...profile, days: Number(e.target.value) || 0 } })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="spo2">SpO₂ % (optional)</Label>
                  <Input
                    id="spo2"
                    type="number"
                    min={50}
                    max={100}
                    placeholder="e.g. 96"
                    value={profile.spo2}
                    onChange={(e) => update({ profile: { ...profile, spo2: e.target.value } })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="chronic" className="font-normal">
                  Asthma, COPD, diabetes or heart disease
                </Label>
                <Switch
                  id="chronic"
                  checked={profile.chronic}
                  onCheckedChange={(v) => update({ profile: { ...profile, chronic: v } })}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="smoker" className="font-normal">
                  I smoke
                </Label>
                <Switch
                  id="smoker"
                  checked={profile.smoker}
                  onCheckedChange={(v) => update({ profile: { ...profile, smoker: v } })}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-ink p-5 text-primary-foreground" aria-live="polite">
            <p className="text-sm text-primary-foreground/70">Symptom score</p>
            <p className="font-display text-5xl font-semibold">
              {score}
              <span className="text-xl text-primary-foreground/60">/100</span>
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={cn('h-full rounded-full transition-all motion-reduce:transition-none', tone)}
                style={{ width: `${score}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-primary-foreground/75">
              {symptoms.length} symptom{symptoms.length === 1 ? '' : 's'} selected. Add an X-ray next for a more
              accurate result.
            </p>
          </section>

          {flags.length > 0 && (
            <section role="alert" className="rounded-2xl border border-destructive/40 bg-destructive/5 p-5">
              <p className="flex items-center gap-2 font-semibold text-destructive">
                <AlertTriangle className="size-5" /> Warning signs detected
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm">
                {flags.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <p className="mt-2 text-sm">Please seek medical care urgently — don’t wait for the screening result.</p>
            </section>
          )}
        </aside>
      </div>
    </StepShell>
  )
}

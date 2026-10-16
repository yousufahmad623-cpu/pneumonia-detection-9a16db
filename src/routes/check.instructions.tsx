import { createFileRoute } from '@tanstack/react-router'
import { AlertTriangle, BrainCircuit, HeartPulse, ListChecks } from 'lucide-react'

import { StepShell } from '@/components/StepShell'
import { EMERGENCY_SIGNS, HOW_TO_USE, IF_PNEUMONIA_STEPS } from '@/lib/guidance'

export const Route = createFileRoute('/check/instructions')({
  component: InstructionsPage,
})

function InstructionsPage() {
  return (
    <StepShell
      step={0}
      eyebrow="Step 1 · Instructions / Hidayat"
      title="How PneumoScan AI works"
      subtitle="Follow these steps for an accurate screening. Read the guidance below so you know what to do if pneumonia is suspected."
      next={{ to: '/check/symptoms', label: 'Next: Symptoms' }}
    >
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="how-heading" className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 id="how-heading" className="flex items-center gap-2 font-display text-xl font-semibold">
            <ListChecks className="size-5 text-primary" /> Follow these steps
          </h2>
          <ol className="mt-6 space-y-5">
            {HOW_TO_USE.map((item, i) => (
              <li key={item.title} className="flex gap-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary font-display font-semibold text-secondary-foreground">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">
                    {item.title} <span className="font-normal text-muted-foreground">· {item.urdu}</span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl bg-ink p-6 text-primary-foreground">
            <BrainCircuit className="size-6 text-[oklch(0.85_0.1_180)]" />
            <h2 className="mt-3 font-display text-xl font-semibold">Deep learning under the hood</h2>
            <p className="mt-2 text-sm text-primary-foreground/75">
              Chest X-rays are analysed by a multimodal deep neural network (Google Gemini vision) prompted as a
              radiology classifier. It returns a pneumonia probability, the pattern it sees and the affected lung zones.
              Your symptom answers are scored with a weighted clinical model, and both are combined into one risk level.
            </p>
          </section>
          <section
            aria-labelledby="emergency-heading"
            className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6"
          >
            <h2 id="emergency-heading" className="flex items-center gap-2 font-semibold text-destructive">
              <AlertTriangle className="size-5" /> Seek emergency care now if you have
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm">
              {EMERGENCY_SIGNS.map((sign) => (
                <li key={sign} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-destructive" /> {sign}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <section aria-labelledby="if-heading" className="mt-6 rounded-2xl border bg-card p-6 shadow-sm">
        <h2 id="if-heading" className="flex items-center gap-2 font-display text-xl font-semibold">
          <HeartPulse className="size-5 text-primary" /> If you have pneumonia, follow these steps
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">Agar pneumonia ho to yeh qadam uthayein:</p>
        <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {IF_PNEUMONIA_STEPS.map((item, i) => (
            <li key={item.title} className="rounded-xl bg-muted/60 p-4">
              <p className="text-xs font-bold text-primary">STEP {i + 1}</p>
              <p className="mt-1 font-semibold">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.urdu}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-6 max-w-reading text-xs text-muted-foreground">
        PneumoScan AI is an educational screening tool and does not replace a medical diagnosis. Results can be wrong.
        Always consult a qualified healthcare professional.
      </p>
    </StepShell>
  )
}

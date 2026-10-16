import { cn } from '@/lib/utils'

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={cn(
          'grid size-9 place-items-center rounded-xl',
          inverted ? 'bg-white/10 text-white' : 'bg-primary text-primary-foreground',
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5" aria-hidden>
          <path d="M12 3v8m0 0-3 2m3-2 3 2" strokeLinecap="round" />
          <path d="M9 7.5C6 7 3.5 10 3.5 15c0 3.2 1.4 5 3.2 5 2 0 2.8-1.6 2.8-4V9.5" strokeLinecap="round" />
          <path d="M15 7.5c3-.5 5.5 2.5 5.5 7.5 0 3.2-1.4 5-3.2 5-2 0-2.8-1.6-2.8-4V9.5" strokeLinecap="round" />
        </svg>
      </span>
      <span className={cn('font-display text-xl font-semibold tracking-tight', inverted && 'text-white')}>
        PneumoScan<span className={inverted ? 'text-[oklch(0.85_0.1_180)]' : 'text-primary'}> AI</span>
      </span>
    </span>
  )
}

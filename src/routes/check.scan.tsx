import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  BrainCircuit,
  Camera,
  CameraOff,
  ImageUp,
  Lightbulb,
  Loader2,
  RefreshCcw,
  SwitchCamera,
  Trash2,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'

import { StepShell } from '@/components/StepShell'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PHOTO_TIPS } from '@/lib/guidance'
import { fileToJpegDataUrl, toJpegDataUrl } from '@/lib/image'
import { useScreening, type ImageAnalysis } from '@/lib/screening'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/check/scan')({
  component: ScanPage,
})

function ScanPage() {
  const { image, imageSource, analysis, update } = useScreening()
  const [tab, setTab] = useState<'upload' | 'camera'>('upload')
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setImage(dataUrl: string, source: 'upload' | 'camera') {
    update({ image: dataUrl, imageSource: source, analysis: null })
    setError(null)
  }

  async function analyze() {
    if (!image) return
    setAnalyzing(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      })
      const data = (await res.json().catch(() => ({}))) as { analysis?: ImageAnalysis; error?: string }
      if (!res.ok || !data.analysis) throw new Error(data.error ?? 'Analysis failed. Please try again.')
      update({ analysis: data.analysis })
      if (!data.analysis.isChestXray) toast.warning('This does not look like a chest X-ray.')
      else toast.success('Analysis complete')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <StepShell
      step={2}
      eyebrow="Step 3 · Chest X-ray / Tasveer"
      title="Upload or capture a chest X-ray"
      subtitle="Use a file from your device or your camera. Our deep-learning model scans the image for signs of pneumonia."
      next={{
        to: '/check/result',
        label: analysis ? 'Next: Result' : image ? 'Skip analysis' : 'Next without X-ray',
        disabled: analyzing,
      }}
    >
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
          {image ? (
            <Preview
              image={image}
              source={imageSource}
              analyzing={analyzing}
              analysis={analysis}
              onClear={() => update({ image: null, imageSource: null, analysis: null })}
            />
          ) : (
            <Tabs value={tab} onValueChange={(v) => setTab(v as 'upload' | 'camera')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">
                  <Upload /> Upload image
                </TabsTrigger>
                <TabsTrigger value="camera">
                  <Camera /> Use camera
                </TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="mt-4">
                <Uploader onImage={(d) => setImage(d, 'upload')} />
              </TabsContent>
              <TabsContent value="camera" className="mt-4">
                {tab === 'camera' && <CameraCapture onImage={(d) => setImage(d, 'camera')} />}
              </TabsContent>
            </Tabs>
          )}

          {image && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={analyze} disabled={analyzing} className="h-11">
                {analyzing ? <Loader2 className="animate-spin motion-reduce:animate-none" /> : <BrainCircuit />}
                {analyzing ? 'Analysing with deep learning…' : analysis ? 'Analyse again' : 'Analyse X-ray with AI'}
              </Button>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          {analysis && <AnalysisCard analysis={analysis} />}
          <section className="rounded-2xl border bg-card p-5">
            <h2 className="flex items-center gap-2 font-semibold">
              <Lightbulb className="size-5 text-accent-foreground" /> Tips for a clear picture
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {PHOTO_TIPS.map((tip) => (
                <li key={tip} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> {tip}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </StepShell>
  )
}

function Uploader({ onImage }: { onImage: (dataUrl: string) => void }) {
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file (JPG, PNG or WebP).')
      return
    }
    setBusy(true)
    try {
      onImage(await fileToJpegDataUrl(file))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not read the image.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <label
      onDragOver={(e: DragEvent) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e: DragEvent) => {
        e.preventDefault()
        setDragging(false)
        void handleFile(e.dataTransfer.files[0])
      }}
      className={cn(
        'flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-muted/40 p-6 text-center transition-colors motion-reduce:transition-none',
        dragging ? 'border-primary bg-secondary' : 'hover:border-primary/50',
      )}
    >
      <span className="grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
        {busy ? <Loader2 className="size-6 animate-spin motion-reduce:animate-none" /> : <ImageUp className="size-6" />}
      </span>
      <span className="font-semibold">Drop a chest X-ray here or click to browse</span>
      <span className="text-sm text-muted-foreground">JPG, PNG or WebP · front (PA/AP) view works best</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          void handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </label>
  )
}

function CameraCapture({ onImage }: { onImage: (dataUrl: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [facing, setFacing] = useState<'environment' | 'user'>('environment')
  const [status, setStatus] = useState<'starting' | 'live' | 'denied' | 'unsupported'>('starting')

  useEffect(() => {
    let cancelled = false
    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('unsupported')
        return
      }
      setStatus('starting')
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1440 } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => undefined)
        }
        setStatus('live')
      } catch {
        if (!cancelled) setStatus('denied')
      }
    }
    void start()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [facing])

  function capture() {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    onImage(toJpegDataUrl(video, video.videoWidth, video.videoHeight))
  }

  if (status === 'denied' || status === 'unsupported') {
    return (
      <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-xl bg-muted/50 p-6 text-center">
        <CameraOff className="size-8 text-muted-foreground" />
        <p className="font-semibold">
          {status === 'denied' ? 'Camera access was blocked' : 'Camera is not available on this device'}
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Allow camera permission in your browser settings and try again, or switch to “Upload image”.
        </p>
        {status === 'denied' && (
          <Button variant="outline" onClick={() => setFacing((f) => (f === 'environment' ? 'user' : 'environment'))}>
            <RefreshCcw /> Try again
          </Button>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-ink">
        <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
        {/* Framing guide */}
        <div className="pointer-events-none absolute inset-[8%] rounded-2xl border-2 border-dashed border-white/50" />
        <p className="pointer-events-none absolute inset-x-0 top-3 text-center text-xs font-medium text-white/80">
          Fit both lungs inside the frame
        </p>
        {status === 'starting' && (
          <div className="absolute inset-0 grid place-items-center text-white/80">
            <Loader2 className="size-6 animate-spin motion-reduce:animate-none" aria-label="Starting camera" />
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="icon-lg"
          aria-label="Switch camera"
          onClick={() => setFacing((f) => (f === 'environment' ? 'user' : 'environment'))}
        >
          <SwitchCamera />
        </Button>
        <Button size="lg" className="h-12 rounded-full px-8" onClick={capture} disabled={status !== 'live'}>
          <Camera /> Capture photo
        </Button>
      </div>
    </div>
  )
}

function Preview({
  image,
  source,
  analyzing,
  analysis,
  onClear,
}: {
  image: string
  source: 'upload' | 'camera' | null
  analyzing: boolean
  analysis: ImageAnalysis | null
  onClear: () => void
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          {source === 'camera' ? 'Captured with camera' : 'Uploaded image'}
        </p>
        <Button variant="ghost" size="sm" onClick={onClear} disabled={analyzing}>
          <Trash2 /> Replace
        </Button>
      </div>
      <div className="relative overflow-hidden rounded-xl bg-ink">
        <img src={image} alt="Chest X-ray to analyse" className="mx-auto max-h-[520px] w-auto object-contain" />
        {analyzing && (
          <>
            <div className="absolute inset-0 bg-primary/10" />
            <div className="scan-line absolute inset-x-0 top-0 h-1 bg-[oklch(0.85_0.12_180)] shadow-[0_0_24px_6px_oklch(0.85_0.12_180/0.6)] motion-reduce:animate-none" />
          </>
        )}
        {analysis?.isChestXray && analysis.affectedRegions.length > 0 && (
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            {analysis.affectedRegions.map((r) => (
              <span key={r} className="rounded-full bg-destructive/90 px-2.5 py-1 text-xs font-semibold text-white">
                {r}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AnalysisCard({ analysis }: { analysis: ImageAnalysis }) {
  if (!analysis.isChestXray) {
    return (
      <section className="rounded-2xl border border-warning/50 bg-warning/10 p-5">
        <h2 className="font-semibold">Not a chest X-ray</h2>
        <p className="mt-1 text-sm text-muted-foreground">{analysis.explanation}</p>
        <p className="mt-2 text-sm">Please replace it with a front-view chest X-ray for image-based screening.</p>
      </section>
    )
  }
  const pct = Math.round(analysis.pneumoniaProbability * 100)
  const color = pct >= 60 ? 'text-destructive' : pct >= 30 ? 'text-warning' : 'text-success'
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">Deep-learning prediction</p>
      <p className={cn('font-display text-3xl font-semibold capitalize', color)}>{analysis.prediction}</p>
      <p className="mt-1 text-sm">
        Pneumonia probability <span className="font-semibold">{pct}%</span> · model confidence{' '}
        {Math.round(analysis.confidence * 100)}%
      </p>
      {analysis.findings.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {analysis.findings.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}
    </section>
  )
}

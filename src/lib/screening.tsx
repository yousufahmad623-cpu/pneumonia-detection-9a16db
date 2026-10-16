import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type SymptomId =
  | 'fever'
  | 'cough'
  | 'phlegm'
  | 'breathless'
  | 'chestPain'
  | 'fastBreathing'
  | 'chills'
  | 'fatigue'
  | 'confusion'
  | 'bluishLips'
  | 'appetite'
  | 'sweating'

export type Symptom = {
  id: SymptomId
  label: string
  urdu: string
  hint: string
  weight: number
  redFlag?: boolean
}

// Weights reflect how strongly each finding is associated with community-acquired pneumonia.
export const SYMPTOMS: Symptom[] = [
  { id: 'fever', label: 'Fever above 38°C / 100.4°F', urdu: 'Bukhaar', hint: 'Measured or felt hot with shivering', weight: 12 },
  { id: 'cough', label: 'Persistent cough', urdu: 'Musalsal khansi', hint: 'Lasting more than 3 days', weight: 10 },
  { id: 'phlegm', label: 'Cough with yellow, green or bloody phlegm', urdu: 'Balgham wali khansi', hint: 'Thick or coloured mucus', weight: 12 },
  { id: 'breathless', label: 'Shortness of breath', urdu: 'Saans phoolna', hint: 'Even at rest or with light activity', weight: 14 },
  { id: 'chestPain', label: 'Sharp chest pain when breathing or coughing', urdu: 'Seenay mein dard', hint: 'Pleuritic, stabbing pain', weight: 12 },
  { id: 'fastBreathing', label: 'Fast or shallow breathing', urdu: 'Tez saans', hint: 'Adults > 24 breaths/min', weight: 10 },
  { id: 'chills', label: 'Shaking chills', urdu: 'Kapkapi', hint: 'Uncontrollable shivering', weight: 6 },
  { id: 'fatigue', label: 'Unusual tiredness or weakness', urdu: 'Thakawat', hint: 'Hard to do normal tasks', weight: 4 },
  { id: 'sweating', label: 'Heavy sweating / clammy skin', urdu: 'Paseena', hint: 'Especially at night', weight: 4 },
  { id: 'appetite', label: 'Loss of appetite, nausea or vomiting', urdu: 'Bhook na lagna', hint: 'Common in children', weight: 3 },
  { id: 'confusion', label: 'New confusion or drowsiness', urdu: 'Ghabrahat / be-hoshi', hint: 'Especially in older adults', weight: 8, redFlag: true },
  { id: 'bluishLips', label: 'Bluish lips or fingertips', urdu: 'Hont neelay hona', hint: 'Sign of low oxygen', weight: 10, redFlag: true },
]

export type AgeGroup = 'child' | 'adult' | 'senior'

export type Profile = {
  ageGroup: AgeGroup
  days: number
  spo2: string
  chronic: boolean
  smoker: boolean
}

export type ImageAnalysis = {
  isChestXray: boolean
  prediction: 'pneumonia' | 'normal' | 'uncertain'
  pneumoniaProbability: number
  confidence: number
  pattern: string
  affectedRegions: string[]
  findings: string[]
  imageQuality: 'good' | 'fair' | 'poor'
  explanation: string
}

export type ScreeningState = {
  symptoms: SymptomId[]
  profile: Profile
  image: string | null
  imageSource: 'upload' | 'camera' | null
  analysis: ImageAnalysis | null
}

const INITIAL: ScreeningState = {
  symptoms: [],
  profile: { ageGroup: 'adult', days: 3, spo2: '', chronic: false, smoker: false },
  image: null,
  imageSource: null,
  analysis: null,
}

const STORAGE_KEY = 'pneumoscan:screening'

type ScreeningContextValue = ScreeningState & {
  update: (patch: Partial<ScreeningState>) => void
  reset: () => void
}

const ScreeningContext = createContext<ScreeningContextValue | null>(null)

export function ScreeningProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ScreeningState>(INITIAL)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) setState({ ...INITIAL, ...JSON.parse(saved) })
    } catch {
      // Ignore corrupt or unavailable storage
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Image may exceed quota; keep the rest of the state in memory
    }
  }, [state, loaded])

  const value: ScreeningContextValue = {
    ...state,
    update: (patch) => setState((previous) => ({ ...previous, ...patch })),
    reset: () => setState(INITIAL),
  }
  return <ScreeningContext.Provider value={value}>{children}</ScreeningContext.Provider>
}

export function useScreening() {
  const value = useContext(ScreeningContext)
  if (!value) throw new Error('ScreeningProvider is required')
  return value
}

/** Weighted symptom score from 0–100, adjusted for age, duration, oxygen and risk factors. */
export function symptomScore(symptoms: SymptomId[], profile: Profile) {
  const max = SYMPTOMS.reduce((sum, s) => sum + s.weight, 0)
  const raw = SYMPTOMS.filter((s) => symptoms.includes(s.id)).reduce((sum, s) => sum + s.weight, 0)
  let score = (raw / max) * 100
  // Core triad (fever + cough + breathlessness) is a strong clinical signal
  if (['fever', 'cough', 'breathless'].every((id) => symptoms.includes(id as SymptomId))) score += 10
  if (profile.ageGroup !== 'adult' && symptoms.length > 0) score += 6
  if (profile.chronic && symptoms.length > 0) score += 5
  if (profile.smoker && symptoms.length > 0) score += 3
  if (profile.days >= 5 && symptoms.length > 1) score += 4
  const spo2 = Number(profile.spo2)
  if (profile.spo2 && spo2 > 0) {
    if (spo2 < 92) score += 18
    else if (spo2 < 95) score += 9
  }
  return Math.round(Math.min(100, Math.max(0, score)))
}

export function redFlags(symptoms: SymptomId[], profile: Profile) {
  const flags = SYMPTOMS.filter((s) => s.redFlag && symptoms.includes(s.id)).map((s) => s.label)
  const spo2 = Number(profile.spo2)
  if (profile.spo2 && spo2 > 0 && spo2 < 92) flags.push(`Oxygen saturation ${spo2}% (below 92%)`)
  return flags
}

export type RiskLevel = 'low' | 'moderate' | 'high'

export function combinedRisk(state: ScreeningState) {
  const sScore = symptomScore(state.symptoms, state.profile)
  const usable = state.analysis?.isChestXray ? state.analysis : null
  const iScore = usable ? Math.round(usable.pneumoniaProbability * 100) : null
  // When an X-ray is available, image evidence carries more weight than self-reported symptoms
  const total = iScore === null ? sScore : Math.round(iScore * 0.6 + sScore * 0.4)
  const flags = redFlags(state.symptoms, state.profile)
  let level: RiskLevel = total >= 60 ? 'high' : total >= 30 ? 'moderate' : 'low'
  if (flags.length > 0 && level === 'low') level = 'moderate'
  return { symptomScore: sScore, imageScore: iScore, total, level, flags }
}

export const STEPS = [
  { to: '/check/instructions', label: 'Instructions' },
  { to: '/check/symptoms', label: 'Symptoms' },
  { to: '/check/scan', label: 'X-ray scan' },
  { to: '/check/result', label: 'Result' },
] as const

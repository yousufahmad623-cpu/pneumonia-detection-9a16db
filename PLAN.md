# PneumoScan AI — Plan

1. ✅ Theme, fonts, app shell, hero illustration
2. ✅ Login / sign-up page (first page) with Netlify Identity
3. ✅ Protected `/check` flow with step progress bar, Back (bottom-left) and Next (bottom-right) buttons
4. ✅ Step 1 — Instructions: how to use, "if you have pneumonia" steps, emergency signs
5. ✅ Step 2 — Symptom checker with weighted clinical score and warning signs
6. ✅ Step 3 — X-ray upload (drag & drop) and live camera capture, preview and scan animation
7. ⬜ `src/routes/api.analyze.ts` — POST endpoint calling Gemini vision (`gemini-3.5-flash`) via Netlify AI Gateway with a JSON schema matching `ImageAnalysis` in `src/lib/screening.tsx`; validate image data URL and size, require a logged-in user
8. ⬜ Step 4 — `src/routes/check.result.tsx`: combined risk from `combinedRisk()`, red flags, next steps from `src/lib/guidance.ts`, "Start new check" (calls `reset()`)
9. ⬜ Optional: save screening history per user in Netlify Database

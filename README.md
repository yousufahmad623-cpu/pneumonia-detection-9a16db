# PneumoScan AI

A pneumonia screening web app. Users sign in, read instructions, check their symptoms, and upload or capture (with the camera) a chest X-ray that is analysed by a deep-learning vision model.

## Tech
TanStack Start (React 19), Tailwind CSS 4, shadcn/ui, Netlify Identity (`@netlify/identity`), Netlify AI Gateway with Google Gemini vision (`@google/genai`).

## Run locally
```bash
pnpm install
netlify dev --port 8889
```
`netlify dev` is required so Identity and the AI Gateway are available.

## Roadmap
See [PLAN.md](PLAN.md). Remaining: the X-ray analysis API endpoint and the final Result page.

> Screening aid only — not a medical diagnosis.

# Lexifyd — Polysemy Challenge (Hackathon prototype)

Context-aware Tamil lexical game: **Play / Explore / Lab** tabs, **XP & level**, **daily streak**, **ஒளி hint tokens** (eliminate wrong / highlight keyword), **achievements** + toasts, **Arcade pressure timer**, **run recap** (grade S–C) + **local leaderboard**, **word mastery** review queue, **sound toggle**, **light theme**, **keyboard 1–4** for MCQ, **reduced-motion** friendly effects.

## Quick start

```bash
cd lexifyd
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Judge demo (no API key)

Use **Demo mode** on the home page or any **offline seed** word (`listSeedWords()` in `lib/seed.ts`). No API key required for the full pipeline + graph on seeds.

## Live LLM generation

Copy `.env.example` to `.env.local` and set `OPENAI_API_KEY` and/or `GEMINI_API_KEY`.

## Force offline / judge mode (no outbound LLM)

Set either env var to a truthy value (`1`, `true`, `yes`, `on`) so **`generatePipelineAsync` never calls OpenAI or Gemini**, even if keys are present:

- `DISABLE_LLM=1`
- `LEXIFYD_OFFLINE=1`
- **`LEXIFYD_NO_REMOTE_API=1`** — same as above for API calls, and documents **local Tamil WordNet** path: [`lib/wordnet/lexicon.json`](lib/wordnet/lexicon.json) (optional extra lemmas) plus curated [`lib/seed.ts`](lib/seed.ts) entries, surfaced as `source: "wordnet"`.

Implementation: [`lib/generationEnv.ts`](lib/generationEnv.ts), [`lib/wordnet/pipeline.ts`](lib/wordnet/pipeline.ts), [`lib/engine.ts`](lib/engine.ts). Unknown words need a **seed** or **lexicon.json** entry or return the error pipeline with an offline note.

## Scripts

| Command    | Description        |
| ---------- | ------------------ |
| `npm run dev`   | Dev server         |
| `npm run build` | Production build   |
| `npm run start` | Serve production   |
| `npm test`      | Vitest unit tests (`lib/**/*.test.ts`) |
| `npm run test:watch` | Vitest watch mode |
| `npm run lint`  | Next.js ESLint     |
| `powershell -File scripts/run-demo.ps1` | Install if needed + `npm run dev` |

## Submission / judge checklist

- **Node:** use a current LTS (e.g. 20.x) matching your environment.
- **Install & build:** `npm ci` (or `npm install`), then `npm run build` and `npm run lint`.
- **Tests:** `npm test` — covers session history parsing, insights, seeds, weekly session count, and `DISABLE_LLM` behavior.
- **No API keys:** leave `OPENAI_API_KEY` / `GEMINI_API_KEY` unset **or** set `DISABLE_LLM=1` / `LEXIFYD_OFFLINE=1` / `LEXIFYD_NO_REMOTE_API=1` for zero outbound LLM traffic (local WordNet + seeds only).
- **Demo path:** open the app, use **Demo mode (judges)** or **Load challenge** with a **seed word** (see [`lib/seed.ts`](lib/seed.ts) — `listSeedWords()`; examples include `படி`, `கல்`, `தீ`, `ஆறு`, `பால்`, `வாசல்`, …).
- **Summary:** finish a session with **Finish & summary** to populate history; **Weekly practice goal** counts sessions completed this calendar week (Mon–Sun local).

## Architecture

- `lib/engine.ts` — LLM JSON (morphology + typed distractors), `lib/graphUtils.ts` for graphs
- `lib/seed.ts` — 10+ curated Tamil polysemy entries
- `lib/guardrails.ts` — validation, parallel shuffle (roles + explanations)
- `app/api/challenge/route.ts` — POST `{ "word": "..." }` (same-origin server route; optional LLM only if not disabled)
- `lib/generationEnv.ts` — `DISABLE_LLM` / `LEXIFYD_OFFLINE`
- `lib/sessionHistory.ts`, `lib/insights.ts`, `lib/weeklySessions.ts` — logged sessions & Summary analytics
- `lib/progression.ts`, `lib/achievements.ts`, `lib/mastery.ts`, `lib/sounds.ts`
- `components/AppTabs.tsx`, `PlayerHud.tsx`, `RunRecap.tsx`, `GameShell.tsx`, `DragDropGame.tsx`, `SemanticViz.tsx`, `CuratorConsole.tsx`

## Human-in-the-loop

Outputs can be flagged (duplicate options, wrong option count, low Tamil coverage). Treat flagged items as curator review before production.

# Lexifyd — UI/UX designer handoff

Send this document (and repo access or a ZIP of `lexifyd/`) to your designer so their work matches the product and engineering constraints.

---

## 1. Product summary (what to design for)

**Lexifyd** is a **context-aware Tamil polysemy** learning game: the player disambiguates an ambiguous word using a sentence and meaning chips or multiple-choice fragments.

- **Core loop**: Pick mode → load or run a word → complete rounds (drag meaning / MCQ) → optional hints (ஒளி) → finish → see summary and history.
- **Audience**: Learners; **demo/judge mode** is a first-class path (clear onboarding, readable type, professional polish).
- **Stack**: Next.js app; **no login** for v1 — progression and session history live in **localStorage** (device-only).

---

## 2. What to deliver (suggested)

| Deliverable | Notes |
|-------------|--------|
| **Frames** | Desktop (~1440px) and mobile (~390px) for key screens below. |
| **Design tokens** | Colors, type scale, radii, spacing — align with or extend the existing CSS variables. |
| **Components** | Primary / secondary / ghost / segment buttons, cards, inputs, nav items, tags/badges, progress bars, list rows, empty states, error banners. |
| **States** | Default, hover, focus-visible, active, disabled, loading; **reduced motion** respected for heavy animation. |
| **Tamil** | Long strings and stacked diacritics — generous line-height and minimum sizes for body and options. |

Optional: Figma dev-mode specs (px/rem, hex) to speed implementation.

---

## 3. Information architecture

### Primary sections (sidebar desktop / bottom tabs mobile)

Defined in [`lib/mainNav.ts`](lib/mainNav.ts):

| ID | Label | Purpose |
|----|--------|---------|
| `play` | Play | Modes, word input, challenge, rounds, hints |
| `summary` | Summary | KPIs, trends, coach copy, recent sessions, session detail |
| `explore` | Explore | Semantic graph, review queue (needs a loaded pipeline) |
| `lab` | Lab | Guardrails, curator tools, pipeline meta, leaderboard |

**Deep link (optional UX):** per-session page at `/history/[sessionId]` — bookmarkable session recap ([`app/history/[sessionId]/page.tsx`](app/history/[sessionId]/page.tsx)).

---

## 4. Key user flows to cover in mocks

1. **Landing / Play (empty)** — Hero, “Demo mode (judges)”, sound + light theme toggles, player HUD (nickname, streak, daily quest, XP).
2. **Mode strip** — Custom, Daily, Arcade, Boss; contextual CTAs (e.g. “Start today’s quest”).
3. **Loaded challenge** — Round HUD, accessibility MCQ toggle, surface forms, **context sentence** (Tamil), drop slot, meaning chips, MCQ options, hint buttons, timer (when applicable).
4. **Feedback** — Correct/incorrect reveal, pedagogy block, “Next round” / “Finish & summary”.
5. **Summary** — KPI cards, latest session card, trend / distractor / word bars (if data exists), coach tips, weak/strong words, **recent sessions list** → **session detail** (rounds, mistakes, corrections, practice CTA).
6. **Explore / Lab (empty)** — Copy explaining “generate a challenge in Play first.”
7. **Explore / Lab (filled)** — Graph, panels, dense but readable lab UI.

---

## 5. Visual language already in code

### Theme direction

**“Ink & manuscript”** — warm dark base, amber accent; **light mode** is warm paper.

### Color tokens (dark — `:root`)

Source: [`app/globals.css`](app/globals.css)

| Token | Hex | Role |
|-------|-----|------|
| `--bg` | `#12110f` | Page background |
| `--card` | `#1c1b18` | Card surface |
| `--card-elevated` | `#242220` | Elevated chips / inputs |
| `--border` | `#2e2c28` | Borders |
| `--accent` | `#c9a227` | Primary CTA, highlights |
| `--accent-hover` | `#d4ae32` | Primary hover |
| `--accent-ink` | `#1a1612` | Text on gold buttons |
| `--text` | `#ebe6dc` | Primary text |
| `--muted` | `#9c958a` | Secondary text |
| `--muted-2` | `#6f6a62` | Tertiary labels |
| `--success` | `#6b8f71` | Correct / positive |
| `--danger` | `#c45c4a` | Wrong / destructive |

### Color tokens (light — `html.light`)

| Token | Hex (representative) |
|-------|------------------------|
| `--bg` | `#f6f3ec` |
| `--card` | `#fffdf8` |
| `--text` | `#1a1816` |
| `--accent` | `#9a7312` |
| `--success` | `#3d6b47` |
| `--danger` | `#a84838` |

Radii: `--radius-sm` 0.5rem, `--radius-md` 0.75rem, `--radius-lg` 1rem.

### Typography

Source: [`app/layout.tsx`](app/layout.tsx) + [`tailwind.config.ts`](tailwind.config.ts)

| Role | Font |
|------|------|
| UI / body | **DM Sans** (`--font-dm`) + **Noto Sans Tamil** (`--font-noto`) |
| Display / headings | **Literata** (`--font-literata`) |
| Tamil emphasis | `font-tamil` → Noto Sans Tamil |

Tailwind semantic sizes (use these names when speccing):

- `text-ui-sm` — small labels  
- `text-ui` — default UI chrome  
- `text-ui-lg` — comfortable body (default on `body`)  
- `text-display-tight` — section titles under the page H1  

### Reusable CSS component classes

Also in [`app/globals.css`](app/globals.css): `.lex-card`, `.lex-input`, `.lex-btn-primary`, `.lex-btn-secondary`, `.lex-btn-ghost`, `.lex-btn-segment`, `.lex-nav-item`, `.lex-nav-item-active`, `.lex-option`, `.lex-chip`, `.lex-sentence`, etc.

Designers can treat these as the **canonical component styling** unless you agree to replace them.

### Motion

- Subtle transitions on buttons; optional `.lex-fade-in` on tab changes.  
- **`prefers-reduced-motion: reduce`** disables shake, confetti, and fade-in — avoid relying on motion for meaning.

---

## 6. Repo map (files designers may reference)

| Area | Path |
|------|------|
| Global styles & tokens | `app/globals.css` |
| Fonts & HTML shell | `app/layout.tsx` |
| Home layout, header, footer, tabs | `app/page.tsx` |
| Tailwind theme | `tailwind.config.ts` |
| Nav config | `lib/mainNav.ts` |
| Play shell & modes | `components/GameShell.tsx` |
| Sticky round HUD | `components/StickyPlayHud.tsx` |
| Main game UI | `components/DragDropGame.tsx` |
| Player bar | `components/PlayerHud.tsx` |
| Summary dashboard | `components/SummaryDashboard.tsx` |
| Session recap | `components/SessionDetailPanel.tsx`, `components/SessionSummary.tsx` |
| Mobile tabs | `components/AppTabs.tsx` |
| Sidebar nav | `components/CommandNav.tsx` |
| Standalone session URL | `app/history/[sessionId]/page.tsx` |

---

## 7. What to send the designer (checklist)

- [ ] This file: **`DESIGN_HANDOFF.md`**
- [ ] **Repository** access or **`lexifyd/`** folder ZIP
- [ ] **Running app**: URL or `npm install` + `npm run dev` in `lexifyd`
- [ ] **Screenshots** of dark + light + Summary + Play (with a loaded word), if they can’t run locally
- [ ] **Non-goals / phase** (e.g. “no new auth”, “charts stay CSS/SVG unless we add a lib”)
- [ ] **Your Figma (or tool) link** if you create the file first — one source of truth

---

## 8. Collaboration tips

- Prefer **hex values that match or extend** the CSS variables so implementation is a straight token swap.  
- Call out **focus states** (keyboard) — matches `focus-visible` in code.  
- For **new patterns**, note whether they replace `.lex-*` classes or sit beside them.  
- When designs change, a **short version note** (“Summary v2 — moved KPI row”) helps map to `SummaryDashboard.tsx`.

---

## 9. After Stitch / Figma — engineering integration checklist

When design assets are ready, developers should work in this order (no design file is bundled in-repo until you add exports):

1. **Tokens** — Map Figma color styles to [`app/globals.css`](app/globals.css) `:root` / `html.light` variables; extend [`tailwind.config.ts`](tailwind.config.ts) only if new semantic sizes are needed.
2. **Typography** — Confirm Tamil and Latin font families in [`app/layout.tsx`](app/layout.tsx) match the spec; adjust `font-display` / `font-tamil` usage in components.
3. **Components** — Prefer updating existing `.lex-*` classes in `globals.css` before duplicating one-off Tailwind on every screen.
4. **Screens** — Map frames to [`app/page.tsx`](app/page.tsx) sections and [`components/SummaryDashboard.tsx`](components/SummaryDashboard.tsx), [`DragDropGame.tsx`](components/DragDropGame.tsx), etc.; keep IA aligned with [`lib/mainNav.ts`](lib/mainNav.ts).
5. **Regression** — Run `npm run build`, `npm test`, and spot-check **light theme**, **reduced motion**, and **mobile** bottom tabs.

Deliverables from design to speed this up: exported **SVG** icons (if any), **hex** token table, and **one** annotated frame per primary screen (spacing in px or rem).

---

*Last updated to match the Lexifyd codebase layout and tokens. Regenerate or edit this file if major IA or branding changes.*

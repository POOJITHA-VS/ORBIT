# ORBIT: 30-day money simulator (Broke But Functional)
**Live demo:** <PASTE YOUR VERCEL LINK>

ORBIT answers one question before any spend: *"What happens to my month if I do this?"* It splits your month into three futures (buy now, wait 7 days, skip), stress-tests them with life events, finds the day your budget breaks, proposes the smallest safe fix, and explains it in a Future You letter. Nothing in the real ledger changes until you confirm.

## Run
`npm install` · `npm run dev` · `npm test` · `npm run build`

## Architecture
- `src/engine/` pure TypeScript (simulate, branch, stressTest, maxSafePurchase, smartFix, commit). No UI, simulations run on clones only; `commit()` is the only function that returns a changed ledger.
- `src/store/` Zustand stores (ledger, sandbox) persisted to localStorage with shape validation.
- `src/features/`, `src/components/` UI that reads engine results only. Chart is lazy-loaded.
- `src/content/` packs, personality text. All explanations are templated from real numbers; no AI calls.

## Quality
- **Tests:** engine tests (spec numbers, ledger immutability, day ordering, health 44/93), component tests, letter tests and a full-app flow test. Lint: `npm run lint`.
- **Security:** numeric input is sanitised (`lib/num`), persisted data is validated, no `dangerouslySetInnerHTML`, CSP and security headers via `vercel.json`.
- **Accessibility:** labelled inputs, `aria-current`/`aria-pressed`, live region for the letter, labelled heatmap tiles, visible focus, full keyboard use.
- **Reliability:** error boundary with safe reset, reduced-motion support, skip link.
- **Performance:** simulations are memoised and Recharts is code-split.

## Money Health Score
App-defined indicator (not a credit score): buffer 30, bills 25, goal 25, spending pace 20.

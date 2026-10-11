# Architecture

ORBIT separates **what the money does** (engine) from **how it looks** (UI).

## Layers

| Layer | Folder | Rule |
| --- | --- | --- |
| Engine | `src/engine` | Pure TypeScript. No React, no storage, no randomness. Inputs are never mutated. |
| State | `src/store` | Two Zustand stores. `useLedger` is the real month (persisted). `useSandbox` is the hypothetical decision, stress packs and selected future (persisted separately). |
| Derivation | `src/hooks` | `useBase` (the real month) and `useScenario` (the sandbox on top of it), memoised. |
| UI | `src/pages`, `src/features`, `src/components` | Pages compose features. Features read hooks and call store actions. Primitives live in `components/ui.tsx`. |

## Data flow

1. A person edits the Decision Studio. That writes to `useSandbox`.
2. `useScenario` recomputes three futures, the max safe purchase and the smart fixes from a **clone** of the ledger.
3. Pages render the result. The real ledger is untouched.
4. When the person confirms, `commit()` returns a new ledger and `setLedger` stores it. Every screen recalculates from the new ledger.

## Why a hash router

Five screens do not need a router dependency. `useHashRoute` gives deep links (`#/decide`), back-button support and one less package. Navigation moves focus to the page heading.

## Error handling

- Number inputs never produce `NaN` (`toNumber`), and the form disables actions until values are valid.
- Ledger operations ignore invalid input and return the same ledger.
- `ErrorBoundary` shows a recovery screen with a reset option if a render fails.
- `advanceDay` stops on the last day, so the simulation always has at least one day to run.

## Persistence

`localStorage` keys: `orbit-ledger2`, `orbit-sandbox2`, `orbit-theme`. New state fields are merged with defaults so older saved data keeps working.

# Engine

All formulas live in `src/engine/index.ts` and are covered by tests.

## Types

- `Twin`: today, last day, cash, goals, events, planned daily spend, buffer.
- `Event`: a dated amount (`expense`, `income`, `bill`, `subscription`, `shock`).
- `Decision`: `buy`, `save`, `subscribe` or `emergency` with an amount and a day.

## `simulate(twin, decisions, shocks)`

Clones the twin, merges its events with the decisions and shocks, adds planned daily spend for each day, sorts by date, and walks day by day. Each day records cash, free cash (cash minus goal reserves), the day's events and a risk level.

Outputs: `days`, `lowest` point, `breachDay` (first day below buffer), `shortfallDay` (first day below zero), `unpayable`, `risk`, `health`, `allowance`, `forecast`.

## Formulas

```
free      = cash − reserved
allowance = max(0, round((forecast + planned × days − buffer) / days))
risk      = red   if lowest < buffer, a bill is unpayable, or lowest < 0
            yellow if lowest < 2 × buffer
            green  otherwise
health    = 30 × clamp(lowest / 2·buffer)       buffer
          + 25 if every bill is payable          bills
          + 25 × (1 − savings touched / reserved) goals
          + 20 × min(allowance / planned, 1)     pace
```

## Other functions

- `branch`: buy now, wait 7 days, skip.
- `stressTest`: the three futures under a pack of shocks.
- `maxSafePurchase`: binary search in ₹10 steps up to ₹5,000 (more spend only lowers free cash, so the search is valid).
- `smartFix`: smaller price, later date, cancel a subscription, trim daily spend, or a combination. Only returns fixes proven to pass.
- `commit`: the only function that returns a changed real ledger.

## `ledger.ts`

`logTransaction`, `addCommitment`, `removeEvent`, `addGoal`, `removeGoal`, `contribute`, `advanceDay`, `categoryTotals`, `healthBreakdown`. All pure, all return a new ledger and ignore invalid input.

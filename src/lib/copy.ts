import type {Result} from '../engine'
import {inr} from './format'

export const reason = (r: Result): string =>
  r.risk === 'green'
    ? 'Comfortable.'
    : [
        r.unpayable ? 'A bill goes unpaid.' : '',
        r.breachDay ? `Breaches buffer Day ${r.breachDay}.` : '',
        r.shortfallDay ? `Dipping into savings from Day ${r.shortfallDay} (goal underfunded).` : '',
      ]
        .filter(Boolean)
        .join(' ')

export function letter(r: Result): string {
  if (r.risk === 'green')
    return `I'm glad you waited. I still had ${inr(r.forecast)} on Day 30 and every bill went through. Thanks for looking out for me.`
  if (r.risk === 'yellow')
    return `It was tight. My lowest was ${inr(r.lowest.freeCash)} on Day ${r.lowest.day}, close to the buffer, but I made it.`
  const dip = r.shortfallDay ? ` and dipped into savings from Day ${r.shortfallDay}` : ''
  return `Okay, so… Day ${r.breachDay ?? r.lowest.day} was rough. I hit ${inr(r.lowest.freeCash)}${dip}. Can we not do that again?`
}

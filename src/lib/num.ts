// Sanitises numeric input: rejects NaN/Infinity, rounds, clamps to [min,max].
export const num=(v:string|number,min:number,max:number):number=>{const n=Number(v);return Number.isFinite(n)?Math.min(max,Math.max(min,Math.round(n))):min}

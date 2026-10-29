// p compounded n times a year at ratePct for t years
export const compoundAmount = (p, ratePct, t, n) => p * Math.pow(1 + ratePct / 100 / n, n * t)

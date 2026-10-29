export function calcInflation({ amount, inflation, returns, years, goalCost, goalYears }) {
  const i = inflation / 100
  const futureValue     = amount * Math.pow(1 + i, years)
  const purchasingPower = amount / Math.pow(1 + i, years)
  const realReturn      = ((1 + returns / 100) / (1 + i) - 1) * 100
  const futureGoalCost  = goalCost * Math.pow(1 + i, goalYears)
  const monthlySavingsNeeded = futureGoalCost * (inflation / 12 / 100) /
    (Math.pow(1 + inflation / 100 / 12, goalYears * 12) - 1) // SIP needed at inflation rate
  return { futureValue, purchasingPower, realReturn, futureGoalCost, monthlySavingsNeeded }
}

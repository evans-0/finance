export function calcEMI(principal, annualRate, months) {
  const r = annualRate / 100 / 12
  if (r <= 0) return principal / months
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
}

// Year-by-year principal/interest split of a standard EMI loan (capped at 30 years for the chart)
export function amortizationByYear(principal, annualRate, years) {
  const r   = annualRate / 12 / 100
  const emi = calcEMI(principal, annualRate, years * 12)
  const rows = []
  let balance = principal
  for (let y = 1; y <= Math.min(years, 30); y++) {
    let yearInt = 0, yearPrin = 0
    for (let m = 0; m < 12; m++) {
      const intPay  = balance * r
      const prinPay = emi - intPay
      yearInt  += intPay
      yearPrin += prinPay
      balance  -= prinPay
      if (balance < 0) balance = 0
    }
    rows.push({ year: y, principal: yearPrin, interest: yearInt })
  }
  return rows
}

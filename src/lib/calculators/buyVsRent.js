import { calcEMI } from './loan.js'

export function computeUS(p) {
  const price = p.price
  const down = price * (p.down / 100)
  const loan = price - down
  const emi = calcEMI(loan, p.rate, p.term * 12)
  const propTaxMo = (price * p.propTax) / 100 / 12
  const maintMo = (price * p.maintenance) / 100 / 12
  const totalBuyMo = emi + propTaxMo + maintMo + p.hoa + p.insurance
  const invR = p.investReturn / 100
  const loanR = p.rate / 100 / 12
  let bal = loan, rentMo = p.rent
  const data = []
  for (let yr = 1; yr <= p.years; yr++) {
    for (let m = 0; m < 12; m++) { bal -= emi - bal * loanR }
    bal = Math.max(bal, 0)
    const homeVal = price * Math.pow(1 + p.appreciation / 100, yr)
    const buyNW = homeVal - bal
    const oppGrowth = down * Math.pow(1 + invR, yr)
    const savings = totalBuyMo - rentMo
    const rentNW = oppGrowth + (savings > 0 ? savings * 12 * (Math.pow(1 + invR, yr) - 1) / invR : 0)
    data.push({ year: `Yr ${yr}`, buyNW: Math.round(buyNW), rentNW: Math.round(rentNW) })
    rentMo *= (1 + p.rentGrowth / 100)
  }
  return { totalBuyMo, rent0: p.rent, down, data }
}

export function computeIN(p) {
  const price = p.price
  const stampRegAmt = price * ((p.stampDuty + p.registration) / 100)
  const downCash = price * (p.down / 100)
  const totalUpfront = downCash + stampRegAmt
  const loan = price - downCash
  const emi = calcEMI(loan, p.rate, p.term * 12)
  const annualInterest = loan * (p.rate / 100)
  const sec24Benefit = p.sec24 ? (Math.min(annualInterest, 200000) * (p.taxBracket / 100)) / 12 : 0
  const totalBuyMo = emi + p.maintenance - sec24Benefit
  const invR = p.investReturn / 100
  const loanR = p.rate / 100 / 12
  let bal = loan, rentMo = p.rent
  const data = []
  for (let yr = 1; yr <= p.years; yr++) {
    for (let m = 0; m < 12; m++) { bal -= emi - bal * loanR }
    bal = Math.max(bal, 0)
    const homeVal = price * Math.pow(1 + p.appreciation / 100, yr)
    const buyNW = homeVal - bal
    const oppGrowth = totalUpfront * Math.pow(1 + invR, yr)
    const savings = totalBuyMo - rentMo
    const rentNW = oppGrowth + (savings > 0 ? savings * 12 * (Math.pow(1 + invR, yr) - 1) / invR : 0)
    data.push({ year: `Yr ${yr}`, buyNW: Math.round(buyNW), rentNW: Math.round(rentNW) })
    rentMo *= (1 + p.rentGrowth / 100)
  }
  return { totalBuyMo, rent0: p.rent, down: totalUpfront, data }
}

import { atom } from 'jotai'

// Base parameters - using plain numbers for UI compatibility
export const p0Atom = atom(50_000_000) // Property purchase price
export const i0Atom = atom(1_500_000) // Initial costs
export const rentMonthly0Atom = atom(180_000) // Initial monthly rent
export const monthlyOpex0Atom = atom(30_000) // Monthly operating expenses
export const vacancyAtom = atom(0.05) // Vacancy rate
export const inflationAtom = atom(0.02) // Inflation rate
export const rentDecayAtom = atom(0.01) // Rent decay rate
export const priceDecayAtom = atom(0.005) // Price decay rate
export const taxAnnualFixedAtom = atom(120_000) // Fixed property tax

// Sale parameters
export const exitCostRateAtom = atom(0.03) // Sale cost rate
export const yearsAtom = atom(10) // Holding period

// Discount rates
export const discountAssetAtom = atom(0.06) // Asset discount rate
export const discountEquityAtom = atom(0.1) // Equity discount rate

// Loan parameters
export const loanAmountAtom = atom(60_000_000) // Loan amount (temporarily set higher than property price for testing)
export const loanRateAtom = atom(0.025) // Loan rate
export const loanTermAtom = atom(25) // Loan term
export const prepayPenaltyRateAtom = atom(0.0) // Prepayment penalty rate

// Consolidated input atom for DCF calculation
export const dcfInputAtom = atom((get) => ({
  p0: get(p0Atom),
  i0: get(i0Atom),
  rentMonthly0: get(rentMonthly0Atom),
  monthlyOpex0: get(monthlyOpex0Atom),
  vacancy: get(vacancyAtom),
  inflation: get(inflationAtom),
  rentDecay: get(rentDecayAtom),
  priceDecay: get(priceDecayAtom),
  taxAnnualFixed: get(taxAnnualFixedAtom),
  exitCostRate: get(exitCostRateAtom),
  years: get(yearsAtom),
  discountAsset: get(discountAssetAtom),
  discountEquity: get(discountEquityAtom),
  loanAmount: get(loanAmountAtom),
  loanRate: get(loanRateAtom),
  loanTerm: get(loanTermAtom),
  prepayPenaltyRate: get(prepayPenaltyRateAtom),
}))

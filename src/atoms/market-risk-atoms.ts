import { atom } from 'jotai'

// Market risk and assumption atoms - Japan-specific realistic values
export const vacancyAtom = atom(0.03) // Vacancy rate (urban areas, well-managed properties)
export const inflationAtom = atom(0.02) // Inflation rate (BOJ target)
export const rentDecayAtom = atom(0.008) // Rent decay rate (conservative for urban areas)
export const priceDecayAtom = atom(0.003) // Price decay rate (RC/SRC buildings)

// Discount rates for valuation - reflecting current market conditions
export const discountAssetAtom = atom(0.05) // Asset discount rate (low interest environment)
export const discountEquityAtom = atom(0.08) // Equity discount rate (real estate investment)

// Risk-adjusted calculation atoms
export const effectiveVacancyRateAtom = atom((get) => {
  const baseVacancy = get(vacancyAtom)
  const rentDecay = get(rentDecayAtom)
  // Combine vacancy and rent decay effects
  return baseVacancy + (rentDecay * 0.3) // 30% of rent decay affects vacancy
})

export const riskAdjustedInflationAtom = atom((get) => {
  const inflation = get(inflationAtom)
  const rentDecay = get(rentDecayAtom)
  // Net inflation effect considering rent decay
  return Math.max(0, inflation - rentDecay * 0.5)
})
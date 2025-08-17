import { atom } from 'jotai'

// Analysis and exit strategy atoms
export const exitCostRateAtom = atom(0.03) // Sale cost rate
export const yearsAtom = atom(10) // Holding period

// Analysis calculation atoms
export const totalReturnAtom = atom((get) => {
  // This will be calculated based on DCF results
  // Placeholder for now - actual calculation will be in DCF
  return 0
})

export const annualizedReturnAtom = atom((get) => {
  const totalReturn = get(totalReturnAtom)
  const years = get(yearsAtom)
  
  if (years === 0) return 0
  return Math.pow(1 + totalReturn, 1 / years) - 1
})

export const breakEvenYearsAtom = atom((get) => {
  // Placeholder for break-even analysis
  // Will be calculated based on cash flows
  return get(yearsAtom) * 0.7
})

// Investment metrics - will be calculated based on DCF results
export const investmentMetricsAtom = atom((get) => {
  // Placeholder for complex investment metrics calculation
  // These will be calculated in the DCF chain to avoid circular dependencies
  return {
    totalReturn: get(totalReturnAtom),
    annualizedReturn: get(annualizedReturnAtom),
    breakEvenYears: get(breakEvenYearsAtom)
  }
})
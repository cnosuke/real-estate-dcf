/**
 * @deprecated This file is being migrated to the new atom structure.
 * Please use atoms from '@/atoms/calculation' instead.
 * This file will be removed in a future version.
 */
import { atom } from 'jotai'

// Import atoms from organized files
import {
  p0Atom,
  i0Atom,
  rentMonthly0Atom,
  monthlyOpex0Atom,
  taxAnnualFixedAtom,
  purchasePriceWithCostsAtom
} from './property-atoms'

import {
  vacancyAtom,
  inflationAtom,
  rentDecayAtom,
  priceDecayAtom,
  discountAssetAtom,
  discountEquityAtom,
  effectiveVacancyRateAtom,
  riskAdjustedInflationAtom
} from './market-risk-atoms'

import {
  loanAmountAtom,
  loanRateAtom,
  loanTermAtom,
  prepayPenaltyRateAtom,
  monthlyPaymentAtom,
  totalInterestAtom
} from './loan-atoms'

import {
  exitCostRateAtom,
  yearsAtom,
  totalReturnAtom,
  annualizedReturnAtom,
  breakEvenYearsAtom,
  investmentMetricsAtom
} from './analysis-atoms'

// Re-export all atoms for backward compatibility
export {
  p0Atom,
  i0Atom,
  rentMonthly0Atom,
  monthlyOpex0Atom,
  taxAnnualFixedAtom,
  purchasePriceWithCostsAtom,
  vacancyAtom,
  inflationAtom,
  rentDecayAtom,
  priceDecayAtom,
  discountAssetAtom,
  discountEquityAtom,
  effectiveVacancyRateAtom,
  riskAdjustedInflationAtom,
  loanAmountAtom,
  loanRateAtom,
  loanTermAtom,
  prepayPenaltyRateAtom,
  monthlyPaymentAtom,
  totalInterestAtom,
  exitCostRateAtom,
  yearsAtom,
  totalReturnAtom,
  annualizedReturnAtom,
  breakEvenYearsAtom,
  investmentMetricsAtom
}

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

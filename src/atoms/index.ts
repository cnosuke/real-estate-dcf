// Main atoms export
export { dcfInputAtom } from './dcf-input-atoms'
export { 
  dcfResultAtom, 
  dcfResultStateAtom, 
  currentDCFErrorAtom, 
  hasCalculationErrorAtom 
} from './dcf-output-atoms'

// Property atoms
export {
  p0Atom,
  i0Atom,
  rentMonthly0Atom,
  monthlyOpex0Atom,
  taxAnnualFixedAtom,
  purchasePriceWithCostsAtom
} from './property-atoms'

// Market risk atoms
export {
  vacancyAtom,
  inflationAtom,
  rentDecayAtom,
  priceDecayAtom,
  discountAssetAtom,
  discountEquityAtom,
  effectiveVacancyRateAtom,
  riskAdjustedInflationAtom
} from './market-risk-atoms'

// Loan atoms
export {
  loanAmountAtom,
  loanRateAtom,
  loanTermAtom,
  prepayPenaltyRateAtom,
  monthlyPaymentAtom,
  totalInterestAtom
} from './loan-atoms'

// Analysis atoms
export {
  exitCostRateAtom,
  yearsAtom,
  totalReturnAtom,
  annualizedReturnAtom,
  breakEvenYearsAtom,
  investmentMetricsAtom
} from './analysis-atoms'

// Preset atoms
export {
  currentPresetAtom,
  applyPresetAtom,
  applyLocationPresetAtom,
  applyPropertyTypePresetAtom,
  isCurrentPresetValidAtom,
  PRESET_CONFIGS,
  type PresetType,
  type LocationPreset,
  type PropertyTypePreset
} from './preset-atoms'

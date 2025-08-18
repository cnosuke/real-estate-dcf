// DCF入力値管理
export {
  // 個別入力atom
  p0Atom,
  i0Atom,
  rentMonthly0Atom,
  monthlyOpex0Atom,
  vacancyAtom,
  inflationAtom,
  rentDecayAtom,
  priceDecayAtom,
  taxAnnualFixedAtom,
  exitCostRateAtom,
  yearsAtom,
  discountAssetAtom,
  discountEquityAtom,
  loanAmountAtom,
  loanRateAtom,
  loanTermAtom,
  prepayPenaltyRateAtom,
  // 統合入力atom
  dcfInputAtom,
  updateDCFInputAtom
} from './dcf-input'

// DCF計算結果管理
export {
  // 計算状態enum
  DCFCalculationState,
  // 計算結果atom
  dcfResultAtom,
  dcfCalculationStateAtom,
  dcfCalculationErrorAtom,
  // 計算実行atom
  executeDCFCalculationAtom,
  autoCalculateDCFAtom,
  // 計算状態selector
  isCalculatingAtom,
  hasCalculationErrorAtom,
  calculationSuccessAtom,
  // 後方互換性atom
  currentDCFErrorAtom,
  dcfResultStateAtom
} from './dcf-output'

// 導出値
export {
  // 入力値導出
  purchasePriceWithCostsAtom,
  monthlyPaymentAtom,
  ltvAtom,
  totalInterestAtom,
  effectiveVacancyRateAtom,
  riskAdjustedInflationAtom,
  // 結果導出
  equityMultipleAtom,
  cashOnCashReturnAtom,
  totalReturnAtom,
  annualizedReturnAtom,
  breakEvenYearsAtom,
  investmentMetricsAtom
} from './derived'
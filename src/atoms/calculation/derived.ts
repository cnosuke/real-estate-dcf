import { atom } from 'jotai'
import { dcfInputAtom } from './dcf-input'
import { dcfResultAtom } from './dcf-output'
import { annuityPayment } from '@/lib/investment-utils'

// 入力値から導出される便利な値（計算コストが低いもの）
export const purchasePriceWithCostsAtom = atom((get) => {
  const input = get(dcfInputAtom)
  return input.p0 + input.i0
})

export const monthlyPaymentAtom = atom((get) => {
  const input = get(dcfInputAtom)
  if (input.loanAmount <= 0) return 0
  return annuityPayment(input.loanAmount, input.loanRate, input.loanTerm) / 12
})

export const ltvAtom = atom((get) => {
  const input = get(dcfInputAtom)
  const totalCost = get(purchasePriceWithCostsAtom)
  return totalCost > 0 ? input.loanAmount / totalCost : 0
})

// 年間ローン支払額
export const totalInterestAtom = atom((get) => {
  const input = get(dcfInputAtom)
  if (input.loanAmount <= 0) return 0
  const annualPayment = annuityPayment(input.loanAmount, input.loanRate, input.loanTerm)
  const totalPayments = annualPayment * input.loanTerm
  return totalPayments - input.loanAmount
})

// 実効空室率（空室 + その他のファクター）
export const effectiveVacancyRateAtom = atom((get) => {
  const input = get(dcfInputAtom)
  // 簡単な実効空室率計算（空室率に小幅の追加リスクを考慮）
  return Math.min(input.vacancy * 1.1, 0.99)
})

// リスク調整インフレ率
export const riskAdjustedInflationAtom = atom((get) => {
  const input = get(dcfInputAtom)
  // インフレ率からリスクプレミアムを差し引いた実質的な成長率
  return Math.max(input.inflation - 0.005, 0)
})

// 計算結果から導出される便利な値
export const equityMultipleAtom = atom((get) => {
  const result = get(dcfResultAtom)
  const input = get(dcfInputAtom)
  
  if (!result || !result.cfEquity || result.cfEquity.length === 0) return undefined
  
  const initialEquity = Math.abs(result.cfEquity[0])
  const totalCashReturn = result.cfEquity.slice(1).reduce((sum, cf) => sum + Math.max(0, cf), 0)
  
  return initialEquity > 0 ? totalCashReturn / initialEquity : undefined
})

export const cashOnCashReturnAtom = atom((get) => {
  const result = get(dcfResultAtom)
  const input = get(dcfInputAtom)
  
  if (!result || !result.cfEquity || result.cfEquity.length < 2) return undefined
  
  const initialEquity = Math.abs(result.cfEquity[0])
  const averageAnnualCF = result.cfEquity.slice(1, -1).reduce((sum, cf) => sum + cf, 0) / (input.years - 1)
  
  return initialEquity > 0 ? averageAnnualCF / initialEquity : undefined
})

// 投資指標計算
export const totalReturnAtom = atom((get) => {
  const result = get(dcfResultAtom)
  
  if (!result || !result.cfEquity || result.cfEquity.length === 0) return undefined
  
  const initialInvestment = Math.abs(result.cfEquity[0])
  const totalReturn = result.cfEquity.slice(1).reduce((sum, cf) => sum + cf, 0)
  
  return initialInvestment > 0 ? totalReturn / initialInvestment : undefined
})

export const annualizedReturnAtom = atom((get) => {
  const result = get(dcfResultAtom)
  const input = get(dcfInputAtom)
  
  if (!result || input.years <= 0) return undefined
  
  return result.irrEquity
})

export const breakEvenYearsAtom = atom((get) => {
  const result = get(dcfResultAtom)
  
  if (!result || !result.cfEquity || result.cfEquity.length < 2) return undefined
  
  const initialInvestment = Math.abs(result.cfEquity[0])
  let cumulativeCF = 0
  
  // 運営期間中のキャッシュフロー（売却年を除く）での回収年数
  for (let t = 1; t < result.cfEquity.length - 1; t++) {
    cumulativeCF += result.cfEquity[t]
    if (cumulativeCF >= initialInvestment) {
      return t
    }
  }
  
  // 運営期間中に回収できない場合は保有期間を返す
  return result.cfEquity.length - 1
})

// 投資メトリクス統合
export const investmentMetricsAtom = atom((get) => {
  const result = get(dcfResultAtom)
  const input = get(dcfInputAtom)
  const totalReturn = get(totalReturnAtom)
  const annualizedReturn = get(annualizedReturnAtom)
  const breakEvenYears = get(breakEvenYearsAtom)
  const equityMultiple = get(equityMultipleAtom)
  const cashOnCashReturn = get(cashOnCashReturnAtom)
  
  if (!result) return null
  
  return {
    npvAsset: result.npvAsset,
    npvEquity: result.npvEquity,
    irrAsset: result.irrAsset,
    irrEquity: result.irrEquity,
    totalReturn,
    annualizedReturn,
    breakEvenYears,
    equityMultiple,
    cashOnCashReturn,
    implicitCap: result.implicitCap
  }
})
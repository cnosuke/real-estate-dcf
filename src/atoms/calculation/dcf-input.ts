import { atom } from 'jotai'
import type { Input } from '@/types/dcf'

// 基本入力値のPrimitive Atom（個別管理）
const p0Atom = atom<number>(50_000_000)
const i0Atom = atom<number>(1_500_000)
const rentMonthly0Atom = atom<number>(180_000)
const monthlyOpex0Atom = atom<number>(30_000)
const vacancyAtom = atom<number>(0.05)
const inflationAtom = atom<number>(0.02)
const rentDecayAtom = atom<number>(0.01)
const priceDecayAtom = atom<number>(0.005)
const taxAnnualFixedAtom = atom<number>(120_000)
const exitCostRateAtom = atom<number>(0.03)
const yearsAtom = atom<number>(10)
export const discountAssetAtom = atom<number>(0.02)
export const discountEquityAtom = atom<number>(0.05)
const loanAmountAtom = atom<number>(35_000_000)
const loanRateAtom = atom<number>(0.025)
const loanTermAtom = atom<number>(35)
const prepayPenaltyRateAtom = atom<number>(0.0)

// 統合されたDCF入力オブジェクト（読み取り専用）
export const dcfInputAtom = atom<Input>((get) => ({
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

// 入力値更新用のアクション
export const updateDCFInputAtom = atom(
  null,
  (_get, set, updates: Partial<Input>) => {
    // 型安全な更新
    if (updates.p0 !== undefined) set(p0Atom, updates.p0)
    if (updates.i0 !== undefined) set(i0Atom, updates.i0)
    if (updates.rentMonthly0 !== undefined)
      set(rentMonthly0Atom, updates.rentMonthly0)
    if (updates.monthlyOpex0 !== undefined)
      set(monthlyOpex0Atom, updates.monthlyOpex0)
    if (updates.vacancy !== undefined) set(vacancyAtom, updates.vacancy)
    if (updates.inflation !== undefined) set(inflationAtom, updates.inflation)
    if (updates.rentDecay !== undefined) set(rentDecayAtom, updates.rentDecay)
    if (updates.priceDecay !== undefined)
      set(priceDecayAtom, updates.priceDecay)
    if (updates.taxAnnualFixed !== undefined)
      set(taxAnnualFixedAtom, updates.taxAnnualFixed)
    if (updates.exitCostRate !== undefined)
      set(exitCostRateAtom, updates.exitCostRate)
    if (updates.years !== undefined) set(yearsAtom, updates.years)
    if (updates.discountAsset !== undefined)
      set(discountAssetAtom, updates.discountAsset)
    if (updates.discountEquity !== undefined)
      set(discountEquityAtom, updates.discountEquity)
    if (updates.loanAmount !== undefined)
      set(loanAmountAtom, updates.loanAmount)
    if (updates.loanRate !== undefined) set(loanRateAtom, updates.loanRate)
    if (updates.loanTerm !== undefined) set(loanTermAtom, updates.loanTerm)
    if (updates.prepayPenaltyRate !== undefined)
      set(prepayPenaltyRateAtom, updates.prepayPenaltyRate)
  },
)

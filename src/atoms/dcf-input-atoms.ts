import { atom } from 'jotai'

// 基本パラメータ
export const p0Atom = atom(50_000_000) // 物件購入額
export const i0Atom = atom(1_500_000) // 初期諸費用
export const rentMonthly0Atom = atom(180_000) // 初期月額家賃
export const monthlyOpex0Atom = atom(30_000) // 月次諸費用
export const vacancyAtom = atom(0.05) // 空室率
export const inflationAtom = atom(0.02) // インフレ率
export const rentDecayAtom = atom(0.01) // 家賃逓減率
export const priceDecayAtom = atom(0.005) // 価格逓減率
export const taxAnnualFixedAtom = atom(120_000) // 固定資産税

// 売却関連
export const exitCostRateAtom = atom(0.03) // 売却コスト率
export const yearsAtom = atom(10) // 保有年数

// 割引率
export const discountAssetAtom = atom(0.06) // 資産割引率（物件全体の投資利回り）
export const discountEquityAtom = atom(0.1) // 自己資金割引率（現金投資の期待利回り）

// 借入
export const loanAmountAtom = atom(35_000_000) // 借入額
export const loanRateAtom = atom(0.025) // 借入金利
export const loanTermAtom = atom(25) // 返済年数
export const prepayPenaltyRateAtom = atom(0.0) // 繰上償還ペナルティ率

// 統合入力Atom（自動計算用）
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

import type { DebtYear, Input, Result } from '@/types/dcf'

const EPS = 1e-12

const pow1p = (x: number, n: number) => (1 + x) ** n

const annuityPayment = (principal: number, rate: number, years: number) => {
  if (principal <= 0 || years <= 0) return 0
  if (Math.abs(rate) < EPS) return principal / years
  return (principal * rate) / (1 - (1 + rate) ** -years)
}

const npv = (rate: number, cfs: number[]) =>
  cfs.reduce((acc, cf, t) => acc + cf / (1 + rate) ** t, 0)

const irr = (cfs: number[], guess = 0.08): number => {
  // ニュートン法
  let r = guess
  for (let i = 0; i < 100; i++) {
    let f = 0
    let df = 0
    for (let t = 0; t < cfs.length; t++) {
      const den = (1 + r) ** t
      f += cfs[t] / den
      if (t > 0) df -= (t * cfs[t]) / (den * (1 + r))
    }
    if (Math.abs(df) < 1e-14) break
    const nr = r - f / df
    if (!Number.isFinite(nr)) break
    if (Math.abs(nr - r) < 1e-8) return nr
    r = nr
  }
  // フォールバック：-90%〜100%を粗サーチ
  let best = { r: NaN, err: Number.POSITIVE_INFINITY }
  for (let bp = -90; bp <= 100; bp++) {
    const rr = bp / 100
    const val = Math.abs(npv(rr, cfs))
    if (val < best.err) best = { r: rr, err: val }
  }
  return best.r
}

function buildDebtSchedule(
  amount: number,
  rate: number,
  term: number,
  horizon: number,
): { schedule: DebtYear[]; remaining: number } {
  if (amount <= 0) return { schedule: [], remaining: 0 }
  const pay = annuityPayment(amount, rate, term)
  let bal = amount
  const schedule: DebtYear[] = []
  for (let t = 1; t <= horizon; t++) {
    if (t <= term && bal > EPS) {
      const interest = bal * rate
      const principal = Math.min(pay - interest, bal)
      const payment = interest + principal
      const begin = bal
      bal -= principal
      schedule.push({
        year: t,
        beginBalance: begin,
        interest,
        principal,
        payment,
        endBalance: bal,
      })
    } else {
      schedule.push({
        year: t,
        beginBalance: bal,
        interest: 0,
        principal: 0,
        payment: 0,
        endBalance: bal,
      })
    }
  }
  const remaining = horizon < term ? bal : 0
  return { schedule, remaining }
}

export function runDCF(input: Input): Result {
  const in_ = { prepayPenaltyRate: 0, ...input }
  const N = in_.years

  const cfAsset = new Array<number>(N + 1).fill(0)
  const cfEquity = new Array<number>(N + 1).fill(0)

  // 初期CF
  cfAsset[0] = -(in_.p0 + in_.i0)
  cfEquity[0] = -(in_.p0 + in_.i0 - in_.loanAmount)

  // 債務スケジュール
  const { schedule, remaining } = buildDebtSchedule(
    in_.loanAmount,
    in_.loanRate,
    in_.loanTerm,
    N,
  )

  // 年次CF
  for (let t = 1; t <= N; t++) {
    const rentMonthly =
      in_.rentMonthly0 * pow1p(in_.inflation - in_.rentDecay, t - 1)
    const egi = 12 * rentMonthly * (1 - in_.vacancy)
    const opex = 12 * in_.monthlyOpex0 * pow1p(in_.inflation, t - 1)
    const tax = in_.taxAnnualFixed // 固定額
    const noi = egi - opex - tax

    cfAsset[t] = noi

    const debtPay = t <= schedule.length ? schedule[t - 1].payment : 0
    cfEquity[t] = noi - debtPay
  }

  // 売却（価格パス）
  const pN = in_.p0 * pow1p(in_.inflation - in_.priceDecay, N) // 終価（コスト控除前）
  const saleNet = pN * (1 - in_.exitCostRate)
  const prepay = remaining * (in_.prepayPenaltyRate ?? 0)

  cfAsset[N] += saleNet
  cfEquity[N] += saleNet - remaining - prepay

  // 指標
  const npvAsset = npv(in_.discountAsset, cfAsset)
  const npvEquity = npv(in_.discountEquity, cfEquity)
  const irrAsset = irr(cfAsset, 0.06)
  const irrEquity = irr(cfEquity, 0.08)

  // 暗黙のCap（検算用）：翌年NOI / P_N
  const rentN1 = in_.rentMonthly0 * pow1p(in_.inflation - in_.rentDecay, N)
  const egiN1 = 12 * rentN1 * (1 - in_.vacancy)
  const opexN1 = 12 * in_.monthlyOpex0 * pow1p(in_.inflation, N)
  const taxN1 = in_.taxAnnualFixed
  const noiN1 = egiN1 - opexN1 - taxN1
  const implicitCap = noiN1 / pN // 市場Capと大ズレがないかの目安

  return {
    cfAsset,
    cfEquity,
    npvAsset,
    npvEquity,
    irrAsset,
    irrEquity,
    salePriceNet: saleNet,
    remainingDebtAtExit: remaining,
    implicitCap,
  }
}

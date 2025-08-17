import type { DebtYear, Input, Result } from '@/types/dcf'
import { validateInput } from '@/lib/type-guards'
import { 
  DCFError, 
  DCFErrorType, 
  validateBusinessRules, 
  validateCalculationResults, 
  logError 
} from '@/lib/error-utils'

const EPS = 1e-12

const pow1p = (x: number, n: number) => (1 + x) ** n

const annuityPayment = (principal: number, rate: number, years: number) => {
  if (principal <= 0 || years <= 0) return 0
  if (Math.abs(rate) < EPS) return principal / years
  return (principal * rate) / (1 - (1 + rate) ** -years)
}

const npv = (rate: number, cfs: number[]) =>
  cfs.reduce((acc, cf, t) => acc + cf / (1 + rate) ** t, 0)

/**
 * Calculate IRR using robust numerical methods
 */
const irr = (cfs: number[], guess = 0.08): number => {
  // Validate input cash flows
  if (!cfs || cfs.length === 0) {
    throw new DCFError(
      DCFErrorType.IRR_CALCULATION_FAILED,
      'キャッシュフローが空です',
      'cashFlows',
      cfs
    )
  }

  // Check if all cash flows are the same sign (no solution exists)
  const positiveCount = cfs.filter(cf => cf > 0).length
  const negativeCount = cfs.filter(cf => cf < 0).length
  
  if (positiveCount === 0 || negativeCount === 0) {
    throw new DCFError(
      DCFErrorType.IRR_CALCULATION_FAILED,
      'IRR計算にはプラスとマイナスの両方のキャッシュフローが必要です',
      'cashFlows',
      cfs,
      { positiveCount, negativeCount }
    )
  }

  // Newton-Raphson method with improved convergence checks
  let r = guess
  let lastR = Number.POSITIVE_INFINITY
  const maxIterations = 100
  const tolerance = 1e-8
  
  for (let i = 0; i < maxIterations; i++) {
    let f = 0
    let df = 0
    
    // Calculate NPV and its derivative
    for (let t = 0; t < cfs.length; t++) {
      const powerTerm = (1 + r) ** t
      
      // Check for numerical overflow
      if (!Number.isFinite(powerTerm) || powerTerm <= 0) {
        throw new DCFError(
          DCFErrorType.NUMERICAL_INSTABILITY,
          `IRR計算で数値オーバーフローが発生しました (r=${r}, t=${t})`,
          'irr',
          r,
          { iteration: i, period: t, powerTerm }
        )
      }
      
      f += cfs[t] / powerTerm
      if (t > 0) {
        df -= (t * cfs[t]) / (powerTerm * (1 + r))
      }
    }
    
    // Check derivative for near-zero values
    if (Math.abs(df) < 1e-14) {
      throw new DCFError(
        DCFErrorType.NUMERICAL_INSTABILITY,
        'IRR計算の導関数がゼロに近づきました。解が存在しないか不安定です',
        'irr',
        r,
        { iteration: i, derivative: df, npv: f }
      )
    }
    
    const newR = r - f / df
    
    // Check for convergence
    if (Number.isFinite(newR) && Math.abs(newR - r) < tolerance) {
      return newR
    }
    
    // Check for oscillation
    if (Math.abs(newR - lastR) < tolerance) {
      logError(new DCFError(
        DCFErrorType.NUMERICAL_INSTABILITY,
        'IRR計算が振動しています。二分法にフォールバックします',
        'irr',
        newR,
        { iteration: i, currentR: r, newR, lastR }
      ))
      break
    }
    
    // Prevent extreme values
    if (!Number.isFinite(newR) || Math.abs(newR) > 100) {
      logError(new DCFError(
        DCFErrorType.NUMERICAL_INSTABILITY,
        'IRR計算が発散しました。二分法にフォールバックします',
        'irr',
        newR,
        { iteration: i, currentR: r, newR }
      ))
      break
    }
    
    lastR = r
    r = newR
  }
  
  // Fallback: Bisection method with finer granularity
  return bisectionIRR(cfs)
}

/**
 * Fallback IRR calculation using bisection method
 */
const bisectionIRR = (cfs: number[]): number => {
  let low = -0.99  // -99% lower bound
  let high = 10.0  // 1000% upper bound
  const tolerance = 1e-6
  const maxIterations = 100
  
  // Check bounds
  const npvLow = npv(low, cfs)
  const npvHigh = npv(high, cfs)
  
  if (npvLow * npvHigh > 0) {
    // Try grid search first
    const gridResult = gridSearchIRR(cfs)
    if (Number.isFinite(gridResult)) {
      return gridResult
    }
    
    throw new DCFError(
      DCFErrorType.IRR_CALCULATION_FAILED,
      'IRR解が存在しないか、複数の解が存在します',
      'irr',
      undefined,
      { npvAtLowBound: npvLow, npvAtHighBound: npvHigh, lowBound: low, highBound: high }
    )
  }
  
  // Bisection method
  for (let i = 0; i < maxIterations; i++) {
    const mid = (low + high) / 2
    const npvMid = npv(mid, cfs)
    
    if (Math.abs(npvMid) < tolerance || Math.abs(high - low) < tolerance) {
      return mid
    }
    
    if (npvMid * npvLow < 0) {
      high = mid
    } else {
      low = mid
    }
  }
  
  // If bisection fails, try grid search
  const gridResult = gridSearchIRR(cfs)
  if (Number.isFinite(gridResult)) {
    return gridResult
  }
  
  throw new DCFError(
    DCFErrorType.IRR_CALCULATION_FAILED,
    'IRR計算が収束しませんでした',
    'irr',
    undefined,
    { method: 'bisection', iterations: maxIterations }
  )
}

/**
 * Grid search IRR calculation as last resort
 */
const gridSearchIRR = (cfs: number[]): number => {
  let best = { r: Number.NaN, err: Number.POSITIVE_INFINITY }
  
  // Coarse grid search: -95% to 500% in 1% steps
  for (let bp = -95; bp <= 500; bp++) {
    const rr = bp / 100
    try {
      const val = Math.abs(npv(rr, cfs))
      if (Number.isFinite(val) && val < best.err) {
        best = { r: rr, err: val }
      }
    } catch {
      // Skip this rate if NPV calculation fails
      continue
    }
  }
  
  // Fine grid search around the best result
  if (Number.isFinite(best.r) && best.err < 1e6) {
    const center = best.r
    const step = 0.001 // 0.1% steps
    const range = 0.05  // ±5% around best result
    
    for (let offset = -range; offset <= range; offset += step) {
      const rr = center + offset
      if (rr <= -1) continue // Skip invalid rates
      
      try {
        const val = Math.abs(npv(rr, cfs))
        if (Number.isFinite(val) && val < best.err) {
          best = { r: rr, err: val }
        }
      } catch {
        continue
      }
    }
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
        beginBalance: Math.max(0, begin),
        interest: Math.max(0, interest),
        principal: Math.max(0, principal),
        payment: Math.max(0, payment),
        endBalance: Math.max(0, bal),
      })
    } else {
      schedule.push({
        year: t,
        beginBalance: Math.max(0, bal),
        interest: 0,
        principal: 0,
        payment: 0,
        endBalance: Math.max(0, bal),
      })
    }
  }
  const remaining = horizon < term ? bal : 0
  return { schedule, remaining }
}

export function runDCF(input: Input): Result {
  const collectedWarnings: DCFError[] = []
  
  try {
    // Validate input at runtime for type safety
    const validation = validateInput(input)
    if (!validation.isValid) {
      const errorMessages = validation.errors.map(e => `${e.field}: ${e.message}`).join(', ')
      const error = new DCFError(
        DCFErrorType.INVALID_INPUT,
        `入力値のバリデーションエラー: ${errorMessages}`,
        undefined,
        input,
        { validationErrors: validation.errors }
      )
      logError(error, 'runDCF:inputValidation')
      throw error
    }

    // Validate business rules
    const businessValidation = validateBusinessRules(validation.value!)
    if (!businessValidation.isValid) {
      const error = businessValidation.errors[0] // Throw first critical error
      logError(error, 'runDCF:businessRules')
      throw error
    }

    // Collect warnings
    businessValidation.warnings.forEach(warning => {
      logError(warning, 'runDCF:businessRulesWarning')
      collectedWarnings.push(warning)
    })

    const in_ = { prepayPenaltyRate: 0 as const, ...validation.value! }
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

      // Check for negative NOI that could cause calculation issues
      if (noi < 0 && t < N) {
        const warning = new DCFError(
          DCFErrorType.UNREALISTIC_RESULT,
          `${t}年目のNOIがマイナスです: ${noi.toLocaleString()}円`,
          'noi',
          noi,
          { year: t, egi, opex, tax }
        )
        logError(warning, 'runDCF:negativeNOI')
        collectedWarnings.push(warning)
      }

      cfAsset[t] = noi

      const debtPay = t <= schedule.length ? schedule[t - 1].payment : 0
      cfEquity[t] = noi - debtPay
    }

    // 売却（価格パス）
    const pN = in_.p0 * pow1p(in_.inflation - in_.priceDecay, N) // 終価（コスト控除前）
    
    // Check for unrealistic property value decline
    if (pN <= 0) {
      throw new DCFError(
        DCFErrorType.UNREALISTIC_RESULT,
        `売却時の物件価格がゼロ以下になっています: ${pN.toLocaleString()}円`,
        'salePrice',
        pN,
        { initialPrice: in_.p0, priceDecay: in_.priceDecay, inflation: in_.inflation, years: N }
      )
    }
    
    const saleNet = pN * (1 - in_.exitCostRate)
    const prepay = remaining * (in_.prepayPenaltyRate ?? 0)

    cfAsset[N] += saleNet
    cfEquity[N] += saleNet - remaining - prepay

    // 指標計算
    let npvAsset: number
    let npvEquity: number
    let irrAsset: number
    let irrEquity: number
    
    try {
      npvAsset = npv(in_.discountAsset, cfAsset)
      npvEquity = npv(in_.discountEquity, cfEquity)
    } catch (error) {
      throw new DCFError(
        DCFErrorType.NUMERICAL_INSTABILITY,
        'NPV計算中にエラーが発生しました',
        'npv',
        undefined,
        { originalError: error, discountAsset: in_.discountAsset, discountEquity: in_.discountEquity }
      )
    }
    
    try {
      irrAsset = irr(cfAsset, 0.06)
    } catch (error) {
      if (error instanceof DCFError) {
        // Re-throw DCF errors with additional context
        throw new DCFError(
          error.type,
          error.message,
          error.field,
          error.value,
          { ...error.debugInfo, cashFlowType: 'asset', cashFlows: cfAsset }
        )
      }
      throw new DCFError(
        DCFErrorType.IRR_CALCULATION_FAILED,
        '資産IRRの計算に失敗しました',
        'irrAsset',
        undefined,
        { originalError: error, cashFlows: cfAsset }
      )
    }
    
    try {
      irrEquity = irr(cfEquity, 0.08)
    } catch (error) {
      if (error instanceof DCFError) {
        // Re-throw DCF errors with additional context
        throw new DCFError(
          error.type,
          error.message,
          error.field,
          error.value,
          { ...error.debugInfo, cashFlowType: 'equity', cashFlows: cfEquity }
        )
      }
      throw new DCFError(
        DCFErrorType.IRR_CALCULATION_FAILED,
        'エクイティIRRの計算に失敗しました',
        'irrEquity',
        undefined,
        { originalError: error, cashFlows: cfEquity }
      )
    }

    // 暗黙のCap（検算用）：翌年NOI / P_N
    const rentN1 = in_.rentMonthly0 * pow1p(in_.inflation - in_.rentDecay, N)
    const egiN1 = 12 * rentN1 * (1 - in_.vacancy)
    const opexN1 = 12 * in_.monthlyOpex0 * pow1p(in_.inflation, N)
    const taxN1 = in_.taxAnnualFixed
    const noiN1 = egiN1 - opexN1 - taxN1
    const implicitCap = noiN1 > 0 && pN > 0 ? noiN1 / pN : undefined

    // Validate calculation results
    const resultErrors = validateCalculationResults(
      irrAsset,
      irrEquity,
      npvAsset,
      npvEquity,
      implicitCap
    )
    
    // Collect result validation errors as warnings (don't fail the calculation)
    resultErrors.forEach(error => {
      logError(error, 'runDCF:resultValidation')
      collectedWarnings.push(error)
    })

    return {
      cfAsset,
      cfEquity,
      npvAsset,
      npvEquity,
      irrAsset,
      irrEquity,
      salePriceNet: Math.max(0, saleNet),
      remainingDebtAtExit: Math.max(0, remaining),
      implicitCap,
      warnings: collectedWarnings.length > 0 ? collectedWarnings : undefined,
    }
  } catch (error) {
    // Ensure all errors are properly wrapped
    if (error instanceof DCFError) {
      throw error
    }
    
    // Wrap unexpected errors
    const wrappedError = new DCFError(
      DCFErrorType.NUMERICAL_INSTABILITY,
      `予期しないエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
      undefined,
      input,
      { originalError: error }
    )
    logError(wrappedError, 'runDCF:unexpected')
    throw wrappedError
  }
}

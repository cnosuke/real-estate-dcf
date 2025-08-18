import {
  DCFError,
  DCFErrorFactory,
  DCFErrorLogger,
  DCFErrorType,
  ErrorSeverity,
} from '@/lib/errors'
import { DCFValidator } from '@/lib/validation'
import type { DebtYear, Input, Result } from '@/types/dcf'
import { CALCULATION_CONFIG } from './calculation-config'
import { IRRCalculator } from './irr'

const pow1p = (x: number, n: number) => (1 + x) ** n

const annuityPayment = (principal: number, rate: number, years: number) => {
  if (principal <= 0 || years <= 0) return 0
  if (Math.abs(rate) < CALCULATION_CONFIG.EPS) return principal / years
  return (principal * rate) / (1 - (1 + rate) ** -years)
}

const npv = (rate: number, cfs: number[]) =>
  cfs.reduce((acc, cf, t) => acc + cf / (1 + rate) ** t, 0)

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
    if (t <= term && bal > CALCULATION_CONFIG.EPS) {
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
    // Validate input using unified validator
    const inputValidation = DCFValidator.validateInput(input)
    if (!inputValidation.isValid) {
      const error = inputValidation.errors[0] // Throw first validation error
      DCFErrorLogger.log(error, 'runDCF:inputValidation')
      throw error
    }

    // Validate business rules using unified validator
    const validatedInput = inputValidation.value as Input // 既にバリデーション済み
    const businessValidation =
      DCFValidator.validateBusinessRules(validatedInput)
    if (!businessValidation.isValid) {
      const error = businessValidation.errors[0] // Throw first critical error
      DCFErrorLogger.log(error, 'runDCF:businessRules')
      throw error
    }

    // Collect warnings
    businessValidation.warnings.forEach((warning) => {
      DCFErrorLogger.log(warning, 'runDCF:businessRulesWarning')
      collectedWarnings.push(warning)
    })

    const in_ = { prepayPenaltyRate: 0 as const, ...validatedInput }
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
        const warning = DCFErrorFactory.createWarning(
          DCFErrorType.UNREALISTIC_RESULT,
          `${t}年目のNOIがマイナスです: ${noi.toLocaleString()}円`,
          {
            field: 'noi',
            value: noi,
            operation: 'cash_flow_calculation',
            metadata: { year: t, egi, opex, tax },
          },
        )
        DCFErrorLogger.log(warning, 'runDCF:negativeNOI')
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
        ErrorSeverity.ERROR,
        `売却時の物件価格がゼロ以下になっています: ${pN.toLocaleString()}円`,
        {
          field: 'salePrice',
          value: pN,
          operation: 'sale_price_calculation',
          metadata: {
            initialPrice: in_.p0,
            priceDecay: in_.priceDecay,
            inflation: in_.inflation,
            years: N,
          },
        },
      )
    }

    const saleNet = pN * (1 - in_.exitCostRate)
    const prepay = remaining * (in_.prepayPenaltyRate ?? 0)

    cfAsset[N] += saleNet
    cfEquity[N] += saleNet - remaining - prepay

    // 指標計算
    let npvAsset: number
    let npvEquity: number

    try {
      npvAsset = npv(in_.discountAsset, cfAsset)
      npvEquity = npv(in_.discountEquity, cfEquity)
    } catch (error) {
      throw DCFErrorFactory.createCalculationError('npv_calculation', {
        originalError: error,
        discountAsset: in_.discountAsset,
        discountEquity: in_.discountEquity,
      })
    }

    // IRR calculation using new strategy pattern approach
    const irrCalculator = new IRRCalculator()

    const assetIRRResult = irrCalculator.calculate(cfAsset, 0.06)
    if (!assetIRRResult.converged) {
      throw (
        assetIRRResult.error ||
        DCFErrorFactory.createIRRError('unknown', cfAsset, {
          cashFlowType: 'asset',
        })
      )
    }
    const irrAsset = assetIRRResult.value

    const equityIRRResult = irrCalculator.calculate(cfEquity, 0.08)
    if (!equityIRRResult.converged) {
      throw (
        equityIRRResult.error ||
        DCFErrorFactory.createIRRError('unknown', cfEquity, {
          cashFlowType: 'equity',
        })
      )
    }
    const irrEquity = equityIRRResult.value

    // 暗黙のCap（検算用）：翌年NOI / P_N
    const rentN1 = in_.rentMonthly0 * pow1p(in_.inflation - in_.rentDecay, N)
    const egiN1 = 12 * rentN1 * (1 - in_.vacancy)
    const opexN1 = 12 * in_.monthlyOpex0 * pow1p(in_.inflation, N)
    const taxN1 = in_.taxAnnualFixed
    const noiN1 = egiN1 - opexN1 - taxN1
    const implicitCap = noiN1 > 0 && pN > 0 ? noiN1 / pN : undefined

    // Validate calculation results using unified validator
    const result: Partial<Result> = {
      irrAsset,
      irrEquity,
      npvAsset,
      npvEquity,
      implicitCap,
    }

    const resultValidation = DCFValidator.validateResults(result)

    // Collect result validation errors as warnings (don't fail the calculation)
    resultValidation.errors.forEach((error) => {
      DCFErrorLogger.log(error, 'runDCF:resultValidation')
      collectedWarnings.push(error)
    })

    resultValidation.warnings.forEach((warning) => {
      DCFErrorLogger.log(warning, 'runDCF:resultValidationWarning')
      collectedWarnings.push(warning)
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
      ErrorSeverity.CRITICAL,
      `予期しないエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
      {
        field: 'system',
        value: input,
        operation: 'dcf_calculation',
        metadata: { originalError: error },
      },
    )
    DCFErrorLogger.log(wrappedError, 'runDCF:unexpected')
    throw wrappedError
  }
}

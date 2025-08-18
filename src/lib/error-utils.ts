import type { Input } from '@/types/dcf'
import { DCF_CONFIG } from '@/lib/dcf/config'

/**
 * Error classification for DCF calculations
 */
export enum DCFErrorType {
  // Input validation errors
  INVALID_INPUT = 'INVALID_INPUT',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  
  // Calculation errors
  IRR_CALCULATION_FAILED = 'IRR_CALCULATION_FAILED',
  NUMERICAL_INSTABILITY = 'NUMERICAL_INSTABILITY',
  
  // Result validation errors
  UNREALISTIC_RESULT = 'UNREALISTIC_RESULT',
  MARKET_INCONSISTENCY = 'MARKET_INCONSISTENCY',
}

/**
 * エラーの重要度レベル
 */
export enum ErrorSeverity {
  WARNING = 'warning',  // 警告（計算は継続可能）
  ERROR = 'error',      // エラー（計算停止）
  CRITICAL = 'critical' // 重大エラー（システム異常）
}

/**
 * 構造化されたエラー情報
 */
export interface ErrorContext {
  field?: string
  value?: unknown
  operation?: string
  metadata?: Record<string, unknown>
}

/**
 * DCF計算専用エラークラス - 責務を明確化
 */
export class DCFError extends Error {
  constructor(
    public readonly type: DCFErrorType,
    public readonly severity: ErrorSeverity,
    message: string,
    public readonly context?: ErrorContext
  ) {
    super(message)
    this.name = 'DCFError'
  }

  /**
   * ユーザー向けの分かりやすいメッセージを生成
   */
  getUserMessage(): string {
    const baseMessage = DCF_CONFIG.ERROR_MESSAGES[this.type] || this.message
    if (this.context?.field) {
      return `${this.context.field}: ${baseMessage}`
    }
    return baseMessage
  }

  /**
   * 開発者向けの詳細情報を取得
   */
  getDebugInfo(): Record<string, unknown> {
    return {
      type: this.type,
      severity: this.severity,
      field: this.context?.field,
      value: this.context?.value,
      operation: this.context?.operation,
      metadata: this.context?.metadata,
      stack: this.stack
    }
  }

  // 下位互換性のために既存プロパティを維持
  get field(): string | undefined {
    return this.context?.field
  }

  get value(): unknown {
    return this.context?.value
  }

  get debugInfo(): Record<string, unknown> | undefined {
    return this.context?.metadata
  }
}

/**
 * エラーファクトリークラス - エラー生成の責務を集約
 */
export class DCFErrorFactory {
  static createValidationError(field: string, value: unknown, message?: string): DCFError {
    return new DCFError(
      DCFErrorType.INVALID_INPUT,
      ErrorSeverity.ERROR,
      message || DCF_CONFIG.ERROR_MESSAGES.INVALID_INPUT || '入力値が無効です',
      { field, value, operation: 'validation' }
    )
  }

  static createCalculationError(operation: string, details?: Record<string, unknown>): DCFError {
    return new DCFError(
      DCFErrorType.NUMERICAL_INSTABILITY,
      ErrorSeverity.ERROR,
      DCF_CONFIG.ERROR_MESSAGES.CALCULATION_FAILED,
      { operation, metadata: details }
    )
  }

  static createIRRError(method: string, cashFlows: number[], details?: Record<string, unknown>): DCFError {
    return new DCFError(
      DCFErrorType.IRR_CALCULATION_FAILED,
      ErrorSeverity.ERROR,
      DCF_CONFIG.ERROR_MESSAGES.IRR_CONVERGENCE_FAILED,
      { 
        operation: 'irr_calculation',
        metadata: { method, cashFlowLength: cashFlows.length, ...details }
      }
    )
  }

  static createWarning(type: DCFErrorType, message: string, context?: ErrorContext): DCFError {
    return new DCFError(type, ErrorSeverity.WARNING, message, context)
  }

  static createBusinessRuleError(field: string, value: unknown, message: string, metadata?: Record<string, unknown>): DCFError {
    return new DCFError(
      DCFErrorType.BUSINESS_RULE_VIOLATION,
      ErrorSeverity.ERROR,
      message,
      { field, value, operation: 'business_rule_validation', metadata }
    )
  }

  static createBusinessRuleWarning(field: string, value: unknown, message: string, metadata?: Record<string, unknown>): DCFError {
    return new DCFError(
      DCFErrorType.BUSINESS_RULE_VIOLATION,
      ErrorSeverity.WARNING,
      message,
      { field, value, operation: 'business_rule_validation', metadata }
    )
  }
}

/**
 * エラーロガー - ログ出力の責務を分離
 */
export class DCFErrorLogger {
  private static logLevel: ErrorSeverity = ErrorSeverity.WARNING

  static setLogLevel(level: ErrorSeverity): void {
    this.logLevel = level
  }

  static log(error: DCFError, context?: string): void {
    const shouldLog = this.shouldLog(error.severity)
    if (!shouldLog) return

    const logData = {
      timestamp: new Date().toISOString(),
      context: context || 'unknown',
      error: error.getDebugInfo()
    }

    switch (error.severity) {
      case ErrorSeverity.WARNING:
        console.warn('[DCF Warning]', logData)
        break
      case ErrorSeverity.ERROR:
        console.error('[DCF Error]', logData)
        break
      case ErrorSeverity.CRITICAL:
        console.error('[DCF CRITICAL]', logData)
        break
    }
  }

  private static shouldLog(severity: ErrorSeverity): boolean {
    const levels = [ErrorSeverity.WARNING, ErrorSeverity.ERROR, ErrorSeverity.CRITICAL]
    const currentIndex = levels.indexOf(this.logLevel)
    const errorIndex = levels.indexOf(severity)
    return errorIndex >= currentIndex
  }
}

/**
 * Business rule validation result
 */
export interface BusinessRuleValidation {
  isValid: boolean
  errors: DCFError[]
  warnings: DCFError[]
}

/**
 * Validate business rules for DCF input
 */
export function validateBusinessRules(input: Input): BusinessRuleValidation {
  const errors: DCFError[] = []
  const warnings: DCFError[] = []

  // Loan amount exceeding 120% of property price is treated as warning
  if (input.loanAmount > input.p0 * 1.2) {
    warnings.push(DCFErrorFactory.createBusinessRuleWarning(
      'loanAmount',
      input.loanAmount,
      '借入額が物件価格の120%を超えています。高いレバレッジとなります',
      { propertyPrice: input.p0, loanAmount: input.loanAmount, maxLoanAmount: input.p0 * 1.2 }
    ))
  }

  // Loan term should be reasonable relative to holding period
  if (input.loanTerm < input.years) {
    warnings.push(DCFErrorFactory.createBusinessRuleWarning(
      'loanTerm',
      input.loanTerm,
      DCF_CONFIG.ERROR_MESSAGES.SHORT_LOAN_TERM,
      { loanTerm: input.loanTerm, holdingPeriod: input.years }
    ))
  }

  // Check for unrealistic parameter combinations
  if (input.rentDecay > DCF_CONFIG.VALIDATION.REASONABLE_BOUNDS.RENT_DECAY.MAX) {
    warnings.push(DCFErrorFactory.createBusinessRuleWarning(
      'rentDecay',
      input.rentDecay,
      DCF_CONFIG.ERROR_MESSAGES.HIGH_RENT_DECAY
    ))
  }

  if (input.priceDecay > DCF_CONFIG.VALIDATION.REASONABLE_BOUNDS.PRICE_DECAY.MAX) {
    warnings.push(DCFErrorFactory.createBusinessRuleWarning(
      'priceDecay',
      input.priceDecay,
      DCF_CONFIG.ERROR_MESSAGES.HIGH_PRICE_DECAY
    ))
  }

  if (input.vacancy > DCF_CONFIG.VALIDATION.REASONABLE_BOUNDS.VACANCY.MAX) {
    warnings.push(DCFErrorFactory.createBusinessRuleWarning(
      'vacancy',
      input.vacancy,
      DCF_CONFIG.ERROR_MESSAGES.HIGH_VACANCY
    ))
  }

  // Check discount rates
  if (input.discountEquity < input.discountAsset) {
    warnings.push(DCFErrorFactory.createBusinessRuleWarning(
      'discountEquity',
      input.discountEquity,
      DCF_CONFIG.ERROR_MESSAGES.EQUITY_DISCOUNT_RATE_ANOMALY,
      { discountAsset: input.discountAsset, discountEquity: input.discountEquity }
    ))
  }

  // Check for unrealistic inflation rate
  if (input.inflation < DCF_CONFIG.VALIDATION.REASONABLE_BOUNDS.INFLATION.MIN || 
      input.inflation > DCF_CONFIG.VALIDATION.REASONABLE_BOUNDS.INFLATION.MAX) {
    warnings.push(DCFErrorFactory.createBusinessRuleWarning(
      'inflation',
      input.inflation,
      'インフレ率が非現実的な値です（一般的な範囲：-10%〜20%）',
      { 
        value: input.inflation, 
        minBound: DCF_CONFIG.VALIDATION.REASONABLE_BOUNDS.INFLATION.MIN,
        maxBound: DCF_CONFIG.VALIDATION.REASONABLE_BOUNDS.INFLATION.MAX
      }
    ))
  }

  // Check for high interest rate
  if (input.loanRate > 0.1) { // 10%以上
    warnings.push(DCFErrorFactory.createBusinessRuleWarning(
      'loanRate',
      input.loanRate,
      '借入金利が高すぎる可能性があります（10%を超えています）',
      { value: input.loanRate }
    ))
  }

  // Check for high LTV ratio
  const ltvRatio = input.loanAmount / input.p0
  if (ltvRatio > 0.9) { // 90%以上
    warnings.push(DCFErrorFactory.createBusinessRuleWarning(
      'loanAmount',
      ltvRatio,
      '借入比率（LTV）が高すぎる可能性があります（90%を超えています）',
      { 
        ltvRatio: ltvRatio,
        loanAmount: input.loanAmount,
        propertyPrice: input.p0
      }
    ))
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validate DCF result for cash flow and business logic issues
 */
export function validateDCFResults(
  input: Input,
  result: { 
    cfAsset: number[]
    cfEquity: number[]
    irrAsset: number
    irrEquity: number
    npvAsset: number
    npvEquity: number
    salePriceNet: number
    remainingDebtAtExit: number
    implicitCap?: number
  }
): DCFError[] {
  const warnings: DCFError[] = []

  // Check for negative NOI years (except year 0 which is initial investment)
  const annualNOI = calculateAnnualNOI(input, result.cfAsset)
  for (let i = 1; i < annualNOI.length; i++) {
    if (annualNOI[i] < 0) {
      warnings.push(DCFErrorFactory.createWarning(
        DCFErrorType.UNREALISTIC_RESULT,
        `営業純利益（NOI）が${i}年目にマイナスになっています（${Math.round(annualNOI[i]).toLocaleString()}円）`,
        { 
          field: `noi_year_${i}`, 
          value: annualNOI[i], 
          operation: 'noi_validation',
          metadata: { year: i }
        }
      ))
    }
  }

  // Check for negative sale price
  if (result.salePriceNet <= 0) {
    warnings.push(DCFErrorFactory.createWarning(
      DCFErrorType.UNREALISTIC_RESULT,
      '売却時の物件価格がゼロ以下になっています',
      { 
        field: 'salePriceNet', 
        value: result.salePriceNet, 
        operation: 'sale_price_validation'
      }
    ))
  }

  // Check for highly volatile equity cash flows
  if (hasVolatileEquityCashFlow(result.cfEquity)) {
    warnings.push(DCFErrorFactory.createWarning(
      DCFErrorType.BUSINESS_RULE_VIOLATION,
      'エクイティキャッシュフローが不安定です。借入条件の見直しをお勧めします',
      { 
        field: 'cfEquity', 
        value: result.cfEquity, 
        operation: 'cash_flow_stability_check'
      }
    ))
  }

  // Check if investment is heavily dependent on sale proceeds
  if (isExitDependent(result.cfEquity, input.years)) {
    warnings.push(DCFErrorFactory.createWarning(
      DCFErrorType.MARKET_INCONSISTENCY,
      'IRRは高いがNPVが低い「期末頼み」の投資パターンです。売却価格の前提を保守的に見直すことをお勧めします',
      { 
        field: 'investment_pattern', 
        value: 'exit_dependent', 
        operation: 'investment_pattern_analysis'
      }
    ))
  }

  // Add existing calculation result validations
  const calculationWarnings = validateCalculationResults(
    result.irrAsset,
    result.irrEquity,
    result.npvAsset,
    result.npvEquity,
    result.implicitCap
  )
  warnings.push(...calculationWarnings)

  return warnings
}

/**
 * Calculate annual NOI from asset cash flows
 */
function calculateAnnualNOI(input: Input, cfAsset: number[]): number[] {
  // NOI is approximated from asset cash flows
  // This is a simplified calculation - actual NOI calculation would require more detailed data
  const noi: number[] = []
  
  for (let i = 0; i < cfAsset.length; i++) {
    if (i === 0) {
      noi.push(cfAsset[i]) // Initial investment (negative)
    } else if (i === cfAsset.length - 1) {
      // Last year includes sale proceeds, so we need to extract operating NOI
      // This is approximate - ideally we'd have separate operating and sale components
      const estimatedSaleProceeds = input.p0 * Math.pow(1 + input.inflation - input.priceDecay, input.years)
      const operatingCF = cfAsset[i] - estimatedSaleProceeds
      noi.push(operatingCF)
    } else {
      noi.push(cfAsset[i])
    }
  }
  
  return noi
}

/**
 * Check if equity cash flows are highly volatile
 */
function hasVolatileEquityCashFlow(cfEquity: number[]): boolean {
  if (cfEquity.length < 3) return false
  
  // Skip year 0 (initial investment) and last year (sale)
  const operatingCashFlows = cfEquity.slice(1, -1)
  if (operatingCashFlows.length < 2) return false
  
  // Calculate coefficient of variation
  const mean = operatingCashFlows.reduce((sum, cf) => sum + cf, 0) / operatingCashFlows.length
  if (Math.abs(mean) < 1000) return false // Too small to be meaningful
  
  const variance = operatingCashFlows.reduce((sum, cf) => sum + Math.pow(cf - mean, 2), 0) / operatingCashFlows.length
  const stdDev = Math.sqrt(variance)
  const coefficientOfVariation = stdDev / Math.abs(mean)
  
  return coefficientOfVariation > 0.5 // High volatility if CV > 50%
}

/**
 * Check if investment is heavily dependent on exit proceeds
 */
function isExitDependent(cfEquity: number[], years: number): boolean {
  if (cfEquity.length < 2) return false
  
  const totalOperatingCF = cfEquity.slice(1, -1).reduce((sum, cf) => sum + cf, 0)
  const exitCF = cfEquity[cfEquity.length - 1]
  
  // Consider exit-dependent if operating cash flows are less than 30% of exit cash flow
  return totalOperatingCF > 0 && exitCF > 0 && (totalOperatingCF / exitCF) < 0.3
}

/**
 * Validate calculation results for reasonableness
 */
export function validateCalculationResults(
  irrAsset: number,
  irrEquity: number,
  npvAsset: number,
  npvEquity: number,
  implicitCap?: number
): DCFError[] {
  const errors: DCFError[] = []

  // Check for unrealistic IRR values
  if (!Number.isFinite(irrAsset) || Math.abs(irrAsset) > DCF_CONFIG.VALIDATION.REASONABLE_BOUNDS.IRR_ABSOLUTE.MAX) {
    errors.push(DCFErrorFactory.createWarning(
      DCFErrorType.UNREALISTIC_RESULT,
      `${DCF_CONFIG.ERROR_MESSAGES.UNREALISTIC_IRR_ASSET}: ${(irrAsset * 100).toFixed(1)}%`,
      { field: 'irrAsset', value: irrAsset, operation: 'result_validation' }
    ))
  }

  if (!Number.isFinite(irrEquity) || Math.abs(irrEquity) > DCF_CONFIG.VALIDATION.REASONABLE_BOUNDS.IRR_ABSOLUTE.MAX) {
    errors.push(DCFErrorFactory.createWarning(
      DCFErrorType.UNREALISTIC_RESULT,
      `${DCF_CONFIG.ERROR_MESSAGES.UNREALISTIC_IRR_EQUITY}: ${(irrEquity * 100).toFixed(1)}%`,
      { field: 'irrEquity', value: irrEquity, operation: 'result_validation' }
    ))
  }

  // Check for extremely high returns (likely calculation error)
  if (Math.abs(irrAsset) > DCF_CONFIG.VALIDATION.REASONABLE_BOUNDS.IRR_RELATIVE.MAX) {
    errors.push(DCFErrorFactory.createWarning(
      DCFErrorType.UNREALISTIC_RESULT,
      `${DCF_CONFIG.ERROR_MESSAGES.HIGH_IRR_ASSET}: ${(irrAsset * 100).toFixed(1)}%`,
      { field: 'irrAsset', value: irrAsset, operation: 'result_validation' }
    ))
  }

  if (Math.abs(irrEquity) > DCF_CONFIG.VALIDATION.REASONABLE_BOUNDS.IRR_RELATIVE.MAX) {
    errors.push(DCFErrorFactory.createWarning(
      DCFErrorType.UNREALISTIC_RESULT,
      `${DCF_CONFIG.ERROR_MESSAGES.HIGH_IRR_EQUITY}: ${(irrEquity * 100).toFixed(1)}%`,
      { field: 'irrEquity', value: irrEquity, operation: 'result_validation' }
    ))
  }

  // Check NPV values for extreme cases
  if (!Number.isFinite(npvAsset)) {
    errors.push(new DCFError(
      DCFErrorType.NUMERICAL_INSTABILITY,
      ErrorSeverity.ERROR,
      DCF_CONFIG.ERROR_MESSAGES.UNSTABLE_NPV_ASSET,
      { field: 'npvAsset', value: npvAsset, operation: 'npv_calculation' }
    ))
  }

  if (!Number.isFinite(npvEquity)) {
    errors.push(new DCFError(
      DCFErrorType.NUMERICAL_INSTABILITY,
      ErrorSeverity.ERROR,
      DCF_CONFIG.ERROR_MESSAGES.UNSTABLE_NPV_EQUITY,
      { field: 'npvEquity', value: npvEquity, operation: 'npv_calculation' }
    ))
  }

  // Check implicit cap rate for market reasonableness
  if (implicitCap !== undefined) {
    if (!Number.isFinite(implicitCap)) {
      errors.push(new DCFError(
        DCFErrorType.NUMERICAL_INSTABILITY,
        ErrorSeverity.ERROR,
        DCF_CONFIG.ERROR_MESSAGES.UNSTABLE_IMPLICIT_CAP,
        { field: 'implicitCap', value: implicitCap, operation: 'implicit_cap_calculation' }
      ))
    } else if (implicitCap < DCF_CONFIG.VALIDATION.REASONABLE_BOUNDS.IMPLICIT_CAP.MIN || implicitCap > DCF_CONFIG.VALIDATION.REASONABLE_BOUNDS.IMPLICIT_CAP.MAX) {
      errors.push(DCFErrorFactory.createWarning(
        DCFErrorType.MARKET_INCONSISTENCY,
        `${DCF_CONFIG.ERROR_MESSAGES.IMPLICIT_CAP_OUT_OF_RANGE}: ${(implicitCap * 100).toFixed(2)}%`,
        { field: 'implicitCap', value: implicitCap, operation: 'market_validation' }
      ))
    }
  }

  return errors
}

/**
 * Generate user-friendly error message
 * @deprecated Use DCFError.getUserMessage() instead
 */
export function generateErrorMessage(error: DCFError): string {
  // 新しいメソッドにフォールバック
  return error.getUserMessage()
}

/**
 * Log error for debugging purposes
 * @deprecated Use DCFErrorLogger.log() instead
 */
export function logError(error: DCFError, context?: string): void {
  DCFErrorLogger.log(error, context)
}

/**
 * Create a safe error for display to users
 * @deprecated Use DCFErrorFactory methods instead
 */
export function createDisplayError(
  type: DCFErrorType,
  message: string,
  field?: string
): DCFError {
  return new DCFError(type, ErrorSeverity.ERROR, message, { field })
}
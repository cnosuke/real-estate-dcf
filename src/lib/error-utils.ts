import type { Input } from '@/types/dcf'

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
 * DCF calculation error with detailed information
 */
export class DCFError extends Error {
  constructor(
    public readonly type: DCFErrorType,
    message: string,
    public readonly field?: string,
    public readonly value?: unknown,
    public readonly debugInfo?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'DCFError'
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

  // Loan amount should not exceed property price
  if (input.loanAmount > input.p0) {
    errors.push(new DCFError(
      DCFErrorType.BUSINESS_RULE_VIOLATION,
      '借入額が物件価格を超えています',
      'loanAmount',
      input.loanAmount,
      { propertyPrice: input.p0, loanAmount: input.loanAmount }
    ))
  }

  // Loan term should be reasonable relative to holding period
  if (input.loanTerm < input.years) {
    warnings.push(new DCFError(
      DCFErrorType.BUSINESS_RULE_VIOLATION,
      '返済期間が保有期間より短く、売却時に残債があります',
      'loanTerm',
      input.loanTerm,
      { loanTerm: input.loanTerm, holdingPeriod: input.years }
    ))
  }

  // Check for unrealistic parameter combinations
  if (input.rentDecay > 0.1) {
    warnings.push(new DCFError(
      DCFErrorType.BUSINESS_RULE_VIOLATION,
      '家賃下落率が10%を超えています。非常に厳しい想定です',
      'rentDecay',
      input.rentDecay
    ))
  }

  if (input.priceDecay > 0.05) {
    warnings.push(new DCFError(
      DCFErrorType.BUSINESS_RULE_VIOLATION,
      '物件価格下落率が5%を超えています。非常に厳しい想定です',
      'priceDecay',
      input.priceDecay
    ))
  }

  if (input.vacancy > 0.3) {
    warnings.push(new DCFError(
      DCFErrorType.BUSINESS_RULE_VIOLATION,
      '空室率が30%を超えています。非常に厳しい想定です',
      'vacancy',
      input.vacancy
    ))
  }

  // Check discount rates
  if (input.discountEquity < input.discountAsset) {
    warnings.push(new DCFError(
      DCFErrorType.BUSINESS_RULE_VIOLATION,
      'エクイティ割引率が資産割引率より低くなっています。通常はレバレッジリスクを考慮してエクイティの方が高くなります',
      'discountEquity',
      input.discountEquity,
      { discountAsset: input.discountAsset, discountEquity: input.discountEquity }
    ))
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
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
  if (!Number.isFinite(irrAsset) || Math.abs(irrAsset) > 10) {
    errors.push(new DCFError(
      DCFErrorType.UNREALISTIC_RESULT,
      `資産IRRが異常値です: ${(irrAsset * 100).toFixed(1)}%`,
      'irrAsset',
      irrAsset
    ))
  }

  if (!Number.isFinite(irrEquity) || Math.abs(irrEquity) > 10) {
    errors.push(new DCFError(
      DCFErrorType.UNREALISTIC_RESULT,
      `エクイティIRRが異常値です: ${(irrEquity * 100).toFixed(1)}%`,
      'irrEquity',
      irrEquity
    ))
  }

  // Check for extremely high returns (likely calculation error)
  if (Math.abs(irrAsset) > 1) {
    errors.push(new DCFError(
      DCFErrorType.UNREALISTIC_RESULT,
      `資産IRRが100%を超えています: ${(irrAsset * 100).toFixed(1)}%。計算に問題がある可能性があります`,
      'irrAsset',
      irrAsset
    ))
  }

  if (Math.abs(irrEquity) > 1) {
    errors.push(new DCFError(
      DCFErrorType.UNREALISTIC_RESULT,
      `エクイティIRRが100%を超えています: ${(irrEquity * 100).toFixed(1)}%。計算に問題がある可能性があります`,
      'irrEquity',
      irrEquity
    ))
  }

  // Check NPV values for extreme cases
  if (!Number.isFinite(npvAsset)) {
    errors.push(new DCFError(
      DCFErrorType.NUMERICAL_INSTABILITY,
      '資産NPVの計算が不安定です',
      'npvAsset',
      npvAsset
    ))
  }

  if (!Number.isFinite(npvEquity)) {
    errors.push(new DCFError(
      DCFErrorType.NUMERICAL_INSTABILITY,
      'エクイティNPVの計算が不安定です',
      'npvEquity',
      npvEquity
    ))
  }

  // Check implicit cap rate for market reasonableness
  if (implicitCap !== undefined) {
    if (!Number.isFinite(implicitCap)) {
      errors.push(new DCFError(
        DCFErrorType.NUMERICAL_INSTABILITY,
        '暗黙Cap率の計算が不安定です',
        'implicitCap',
        implicitCap
      ))
    } else if (implicitCap < 0.01 || implicitCap > 0.2) {
      errors.push(new DCFError(
        DCFErrorType.MARKET_INCONSISTENCY,
        `暗黙Cap率が市場の一般的範囲(1%-20%)を外れています: ${(implicitCap * 100).toFixed(2)}%`,
        'implicitCap',
        implicitCap
      ))
    }
  }

  return errors
}

/**
 * Generate user-friendly error message
 */
export function generateErrorMessage(error: DCFError): string {
  switch (error.type) {
    case DCFErrorType.INVALID_INPUT:
      return `入力値エラー: ${error.message}`
    
    case DCFErrorType.BUSINESS_RULE_VIOLATION:
      return `設定エラー: ${error.message}`
    
    case DCFErrorType.IRR_CALCULATION_FAILED:
      return `計算エラー: ${error.message}`
    
    case DCFErrorType.NUMERICAL_INSTABILITY:
      return `数値計算の問題: ${error.message}`
    
    case DCFErrorType.UNREALISTIC_RESULT:
      return `計算結果の警告: ${error.message}`
    
    case DCFErrorType.MARKET_INCONSISTENCY:
      return `市場整合性の警告: ${error.message}`
    
    default:
      return `エラー: ${error.message}`
  }
}

/**
 * Log error for debugging purposes
 */
export function logError(error: DCFError, context?: string): void {
  const logData = {
    type: error.type,
    message: error.message,
    field: error.field,
    value: error.value,
    debugInfo: error.debugInfo,
    context,
    timestamp: new Date().toISOString()
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.error('DCF Calculation Error:', logData)
  }
}

/**
 * Create a safe error for display to users
 */
export function createDisplayError(
  type: DCFErrorType,
  message: string,
  field?: string
): DCFError {
  return new DCFError(type, message, field)
}
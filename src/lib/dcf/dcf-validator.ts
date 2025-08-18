import type { Input, Result } from '@/types/dcf'
import { DCFErrorFactory, DCFError, ErrorSeverity, DCFErrorType } from '@/lib/error-utils'
import { DCF_CONFIG } from './config'

/**
 * バリデーション結果の統一インターフェース
 */
export interface ValidationResult<T = unknown> {
  isValid: boolean
  value?: T
  errors: DCFError[]
  warnings: DCFError[]
}

/**
 * DCF専用の統一バリデーションクラス
 */
export class DCFValidator {
  
  /**
   * 入力値の型・境界バリデーション
   */
  static validateInput(input: Input): ValidationResult<Input> {
    const errors: DCFError[] = []
    const warnings: DCFError[] = []

    // 基本型チェック
    if (!this.isFiniteNumber(input.p0) || input.p0 <= 0) {
      errors.push(DCFErrorFactory.createValidationError('p0', input.p0, '物件価格は正の数値である必要があります'))
    }

    if (!this.isFiniteNumber(input.i0) || input.i0 < 0) {
      errors.push(DCFErrorFactory.createValidationError('i0', input.i0, '初期費用は0以上の数値である必要があります'))
    }

    if (!this.isFiniteNumber(input.rentMonthly0) || input.rentMonthly0 <= 0) {
      errors.push(DCFErrorFactory.createValidationError('rentMonthly0', input.rentMonthly0, '月額家賃は正の数値である必要があります'))
    }

    if (!this.isFiniteNumber(input.monthlyOpex0) || input.monthlyOpex0 < 0) {
      errors.push(DCFErrorFactory.createValidationError('monthlyOpex0', input.monthlyOpex0, '月額運営費は0以上の数値である必要があります'))
    }

    if (!this.isPercentage(input.vacancy)) {
      errors.push(DCFErrorFactory.createValidationError('vacancy', input.vacancy, '空室率は0-1の範囲で入力してください'))
    }

    if (!this.isFiniteNumber(input.inflation)) {
      errors.push(DCFErrorFactory.createValidationError('inflation', input.inflation, 'インフレ率は有効な数値である必要があります'))
    }

    if (!this.isNonNegativeNumber(input.rentDecay)) {
      errors.push(DCFErrorFactory.createValidationError('rentDecay', input.rentDecay, '家賃逓減率は0以上である必要があります'))
    }

    if (!this.isNonNegativeNumber(input.priceDecay)) {
      errors.push(DCFErrorFactory.createValidationError('priceDecay', input.priceDecay, '価格逓減率は0以上である必要があります'))
    }

    if (!this.isNonNegativeNumber(input.taxAnnualFixed)) {
      errors.push(DCFErrorFactory.createValidationError('taxAnnualFixed', input.taxAnnualFixed, '固定資産税は0以上である必要があります'))
    }

    if (!this.isPercentage(input.exitCostRate)) {
      errors.push(DCFErrorFactory.createValidationError('exitCostRate', input.exitCostRate, '売却コスト率は0-1の範囲で入力してください'))
    }

    if (!this.isPositiveInteger(input.years) || input.years > DCF_CONFIG.VALIDATION.MAX_YEARS) {
      errors.push(DCFErrorFactory.createValidationError('years', input.years, `保有年数は1-${DCF_CONFIG.VALIDATION.MAX_YEARS}年の範囲で入力してください`))
    }

    if (!this.isNonNegativeNumber(input.discountAsset)) {
      errors.push(DCFErrorFactory.createValidationError('discountAsset', input.discountAsset, '資産割引率は0以上である必要があります'))
    }

    if (!this.isNonNegativeNumber(input.discountEquity)) {
      errors.push(DCFErrorFactory.createValidationError('discountEquity', input.discountEquity, 'エクイティ割引率は0以上である必要があります'))
    }

    if (!this.isNonNegativeNumber(input.loanAmount)) {
      errors.push(DCFErrorFactory.createValidationError('loanAmount', input.loanAmount, '借入額は0以上である必要があります'))
    }

    if (!this.isNonNegativeNumber(input.loanRate)) {
      errors.push(DCFErrorFactory.createValidationError('loanRate', input.loanRate, '借入金利は0以上である必要があります'))
    }

    if (input.loanAmount > 0 && (!this.isPositiveInteger(input.loanTerm) || input.loanTerm > DCF_CONFIG.VALIDATION.MAX_YEARS)) {
      errors.push(DCFErrorFactory.createValidationError('loanTerm', input.loanTerm, `返済期間は1-${DCF_CONFIG.VALIDATION.MAX_YEARS}年の範囲で入力してください`))
    }

    if (input.prepayPenaltyRate !== undefined && !this.isPercentage(input.prepayPenaltyRate)) {
      errors.push(DCFErrorFactory.createValidationError('prepayPenaltyRate', input.prepayPenaltyRate, '繰上償還ペナルティ率は0-1の範囲で入力してください'))
    }

    return {
      isValid: errors.length === 0,
      value: errors.length === 0 ? input : undefined,
      errors,
      warnings
    }
  }

  /**
   * ビジネスルールバリデーション
   */
  static validateBusinessRules(input: Input): ValidationResult<Input> {
    const errors: DCFError[] = []
    const warnings: DCFError[] = []

    // 借入額が物件価格の120%を超えている場合は警告として扱う
    if (input.loanAmount > input.p0 * 1.2) {
      warnings.push(DCFErrorFactory.createBusinessRuleWarning(
        'loanAmount',
        input.loanAmount,
        '借入額が物件価格の120%を超えています。高いレバレッジとなります',
        { propertyPrice: input.p0, loanAmount: input.loanAmount, maxLoanAmount: input.p0 * 1.2 }
      ))
    }

    // インフレ率の妥当性チェック
    const inflationBounds = DCF_CONFIG.VALIDATION.REASONABLE_BOUNDS.INFLATION
    if (input.inflation < inflationBounds.MIN || input.inflation > inflationBounds.MAX) {
      warnings.push(DCFErrorFactory.createWarning(
        DCFErrorType.UNREALISTIC_RESULT,
        `インフレ率(${(input.inflation * 100).toFixed(1)}%)が一般的な範囲(${(inflationBounds.MIN * 100).toFixed(1)}%-${(inflationBounds.MAX * 100).toFixed(1)}%)を外れています`,
        { field: 'inflation', value: input.inflation }
      ))
    }

    // 家賃逓減率の妥当性チェック
    const rentDecayBounds = DCF_CONFIG.VALIDATION.REASONABLE_BOUNDS.RENT_DECAY
    if (input.rentDecay > rentDecayBounds.MAX) {
      warnings.push(DCFErrorFactory.createWarning(
        DCFErrorType.UNREALISTIC_RESULT,
        `家賃逓減率(${(input.rentDecay * 100).toFixed(1)}%)が高すぎる可能性があります`,
        { field: 'rentDecay', value: input.rentDecay }
      ))
    }

    // 価格逓減率の妥当性チェック
    const priceDecayBounds = DCF_CONFIG.VALIDATION.REASONABLE_BOUNDS.PRICE_DECAY
    if (input.priceDecay > priceDecayBounds.MAX) {
      warnings.push(DCFErrorFactory.createWarning(
        DCFErrorType.UNREALISTIC_RESULT,
        `価格逓減率(${(input.priceDecay * 100).toFixed(1)}%)が高すぎる可能性があります`,
        { field: 'priceDecay', value: input.priceDecay }
      ))
    }

    // 空室率の妥当性チェック
    const vacancyBounds = DCF_CONFIG.VALIDATION.REASONABLE_BOUNDS.VACANCY
    if (input.vacancy > vacancyBounds.MAX) {
      warnings.push(DCFErrorFactory.createWarning(
        DCFErrorType.UNREALISTIC_RESULT,
        `空室率(${(input.vacancy * 100).toFixed(1)}%)が高すぎる可能性があります`,
        { field: 'vacancy', value: input.vacancy }
      ))
    }

    // 割引率の妥当性チェック
    const discountBounds = DCF_CONFIG.VALIDATION.REASONABLE_BOUNDS.DISCOUNT_RATE
    if (input.discountAsset < discountBounds.MIN || input.discountAsset > discountBounds.MAX) {
      warnings.push(DCFErrorFactory.createWarning(
        DCFErrorType.UNREALISTIC_RESULT,
        `資産割引率(${(input.discountAsset * 100).toFixed(1)}%)が一般的な範囲を外れています`,
        { field: 'discountAsset', value: input.discountAsset }
      ))
    }

    if (input.discountEquity < discountBounds.MIN || input.discountEquity > discountBounds.MAX) {
      warnings.push(DCFErrorFactory.createWarning(
        DCFErrorType.UNREALISTIC_RESULT,
        `エクイティ割引率(${(input.discountEquity * 100).toFixed(1)}%)が一般的な範囲を外れています`,
        { field: 'discountEquity', value: input.discountEquity }
      ))
    }

    // 借入関連のビジネスルールチェック
    if (input.loanAmount > 0) {
      const ltv = input.loanAmount / (input.p0 + input.i0)
      if (ltv > 0.9) {
        warnings.push(DCFErrorFactory.createWarning(
          DCFErrorType.BUSINESS_RULE_VIOLATION,
          `LTV(${(ltv * 100).toFixed(1)}%)が高すぎる可能性があります`,
          { field: 'loanAmount', value: ltv, metadata: { loanAmount: input.loanAmount, totalCost: input.p0 + input.i0 } }
        ))
      }

      if (input.loanRate > 0.2) {
        warnings.push(DCFErrorFactory.createWarning(
          DCFErrorType.UNREALISTIC_RESULT,
          `借入金利(${(input.loanRate * 100).toFixed(1)}%)が高すぎる可能性があります`,
          { field: 'loanRate', value: input.loanRate }
        ))
      }

      if (input.loanTerm < input.years) {
        warnings.push(DCFErrorFactory.createWarning(
          DCFErrorType.BUSINESS_RULE_VIOLATION,
          '返済期間が保有期間より短いため、売却時に残債があります',
          { field: 'loanTerm', value: input.loanTerm, metadata: { years: input.years } }
        ))
      }
    }

    // エクイティ割引率がアセット割引率より低い場合の警告
    if (input.discountEquity < input.discountAsset) {
      warnings.push(DCFErrorFactory.createWarning(
        DCFErrorType.BUSINESS_RULE_VIOLATION,
        'エクイティ割引率がアセット割引率より低く設定されています。通常はレバレッジによりリスクが高まります',
        { field: 'discountEquity', value: input.discountEquity, metadata: { discountAsset: input.discountAsset } }
      ))
    }

    return {
      isValid: errors.length === 0,
      value: errors.length === 0 ? input : undefined,
      errors,
      warnings
    }
  }

  /**
   * 計算結果のバリデーション
   */
  static validateResults(result: Partial<Result>): ValidationResult<Partial<Result>> {
    const errors: DCFError[] = []
    const warnings: DCFError[] = []

    // IRR値の妥当性チェック
    if (result.irrAsset !== undefined) {
      if (!this.isFiniteNumber(result.irrAsset)) {
        errors.push(DCFErrorFactory.createCalculationError('irrAsset', { value: result.irrAsset }))
      } else if (result.irrAsset < -0.95 || result.irrAsset > 5.0) {
        warnings.push(DCFErrorFactory.createWarning(
          DCFErrorType.UNREALISTIC_RESULT,
          `アセットIRR(${(result.irrAsset * 100).toFixed(1)}%)が異常な値です`,
          { field: 'irrAsset', value: result.irrAsset }
        ))
      }
    }

    if (result.irrEquity !== undefined) {
      if (!this.isFiniteNumber(result.irrEquity)) {
        errors.push(DCFErrorFactory.createCalculationError('irrEquity', { value: result.irrEquity }))
      } else if (result.irrEquity < -0.95 || result.irrEquity > 5.0) {
        warnings.push(DCFErrorFactory.createWarning(
          DCFErrorType.UNREALISTIC_RESULT,
          `エクイティIRR(${(result.irrEquity * 100).toFixed(1)}%)が異常な値です`,
          { field: 'irrEquity', value: result.irrEquity }
        ))
      }
    }

    // NPV値の妥当性チェック
    if (result.npvAsset !== undefined && !this.isFiniteNumber(result.npvAsset)) {
      errors.push(DCFErrorFactory.createCalculationError('npvAsset', { value: result.npvAsset }))
    }

    if (result.npvEquity !== undefined && !this.isFiniteNumber(result.npvEquity)) {
      errors.push(DCFErrorFactory.createCalculationError('npvEquity', { value: result.npvEquity }))
    }

    // 暗黙Cap率の妥当性チェック
    if (result.implicitCap !== undefined) {
      if (!this.isFiniteNumber(result.implicitCap)) {
        errors.push(DCFErrorFactory.createCalculationError('implicitCap', { value: result.implicitCap }))
      } else if (result.implicitCap < 0.01 || result.implicitCap > 0.5) {
        warnings.push(DCFErrorFactory.createWarning(
          DCFErrorType.MARKET_INCONSISTENCY,
          `暗黙のCap率(${(result.implicitCap * 100).toFixed(1)}%)が市場の一般的な範囲(1%-50%)を外れています`,
          { field: 'implicitCap', value: result.implicitCap }
        ))
      }
    }

    return {
      isValid: errors.length === 0,
      value: errors.length === 0 ? result : undefined,
      errors,
      warnings
    }
  }

  /**
   * 統合バリデーション - 入力、ビジネスルール、結果を一括で検証
   */
  static validateComplete(input: Input, result?: Partial<Result>): ValidationResult<{ input: Input; result?: Partial<Result> }> {
    const inputValidation = this.validateInput(input)
    const businessValidation = inputValidation.isValid ? this.validateBusinessRules(input) : { isValid: true, errors: [], warnings: [] }
    const resultValidation = result ? this.validateResults(result) : { isValid: true, errors: [], warnings: [] }

    const allErrors = [...inputValidation.errors, ...businessValidation.errors, ...resultValidation.errors]
    const allWarnings = [...inputValidation.warnings, ...businessValidation.warnings, ...resultValidation.warnings]

    return {
      isValid: allErrors.length === 0,
      value: allErrors.length === 0 ? { input, result } : undefined,
      errors: allErrors,
      warnings: allWarnings
    }
  }

  // ヘルパーメソッド
  private static isFiniteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value)
  }

  private static isPercentage(value: unknown): boolean {
    return this.isFiniteNumber(value) && value >= 0 && value <= 1
  }

  private static isNonNegativeNumber(value: unknown): boolean {
    return this.isFiniteNumber(value) && value >= 0
  }

  private static isPositiveInteger(value: unknown): boolean {
    return this.isFiniteNumber(value) && Number.isInteger(value) && value >= 1
  }
}
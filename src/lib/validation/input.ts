import { DCFErrorFactory } from '@/lib/errors'
import type { Input } from '@/types/dcf'
import { VALIDATION_CONFIG, ValidationUtils } from './config'
import type { ValidationResult } from './types'

/**
 * DCF入力値バリデーター
 */
export class InputValidator {
  /**
   * 入力値の型・境界バリデーション
   */
  static validate(input: Input): ValidationResult<Input> {
    const errors = [
      ...InputValidator.validateBasicFields(input),
      ...InputValidator.validatePercentageFields(input),
      ...InputValidator.validateRangeFields(input),
      ...InputValidator.validateLoanFields(input),
    ]

    return {
      isValid: errors.length === 0,
      value: errors.length === 0 ? input : undefined,
      errors,
      warnings: [],
    }
  }

  private static validateBasicFields(input: Input) {
    const errors = []

    if (!ValidationUtils.isPositiveNumber(input.p0)) {
      errors.push(
        DCFErrorFactory.createValidationError(
          'p0',
          input.p0,
          '物件価格は正の数値である必要があります',
        ),
      )
    }

    if (!ValidationUtils.isNonNegativeNumber(input.i0)) {
      errors.push(
        DCFErrorFactory.createValidationError(
          'i0',
          input.i0,
          '初期費用は0以上の数値である必要があります',
        ),
      )
    }

    if (!ValidationUtils.isPositiveNumber(input.rentMonthly0)) {
      errors.push(
        DCFErrorFactory.createValidationError(
          'rentMonthly0',
          input.rentMonthly0,
          '月額家賃は正の数値である必要があります',
        ),
      )
    }

    if (!ValidationUtils.isNonNegativeNumber(input.monthlyOpex0)) {
      errors.push(
        DCFErrorFactory.createValidationError(
          'monthlyOpex0',
          input.monthlyOpex0,
          '月額運営費は0以上の数値である必要があります',
        ),
      )
    }

    if (!ValidationUtils.isFiniteNumber(input.inflation)) {
      errors.push(
        DCFErrorFactory.createValidationError(
          'inflation',
          input.inflation,
          'インフレ率は有効な数値である必要があります',
        ),
      )
    }

    if (!ValidationUtils.isNonNegativeNumber(input.taxAnnualFixed)) {
      errors.push(
        DCFErrorFactory.createValidationError(
          'taxAnnualFixed',
          input.taxAnnualFixed,
          '固定資産税は0以上である必要があります',
        ),
      )
    }

    return errors
  }

  private static validatePercentageFields(input: Input) {
    const errors = []

    if (!ValidationUtils.isPercentage(input.vacancy)) {
      errors.push(
        DCFErrorFactory.createValidationError(
          'vacancy',
          input.vacancy,
          '空室率は0-1の範囲で入力してください',
        ),
      )
    }

    if (!ValidationUtils.isPercentage(input.exitCostRate)) {
      errors.push(
        DCFErrorFactory.createValidationError(
          'exitCostRate',
          input.exitCostRate,
          '売却コスト率は0-1の範囲で入力してください',
        ),
      )
    }

    if (
      input.prepayPenaltyRate !== undefined &&
      !ValidationUtils.isPercentage(input.prepayPenaltyRate)
    ) {
      errors.push(
        DCFErrorFactory.createValidationError(
          'prepayPenaltyRate',
          input.prepayPenaltyRate,
          '繰上償還ペナルティ率は0-1の範囲で入力してください',
        ),
      )
    }

    return errors
  }

  private static validateRangeFields(input: Input) {
    const errors = []

    if (!ValidationUtils.isNonNegativeNumber(input.rentDecay)) {
      errors.push(
        DCFErrorFactory.createValidationError(
          'rentDecay',
          input.rentDecay,
          '家賃逓減率は0以上である必要があります',
        ),
      )
    }

    if (!ValidationUtils.isNonNegativeNumber(input.priceDecay)) {
      errors.push(
        DCFErrorFactory.createValidationError(
          'priceDecay',
          input.priceDecay,
          '価格逓減率は0以上である必要があります',
        ),
      )
    }

    if (
      !ValidationUtils.isInRange(
        input.years,
        VALIDATION_CONFIG.MIN_YEARS,
        VALIDATION_CONFIG.MAX_YEARS,
      ) ||
      !Number.isInteger(input.years)
    ) {
      errors.push(
        DCFErrorFactory.createValidationError(
          'years',
          input.years,
          `保有年数は${VALIDATION_CONFIG.MIN_YEARS}-${VALIDATION_CONFIG.MAX_YEARS}年の範囲で入力してください`,
        ),
      )
    }

    if (!ValidationUtils.isNonNegativeNumber(input.discountAsset)) {
      errors.push(
        DCFErrorFactory.createValidationError(
          'discountAsset',
          input.discountAsset,
          '資産割引率は0以上である必要があります',
        ),
      )
    }

    if (!ValidationUtils.isNonNegativeNumber(input.discountEquity)) {
      errors.push(
        DCFErrorFactory.createValidationError(
          'discountEquity',
          input.discountEquity,
          'エクイティ割引率は0以上である必要があります',
        ),
      )
    }

    return errors
  }

  private static validateLoanFields(input: Input) {
    const errors = []

    if (!ValidationUtils.isNonNegativeNumber(input.loanAmount)) {
      errors.push(
        DCFErrorFactory.createValidationError(
          'loanAmount',
          input.loanAmount,
          '借入額は0以上である必要があります',
        ),
      )
    }

    if (!ValidationUtils.isNonNegativeNumber(input.loanRate)) {
      errors.push(
        DCFErrorFactory.createValidationError(
          'loanRate',
          input.loanRate,
          '借入金利は0以上である必要があります',
        ),
      )
    }

    if (input.loanAmount > 0) {
      if (
        !ValidationUtils.isInRange(
          input.loanTerm,
          VALIDATION_CONFIG.MIN_YEARS,
          VALIDATION_CONFIG.MAX_YEARS,
        ) ||
        !Number.isInteger(input.loanTerm)
      ) {
        errors.push(
          DCFErrorFactory.createValidationError(
            'loanTerm',
            input.loanTerm,
            `返済期間は${VALIDATION_CONFIG.MIN_YEARS}-${VALIDATION_CONFIG.MAX_YEARS}年の範囲で入力してください`,
          ),
        )
      }
    }

    return errors
  }
}

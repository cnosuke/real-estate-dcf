import { DCFErrorFactory } from '@/lib/errors'
import type { Input } from '@/types/dcf'
import { VALIDATION_CONFIG } from './config'
import type { ValidationResult } from './types'

/**
 * ビジネスルールバリデーター
 */
export class BusinessRuleValidator {
  /**
   * ビジネスルールバリデーション
   */
  static validate(input: Input): ValidationResult<Input> {
    const warnings = [
      ...BusinessRuleValidator.validateLoanRules(input),
      ...BusinessRuleValidator.validateMarketRules(input),
      ...BusinessRuleValidator.validateDiscountRateRules(input),
      ...BusinessRuleValidator.validateParameterRanges(input),
    ]

    return {
      isValid: true, // ビジネスルール違反は警告扱い
      value: input,
      errors: [],
      warnings,
    }
  }

  private static validateLoanRules(input: Input) {
    const warnings = []

    if (input.loanAmount > 0 && input.loanTerm < input.years) {
      warnings.push(
        DCFErrorFactory.createBusinessRuleWarning(
          'loanTerm',
          input.loanTerm,
          '返済期間が保有期間より短く、売却時に残債があります',
          { loanTerm: input.loanTerm, years: input.years },
        ),
      )
    }

    const ltv = input.loanAmount / (input.p0 + input.i0)
    if (ltv > 1.2) {
      warnings.push(
        DCFErrorFactory.createBusinessRuleWarning(
          'loanAmount',
          ltv,
          'LTV(借入比率)が120%を超えています。高いレバレッジとなります',
          { ltv, loanAmount: input.loanAmount, totalCost: input.p0 + input.i0 },
        ),
      )
    }

    if (input.loanRate > 0.1) {
      warnings.push(
        DCFErrorFactory.createBusinessRuleWarning(
          'loanRate',
          input.loanRate,
          '借入金利が10%を超えています。非常に高い金利です',
          { value: input.loanRate },
        ),
      )
    }

    return warnings
  }

  private static validateMarketRules(input: Input) {
    const warnings = []

    // エクイティ割引率がアセット割引率より低い場合
    if (input.discountEquity < input.discountAsset) {
      warnings.push(
        DCFErrorFactory.createBusinessRuleWarning(
          'discountEquity',
          input.discountEquity,
          'エクイティ割引率がアセット割引率より低くなっています。通常はレバレッジによりリスクが高まります',
          {
            discountAsset: input.discountAsset,
            discountEquity: input.discountEquity,
          },
        ),
      )
    }

    return warnings
  }

  private static validateDiscountRateRules(input: Input) {
    const warnings = []
    const bounds = VALIDATION_CONFIG.REASONABLE_BOUNDS.DISCOUNT_RATE

    if (input.discountAsset < bounds.MIN || input.discountAsset > bounds.MAX) {
      warnings.push(
        DCFErrorFactory.createUnrealisticResultWarning(
          'discountAsset',
          input.discountAsset,
          `資産割引率(${(input.discountAsset * 100).toFixed(1)}%)が一般的な範囲(${(bounds.MIN * 100).toFixed(1)}%-${(bounds.MAX * 100).toFixed(1)}%)を外れています`,
          {
            value: input.discountAsset,
            minBound: bounds.MIN,
            maxBound: bounds.MAX,
          },
        ),
      )
    }

    if (
      input.discountEquity < bounds.MIN ||
      input.discountEquity > bounds.MAX
    ) {
      warnings.push(
        DCFErrorFactory.createUnrealisticResultWarning(
          'discountEquity',
          input.discountEquity,
          `エクイティ割引率(${(input.discountEquity * 100).toFixed(1)}%)が一般的な範囲(${(bounds.MIN * 100).toFixed(1)}%-${(bounds.MAX * 100).toFixed(1)}%)を外れています`,
          {
            value: input.discountEquity,
            minBound: bounds.MIN,
            maxBound: bounds.MAX,
          },
        ),
      )
    }

    return warnings
  }

  private static validateParameterRanges(input: Input) {
    const warnings = []

    // インフレ率
    const inflationBounds = VALIDATION_CONFIG.REASONABLE_BOUNDS.INFLATION
    if (
      input.inflation < inflationBounds.MIN ||
      input.inflation > inflationBounds.MAX
    ) {
      warnings.push(
        DCFErrorFactory.createUnrealisticResultWarning(
          'inflation',
          input.inflation,
          `インフレ率(${(input.inflation * 100).toFixed(1)}%)が一般的な範囲(${(inflationBounds.MIN * 100).toFixed(1)}%-${(inflationBounds.MAX * 100).toFixed(1)}%)を外れています`,
          {
            value: input.inflation,
            minBound: inflationBounds.MIN,
            maxBound: inflationBounds.MAX,
          },
        ),
      )
    }

    // 家賃逓減率
    const rentDecayBounds = VALIDATION_CONFIG.REASONABLE_BOUNDS.RENT_DECAY
    if (input.rentDecay > rentDecayBounds.MAX) {
      warnings.push(
        DCFErrorFactory.createUnrealisticResultWarning(
          'rentDecay',
          input.rentDecay,
          `家賃逓減率(${(input.rentDecay * 100).toFixed(1)}%)が高すぎる可能性があります`,
          { value: input.rentDecay, maxBound: rentDecayBounds.MAX },
        ),
      )
    }

    // 価格逓減率
    const priceDecayBounds = VALIDATION_CONFIG.REASONABLE_BOUNDS.PRICE_DECAY
    if (input.priceDecay > priceDecayBounds.MAX) {
      warnings.push(
        DCFErrorFactory.createUnrealisticResultWarning(
          'priceDecay',
          input.priceDecay,
          `価格逓減率(${(input.priceDecay * 100).toFixed(1)}%)が高すぎる可能性があります`,
          { value: input.priceDecay, maxBound: priceDecayBounds.MAX },
        ),
      )
    }

    // 空室率
    const vacancyBounds = VALIDATION_CONFIG.REASONABLE_BOUNDS.VACANCY
    if (input.vacancy > vacancyBounds.MAX) {
      warnings.push(
        DCFErrorFactory.createUnrealisticResultWarning(
          'vacancy',
          input.vacancy,
          `空室率(${(input.vacancy * 100).toFixed(1)}%)が高すぎる可能性があります`,
          { value: input.vacancy, maxBound: vacancyBounds.MAX },
        ),
      )
    }

    return warnings
  }
}

// 個別の関数エクスポート（静的クラス回避のため）
export const validateBusinessRulesData = BusinessRuleValidator.validate

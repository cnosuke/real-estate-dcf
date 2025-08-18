import { type DCFError, DCFErrorFactory } from '@/lib/errors'
import type { Result } from '@/types/dcf'
import { VALIDATION_CONFIG, ValidationUtils } from './config'
import type { ValidationResult } from './types'

/**
 * 計算結果バリデーター
 */
export class ResultValidator {
  /**
   * 計算結果のバリデーション
   */
  static validate(result: Partial<Result>): ValidationResult<Partial<Result>> {
    const errors: DCFError[] = []
    const warnings = [
      ...ResultValidator.validateIRRResults(result),
      ...ResultValidator.validateNPVResults(result),
      ...ResultValidator.validateImplicitCapResults(result),
    ]

    return {
      isValid: errors.length === 0,
      value: errors.length === 0 ? result : undefined,
      errors,
      warnings,
    }
  }

  private static validateIRRResults(result: Partial<Result>) {
    const warnings = []
    const bounds = VALIDATION_CONFIG.REASONABLE_BOUNDS

    // 資産IRR
    if (result.irrAsset !== undefined) {
      if (!ValidationUtils.isFiniteNumber(result.irrAsset)) {
        warnings.push(
          DCFErrorFactory.createNumericalInstabilityError(
            'irr_asset_calculation',
            result.irrAsset,
            '資産IRRの計算が不安定です',
          ),
        )
      } else if (Math.abs(result.irrAsset) > bounds.IRR_ABSOLUTE.MAX) {
        warnings.push(
          DCFErrorFactory.createUnrealisticResultWarning(
            'irrAsset',
            result.irrAsset,
            `資産IRR(${(result.irrAsset * 100).toFixed(1)}%)が異常な値です`,
            { value: result.irrAsset },
          ),
        )
      } else if (Math.abs(result.irrAsset) > bounds.IRR_RELATIVE.MAX) {
        warnings.push(
          DCFErrorFactory.createUnrealisticResultWarning(
            'irrAsset',
            result.irrAsset,
            `資産IRR(${(result.irrAsset * 100).toFixed(1)}%)が100%を超えています。計算に問題がある可能性があります`,
            { value: result.irrAsset },
          ),
        )
      }
    }

    // エクイティIRR
    if (result.irrEquity !== undefined) {
      if (!ValidationUtils.isFiniteNumber(result.irrEquity)) {
        warnings.push(
          DCFErrorFactory.createNumericalInstabilityError(
            'irr_equity_calculation',
            result.irrEquity,
            'エクイティIRRの計算が不安定です',
          ),
        )
      } else if (Math.abs(result.irrEquity) > bounds.IRR_ABSOLUTE.MAX) {
        warnings.push(
          DCFErrorFactory.createUnrealisticResultWarning(
            'irrEquity',
            result.irrEquity,
            `エクイティIRR(${(result.irrEquity * 100).toFixed(1)}%)が異常な値です`,
            { value: result.irrEquity },
          ),
        )
      } else if (Math.abs(result.irrEquity) > bounds.IRR_RELATIVE.MAX) {
        warnings.push(
          DCFErrorFactory.createUnrealisticResultWarning(
            'irrEquity',
            result.irrEquity,
            `エクイティIRR(${(result.irrEquity * 100).toFixed(1)}%)が100%を超えています。計算に問題がある可能性があります`,
            { value: result.irrEquity },
          ),
        )
      }
    }

    return warnings
  }

  private static validateNPVResults(result: Partial<Result>) {
    const warnings = []

    if (
      result.npvAsset !== undefined &&
      !ValidationUtils.isFiniteNumber(result.npvAsset)
    ) {
      warnings.push(
        DCFErrorFactory.createNumericalInstabilityError(
          'npv_asset_calculation',
          result.npvAsset,
          '資産NPVの計算が不安定です',
        ),
      )
    }

    if (
      result.npvEquity !== undefined &&
      !ValidationUtils.isFiniteNumber(result.npvEquity)
    ) {
      warnings.push(
        DCFErrorFactory.createNumericalInstabilityError(
          'npv_equity_calculation',
          result.npvEquity,
          'エクイティNPVの計算が不安定です',
        ),
      )
    }

    return warnings
  }

  private static validateImplicitCapResults(result: Partial<Result>) {
    const warnings = []
    const bounds = VALIDATION_CONFIG.REASONABLE_BOUNDS.IMPLICIT_CAP

    if (result.implicitCap !== undefined) {
      if (!ValidationUtils.isFiniteNumber(result.implicitCap)) {
        warnings.push(
          DCFErrorFactory.createNumericalInstabilityError(
            'implicit_cap_calculation',
            result.implicitCap,
            '暗黙Cap率の計算が不安定です',
          ),
        )
      } else if (
        result.implicitCap < bounds.MIN ||
        result.implicitCap > bounds.MAX
      ) {
        warnings.push(
          DCFErrorFactory.createMarketInconsistencyWarning(
            'implicitCap',
            result.implicitCap,
            `暗黙Cap率(${(result.implicitCap * 100).toFixed(2)}%)が市場の一般的範囲(${(bounds.MIN * 100).toFixed(1)}%-${(bounds.MAX * 100).toFixed(1)}%)を外れています`,
            {
              value: result.implicitCap,
              minBound: bounds.MIN,
              maxBound: bounds.MAX,
            },
          ),
        )
      }
    }

    return warnings
  }
}

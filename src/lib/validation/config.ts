import type { ValidationConfig } from './types'

/**
 * バリデーション設定
 */
export const VALIDATION_CONFIG: ValidationConfig = {
  MAX_YEARS: 50,
  MIN_YEARS: 1,
  MAX_RATE: 1.0,
  MIN_RATE: 0.0,
  MAX_PERCENTAGE: 1.0,
  MIN_PERCENTAGE: 0.0,
  REASONABLE_BOUNDS: {
    INFLATION: { MIN: -0.1, MAX: 0.2 },
    RENT_DECAY: { MIN: 0, MAX: 0.1 },
    PRICE_DECAY: { MIN: 0, MAX: 0.05 },
    VACANCY: { MIN: 0, MAX: 0.5 },
    DISCOUNT_RATE: { MIN: 0.01, MAX: 0.3 },
    IRR_ABSOLUTE: { MIN: -10, MAX: 10 },
    IRR_RELATIVE: { MIN: -1, MAX: 1 },
    IMPLICIT_CAP: { MIN: 0.01, MAX: 0.2 },
  },
}

/**
 * 数値のヘルパー関数
 */
export class ValidationUtils {
  static isFiniteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value)
  }

  static isPercentage(value: unknown): boolean {
    return ValidationUtils.isFiniteNumber(value) && value >= 0 && value <= 1
  }

  static isNonNegativeNumber(value: unknown): boolean {
    return ValidationUtils.isFiniteNumber(value) && value >= 0
  }

  static isPositiveNumber(value: unknown): boolean {
    return ValidationUtils.isFiniteNumber(value) && value > 0
  }

  static isPositiveInteger(value: unknown): boolean {
    return (
      ValidationUtils.isFiniteNumber(value) &&
      Number.isInteger(value) &&
      value >= 1
    )
  }

  static isInRange(value: unknown, min: number, max: number): boolean {
    return ValidationUtils.isFiniteNumber(value) && value >= min && value <= max
  }
}

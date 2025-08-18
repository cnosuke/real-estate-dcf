import type { DCFError } from '@/lib/errors'
import type { Input, Result } from '@/types/dcf'

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
 * バリデーションコンテキスト
 */
export interface ValidationContext {
  field: string
  value: unknown
  input?: Input
  result?: Partial<Result>
}

/**
 * バリデーションルール
 */
export interface ValidationRule<T = unknown> {
  name: string
  validator: (value: T, context?: ValidationContext) => ValidationResult<T>
  required?: boolean
}

/**
 * バリデーションスキーマ
 */
export interface ValidationSchema {
  [fieldName: string]: ValidationRule[]
}

/**
 * 範囲設定
 */
export interface RangeBounds {
  MIN: number
  MAX: number
}

/**
 * バリデーション設定
 */
export interface ValidationConfig {
  MAX_YEARS: number
  MIN_YEARS: number
  MAX_RATE: number
  MIN_RATE: number
  MAX_PERCENTAGE: number
  MIN_PERCENTAGE: number
  REASONABLE_BOUNDS: {
    INFLATION: RangeBounds
    RENT_DECAY: RangeBounds
    PRICE_DECAY: RangeBounds
    VACANCY: RangeBounds
    DISCOUNT_RATE: RangeBounds
    IRR_ABSOLUTE: RangeBounds
    IRR_RELATIVE: RangeBounds
    IMPLICIT_CAP: RangeBounds
  }
}

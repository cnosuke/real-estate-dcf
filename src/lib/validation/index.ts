export * from './business'
export * from './config'
export * from './input'
export * from './result'
export * from './types'

// 統合バリデーター
import type { Input, Result } from '@/types/dcf'
import { BusinessRuleValidator } from './business'
import { InputValidator } from './input'
import { ResultValidator } from './result'
import type { ValidationResult } from './types'

/**
 * 統合DCFバリデーター
 */
export class DCFValidator {
  /**
   * 入力値の型・境界バリデーション
   */
  static validateInput(input: Input): ValidationResult<Input> {
    return InputValidator.validate(input)
  }

  /**
   * ビジネスルールバリデーション
   */
  static validateBusinessRules(input: Input): ValidationResult<Input> {
    return BusinessRuleValidator.validate(input)
  }

  /**
   * 計算結果のバリデーション
   */
  static validateResults(
    result: Partial<Result>,
  ): ValidationResult<Partial<Result>> {
    return ResultValidator.validate(result)
  }

  /**
   * 統合バリデーション - 入力、ビジネスルール、結果を一括で検証
   */
  static validateComplete(
    input: Input,
    result?: Partial<Result>,
  ): ValidationResult<{ input: Input; result?: Partial<Result> }> {
    const inputValidation = InputValidator.validate(input)
    const businessValidation = inputValidation.isValid
      ? BusinessRuleValidator.validate(input)
      : { isValid: true, errors: [], warnings: [] }
    const resultValidation = result
      ? ResultValidator.validate(result)
      : { isValid: true, errors: [], warnings: [] }

    const allErrors = [
      ...inputValidation.errors,
      ...businessValidation.errors,
      ...resultValidation.errors,
    ]
    const allWarnings = [
      ...inputValidation.warnings,
      ...businessValidation.warnings,
      ...resultValidation.warnings,
    ]

    return {
      isValid: allErrors.length === 0,
      value: allErrors.length === 0 ? { input, result } : undefined,
      errors: allErrors,
      warnings: allWarnings,
    }
  }
}

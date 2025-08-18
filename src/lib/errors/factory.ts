import { getErrorMessage } from './messages'
import {
  DCFError,
  DCFErrorType,
  type ErrorContext,
  ErrorSeverity,
} from './types'

/**
 * DCFエラーファクトリークラス - エラー生成の責務を集約
 */
export class DCFErrorFactory {
  /**
   * 入力値バリデーションエラーを作成
   */
  static createValidationError(
    field: string,
    value: unknown,
    message?: string,
  ): DCFError {
    return new DCFError(
      DCFErrorType.INVALID_INPUT,
      ErrorSeverity.ERROR,
      message || getErrorMessage(DCFErrorType.INVALID_INPUT),
      { field, value, operation: 'validation' },
    )
  }

  /**
   * 計算エラーを作成
   */
  static createCalculationError(
    operation: string,
    details?: Record<string, unknown>,
  ): DCFError {
    return new DCFError(
      DCFErrorType.NUMERICAL_INSTABILITY,
      ErrorSeverity.ERROR,
      getErrorMessage(DCFErrorType.NUMERICAL_INSTABILITY, 'CALCULATION_FAILED'),
      { operation, metadata: details },
    )
  }

  /**
   * IRR計算エラーを作成
   */
  static createIRRError(
    method: string,
    cashFlows: number[],
    details?: Record<string, unknown>,
  ): DCFError {
    return new DCFError(
      DCFErrorType.IRR_CALCULATION_FAILED,
      ErrorSeverity.ERROR,
      getErrorMessage(
        DCFErrorType.IRR_CALCULATION_FAILED,
        'IRR_CONVERGENCE_FAILED',
      ),
      {
        operation: 'irr_calculation',
        metadata: {
          method,
          cashFlowLength: cashFlows.length,
          ...details,
        },
      },
    )
  }

  /**
   * 警告レベルのエラーを作成
   */
  static createWarning(
    type: DCFErrorType,
    message: string,
    context?: ErrorContext,
  ): DCFError {
    return new DCFError(type, ErrorSeverity.WARNING, message, context)
  }

  /**
   * ビジネスルールエラーを作成
   */
  static createBusinessRuleError(
    field: string,
    value: unknown,
    message: string,
    metadata?: Record<string, unknown>,
  ): DCFError {
    return new DCFError(
      DCFErrorType.BUSINESS_RULE_VIOLATION,
      ErrorSeverity.ERROR,
      message,
      { field, value, operation: 'business_rule_validation', metadata },
    )
  }

  /**
   * ビジネスルール警告を作成
   */
  static createBusinessRuleWarning(
    field: string,
    value: unknown,
    message: string,
    metadata?: Record<string, unknown>,
  ): DCFError {
    return new DCFError(
      DCFErrorType.BUSINESS_RULE_VIOLATION,
      ErrorSeverity.WARNING,
      message,
      { field, value, operation: 'business_rule_validation', metadata },
    )
  }

  /**
   * 非現実的結果の警告を作成
   */
  static createUnrealisticResultWarning(
    field: string,
    value: unknown,
    message: string,
    metadata?: Record<string, unknown>,
  ): DCFError {
    return new DCFError(
      DCFErrorType.UNREALISTIC_RESULT,
      ErrorSeverity.WARNING,
      message,
      { field, value, operation: 'result_validation', metadata },
    )
  }

  /**
   * 市場整合性の警告を作成
   */
  static createMarketInconsistencyWarning(
    field: string,
    value: unknown,
    message: string,
    metadata?: Record<string, unknown>,
  ): DCFError {
    return new DCFError(
      DCFErrorType.MARKET_INCONSISTENCY,
      ErrorSeverity.WARNING,
      message,
      { field, value, operation: 'market_validation', metadata },
    )
  }

  /**
   * 数値不安定性エラーを作成
   */
  static createNumericalInstabilityError(
    operation: string,
    value: unknown,
    message?: string,
  ): DCFError {
    return new DCFError(
      DCFErrorType.NUMERICAL_INSTABILITY,
      ErrorSeverity.ERROR,
      message || getErrorMessage(DCFErrorType.NUMERICAL_INSTABILITY),
      { operation, value },
    )
  }

  /**
   * クリティカルエラーを作成
   */
  static createCriticalError(
    type: DCFErrorType,
    message: string,
    context?: ErrorContext,
  ): DCFError {
    return new DCFError(type, ErrorSeverity.CRITICAL, message, context)
  }
}

// 個別の関数エクスポート（静的クラス回避のため）
export const createValidationError = DCFErrorFactory.createValidationError
export const createCalculationError = DCFErrorFactory.createCalculationError
export const createIRRError = DCFErrorFactory.createIRRError
export const createWarning = DCFErrorFactory.createWarning
export const createBusinessRuleError = DCFErrorFactory.createBusinessRuleError
export const createBusinessRuleWarning =
  DCFErrorFactory.createBusinessRuleWarning
export const createUnrealisticResultWarning =
  DCFErrorFactory.createUnrealisticResultWarning
export const createMarketInconsistencyWarning =
  DCFErrorFactory.createMarketInconsistencyWarning
export const createNumericalInstabilityError =
  DCFErrorFactory.createNumericalInstabilityError
export const createCriticalError = DCFErrorFactory.createCriticalError

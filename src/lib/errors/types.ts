/**
 * DCFエラータイプの分類
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
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * エラーコンテキスト情報
 */
export interface ErrorContext {
  field?: string
  value?: unknown
  operation?: string
  metadata?: Record<string, unknown>
}

/**
 * DCF計算専用エラークラス
 */
export class DCFError extends Error {
  constructor(
    public readonly type: DCFErrorType,
    public readonly severity: ErrorSeverity,
    message: string,
    public readonly context?: ErrorContext,
  ) {
    super(message)
    this.name = 'DCFError'
  }

  /**
   * ユーザー向けメッセージの取得
   */
  getUserMessage(): string {
    if (this.context?.field) {
      return `${this.context.field}: ${this.message}`
    }
    return this.message
  }

  /**
   * 開発者向け詳細情報の取得
   */
  getDebugInfo(): Record<string, unknown> {
    return {
      type: this.type,
      severity: this.severity,
      message: this.message,
      field: this.context?.field,
      value: this.context?.value,
      operation: this.context?.operation,
      metadata: this.context?.metadata,
      stack: this.stack,
    }
  }

  /**
   * エラーが警告レベルかどうか
   */
  isWarning(): boolean {
    return this.severity === ErrorSeverity.WARNING
  }

  /**
   * エラーがクリティカルレベルかどうか
   */
  isCritical(): boolean {
    return this.severity === ErrorSeverity.CRITICAL
  }

  // 下位互換性のためのプロパティ（deprecatedにする）
  /** @deprecated Use context?.field instead */
  get field(): string | undefined {
    return this.context?.field
  }

  /** @deprecated Use context?.value instead */
  get value(): unknown {
    return this.context?.value
  }

  /** @deprecated Use context?.metadata instead */
  get debugInfo(): Record<string, unknown> | undefined {
    return this.context?.metadata
  }
}

/**
 * エラーログエントリ
 */
export interface ErrorLogEntry {
  timestamp: string
  context: string
  error: Record<string, unknown>
}

/**
 * エラー型のタイプガード（内部使用のみ）
 */
function _isDCFError(error: unknown): error is DCFError {
  return error instanceof DCFError
}

/**
 * エラーの重要度による並び替え用の優先度（内部使用のみ）
 */
const _ERROR_SEVERITY_PRIORITY: Record<ErrorSeverity, number> = {
  [ErrorSeverity.CRITICAL]: 3,
  [ErrorSeverity.ERROR]: 2,
  [ErrorSeverity.WARNING]: 1,
}

import { type DCFError, type ErrorLogEntry, ErrorSeverity } from './types'

/**
 * DCFエラーロガークラス - ログ出力の責務を分離
 */
export class DCFErrorLogger {
  private static logLevel: ErrorSeverity = ErrorSeverity.WARNING
  private static logs: ErrorLogEntry[] = []

  /**
   * ログレベルを設定
   */
  static setLogLevel(level: ErrorSeverity): void {
    DCFErrorLogger.logLevel = level
  }

  /**
   * エラーをログに記録
   */
  static log(error: DCFError, context = 'unknown'): void {
    if (!DCFErrorLogger.shouldLog(error.severity)) return

    const logEntry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      context,
      error: error.getDebugInfo(),
    }

    DCFErrorLogger.logs.push(logEntry)

    // コンソール出力
    switch (error.severity) {
      case ErrorSeverity.WARNING:
        console.warn('[DCF Warning]', logEntry)
        break
      case ErrorSeverity.ERROR:
        console.error('[DCF Error]', logEntry)
        break
      case ErrorSeverity.CRITICAL:
        console.error('[DCF CRITICAL]', logEntry)
        break
    }
  }

  /**
   * ログを取得
   */
  static getLogs(): ErrorLogEntry[] {
    return [...DCFErrorLogger.logs]
  }

  /**
   * ログをクリア
   */
  static clearLogs(): void {
    DCFErrorLogger.logs = []
  }

  /**
   * ログレベルに基づいてログ出力すべきかを判定
   */
  private static shouldLog(severity: ErrorSeverity): boolean {
    const levels = [
      ErrorSeverity.WARNING,
      ErrorSeverity.ERROR,
      ErrorSeverity.CRITICAL,
    ]
    const currentIndex = levels.indexOf(DCFErrorLogger.logLevel)
    const errorIndex = levels.indexOf(severity)
    return errorIndex >= currentIndex
  }
}

// 個別の関数エクスポート（静的クラス回避のため）
export const log = DCFErrorLogger.log
export const setLogLevel = DCFErrorLogger.setLogLevel
// shouldLogはprivateなので、代替関数を提供
export function shouldLogError(severity: ErrorSeverity): boolean {
  const levels = [
    ErrorSeverity.WARNING,
    ErrorSeverity.ERROR,
    ErrorSeverity.CRITICAL,
  ]
  const currentIndex = levels.indexOf(
    DCFErrorLogger['logLevel' as keyof typeof DCFErrorLogger] as ErrorSeverity,
  )
  const errorIndex = levels.indexOf(severity)
  return errorIndex >= currentIndex
}

/**
 * 便利関数: エラーをログに記録
 */
export function logError(error: DCFError, context?: string): void {
  DCFErrorLogger.log(error, context)
}

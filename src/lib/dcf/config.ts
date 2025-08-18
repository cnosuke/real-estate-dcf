import { CALCULATION_CONFIG, CalculationConfig, CalculationUtils } from './calculation-config'
import { VALIDATION_CONFIG, ValidationUtils } from '@/lib/validation/config'
import type { ValidationConfig } from '@/lib/validation/types'

/**
 * 統合DCF設定
 * @deprecated 各機能ごとの設定ファイルを直接利用してください
 */
interface DCFConfig {
  CALCULATION: CalculationConfig
  VALIDATION: ValidationConfig
}

/**
 * 統合DCF設定（後方互換性のため）
 * @deprecated 各機能ごとの設定ファイルを直接利用してください
 */
export const DCF_CONFIG: DCFConfig = {
  CALCULATION: CALCULATION_CONFIG,
  VALIDATION: VALIDATION_CONFIG,
}

// Re-export for convenience
export { CALCULATION_CONFIG, CalculationUtils } from './calculation-config'
export { VALIDATION_CONFIG, ValidationUtils } from '@/lib/validation/config'

// 型安全性のための型定義（後方互換性）
export type { DCFConfig, CalculationConfig, ValidationConfig }

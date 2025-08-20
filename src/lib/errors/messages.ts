import { DCFErrorType } from './types'

/**
 * DCFエラータイプごとのデフォルトメッセージ（内部使用のみ）
 */
const DEFAULT_ERROR_MESSAGES: Record<DCFErrorType, string> = {
  [DCFErrorType.INVALID_INPUT]: '入力値が無効です',
  [DCFErrorType.BUSINESS_RULE_VIOLATION]: 'ビジネスルールに違反しています',
  [DCFErrorType.IRR_CALCULATION_FAILED]: 'IRR計算に失敗しました',
  [DCFErrorType.NUMERICAL_INSTABILITY]: '数値計算が不安定です',
  [DCFErrorType.UNREALISTIC_RESULT]: '非現実的な結果です',
  [DCFErrorType.MARKET_INCONSISTENCY]: '市場データに矛盾があります',
}

/**
 * 詳細エラーメッセージ
 */
export const DETAILED_ERROR_MESSAGES = {
  // 計算関連エラー
  CALCULATION_FAILED: 'DCF計算に失敗しました',
  IRR_CONVERGENCE_FAILED: 'IRR計算が収束しませんでした',
  IRR_OSCILLATION: 'IRR計算が振動しています。二分法にフォールバックします',
  IRR_DIVERGENCE: 'IRR計算が発散しました。二分法にフォールバックします',
  IRR_NO_SOLUTION: 'IRR解が存在しないか、複数の解が存在します',
  IRR_EMPTY_CASHFLOWS: 'キャッシュフローが空です',
  IRR_SAME_SIGN_CASHFLOWS:
    'IRR計算にはプラスとマイナスの両方のキャッシュフローが必要です',

  // IRR関連
  IRR_ASSET_CALCULATION_FAILED: '資産IRRの計算に失敗しました',
  IRR_EQUITY_CALCULATION_FAILED: 'エクイティIRRの計算に失敗しました',
  UNREALISTIC_IRR_ASSET: '資産IRRが異常値です',
  UNREALISTIC_IRR_EQUITY: 'エクイティIRRが異常値です',
  HIGH_IRR_ASSET:
    '資産IRRが100%を超えています。計算に問題がある可能性があります',
  HIGH_IRR_EQUITY:
    'エクイティIRRが100%を超えています。計算に問題がある可能性があります',

  // NPV関連
  UNSTABLE_NPV_ASSET: '資産NPVの計算が不安定です',
  UNSTABLE_NPV_EQUITY: 'エクイティNPVの計算が不安定です',
  NPV_CALCULATION_ERROR: 'NPV計算中にエラーが発生しました',

  // 数値計算関連
  NUMERICAL_OVERFLOW: '数値オーバーフローが発生しました',
  NUMERICAL_UNDERFLOW: '導関数がゼロに近づきました。解が存在しないか不安定です',

  // ビジネスルール関連
  LOAN_EXCEEDS_PROPERTY_VALUE:
    '借入額が物件価格の120%を超えています。高いレバレッジとなります',
  SHORT_LOAN_TERM: '返済期間が保有期間より短く、売却時に残債があります',
  HIGH_RENT_DECAY: '家賃下落率が10%を超えています。非常に厳しい想定です',
  HIGH_PRICE_DECAY: '物件価格下落率が5%を超えています。非常に厳しい想定です',
  HIGH_VACANCY: '空室率が30%を超えています。非常に厳しい想定です',
  EQUITY_DISCOUNT_RATE_ANOMALY:
    'エクイティ割引率が資産割引率より低くなっています。通常はレバレッジリスクを考慮してエクイティの方が高くなります',

  // Cap率関連
  UNSTABLE_IMPLICIT_CAP: '暗黙Cap率の計算が不安定です',
  IMPLICIT_CAP_OUT_OF_RANGE:
    '暗黙Cap率が市場の一般的範囲(1%-20%)を外れています',

  // その他
  INVALID_CASH_FLOWS: '無効なキャッシュフローです',
  NEGATIVE_NOI: 'NOIがマイナスです',
  NEGATIVE_SALE_PRICE: '売却時の物件価格がゼロ以下になっています',
  UNEXPECTED_ERROR: '予期しないエラーが発生しました',
} as const

/**
 * エラーメッセージを取得する
 */
export function getErrorMessage(
  type: DCFErrorType,
  detailKey?: keyof typeof DETAILED_ERROR_MESSAGES,
): string {
  if (detailKey && DETAILED_ERROR_MESSAGES[detailKey]) {
    return DETAILED_ERROR_MESSAGES[detailKey]
  }
  return DEFAULT_ERROR_MESSAGES[type] || '不明なエラーです'
}

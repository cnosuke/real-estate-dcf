export const DCF_CONFIG = {
  CALCULATION: {
    EPS: 1e-12, // 数値計算の許容誤差
    MAX_IRR_ITERATIONS: 100, // IRR計算の最大反復回数
    IRR_TOLERANCE: 1e-8, // IRR計算の収束判定許容値
    DERIVATIVE_TOLERANCE: 1e-14, // 導関数の最小値
    IRR_BOUNDS: {
      LOW: -0.99, // IRR下限 (-99%)
      HIGH: 10.0, // IRR上限 (1000%)
    },
    BISECTION_TOLERANCE: 1e-6, // 二分法の許容値
    GRID_SEARCH: {
      COARSE_START: -95, // 粗いグリッドサーチ開始値
      COARSE_END: 500, // 粗いグリッドサーチ終了値
      FINE_STEP: 0.001, // 細かいグリッドサーチのステップ
      FINE_RANGE: 0.05, // 細かいグリッドサーチの範囲
    }
  },
  VALIDATION: {
    MAX_YEARS: 50, // 最大保有年数
    MIN_YEARS: 1, // 最小保有年数
    MAX_RATE: 1.0, // 最大金利 (100%)
    MIN_RATE: 0.0, // 最小金利
    MAX_PERCENTAGE: 1.0, // 最大パーセンテージ値
    MIN_PERCENTAGE: 0.0, // 最小パーセンテージ値
    REASONABLE_BOUNDS: {
      INFLATION: { MIN: -0.1, MAX: 0.2 }, // インフレ率の妥当範囲
      RENT_DECAY: { MIN: 0, MAX: 0.1 }, // 家賃逓減率の妥当範囲
      PRICE_DECAY: { MIN: 0, MAX: 0.05 }, // 価格逓減率の妥当範囲
      VACANCY: { MIN: 0, MAX: 0.5 }, // 空室率の妥当範囲
      DISCOUNT_RATE: { MIN: 0.01, MAX: 0.3 }, // 割引率の妥当範囲
      IRR_ABSOLUTE: { MIN: -10, MAX: 10 }, // IRR絶対値の妥当範囲
      IRR_RELATIVE: { MIN: -1, MAX: 1 }, // IRR相対値の妥当範囲 (100%以下)
      IMPLICIT_CAP: { MIN: 0.01, MAX: 0.2 }, // 暗黙Cap率の妥当範囲
    }
  },
  ERROR_MESSAGES: {
    // エラータイプごとのデフォルトメッセージ
    INVALID_INPUT: '入力値が無効です',
    BUSINESS_RULE_VIOLATION: 'ビジネスルールに違反しています',
    IRR_CALCULATION_FAILED: 'IRR計算に失敗しました',
    NUMERICAL_INSTABILITY: '数値計算が不安定です',
    UNREALISTIC_RESULT: '非現実的な結果です',
    MARKET_INCONSISTENCY: '市場データに矛盾があります',
    
    // 計算関連エラー
    CALCULATION_FAILED: 'DCF計算に失敗しました',
    IRR_CONVERGENCE_FAILED: 'IRR計算が収束しませんでした',
    IRR_OSCILLATION: 'IRR計算が振動しています。二分法にフォールバックします',
    IRR_DIVERGENCE: 'IRR計算が発散しました。二分法にフォールバックします',
    IRR_NO_SOLUTION: 'IRR解が存在しないか、複数の解が存在します',
    IRR_EMPTY_CASHFLOWS: 'キャッシュフローが空です',
    IRR_SAME_SIGN_CASHFLOWS: 'IRR計算にはプラスとマイナスの両方のキャッシュフローが必要です',
    IRR_ASSET_CALCULATION_FAILED: '資産IRRの計算に失敗しました',
    IRR_EQUITY_CALCULATION_FAILED: 'エクイティIRRの計算に失敗しました',
    NUMERICAL_OVERFLOW: '数値オーバーフローが発生しました',
    NUMERICAL_UNDERFLOW: '導関数がゼロに近づきました。解が存在しないか不安定です',
    INVALID_CASH_FLOWS: '無効なキャッシュフローです',
    UNREALISTIC_VALUE: '非現実的な値が検出されました',
    NEGATIVE_NOI: 'NOIがマイナスです',
    NEGATIVE_SALE_PRICE: '売却時の物件価格がゼロ以下になっています',
    NPV_CALCULATION_ERROR: 'NPV計算中にエラーが発生しました',
    UNREALISTIC_IRR_ASSET: '資産IRRが異常値です',
    UNREALISTIC_IRR_EQUITY: 'エクイティIRRが異常値です',
    HIGH_IRR_ASSET: '資産IRRが100%を超えています。計算に問題がある可能性があります',
    HIGH_IRR_EQUITY: 'エクイティIRRが100%を超えています。計算に問題がある可能性があります',
    UNSTABLE_NPV_ASSET: '資産NPVの計算が不安定です',
    UNSTABLE_NPV_EQUITY: 'エクイティNPVの計算が不安定です',
    UNSTABLE_IMPLICIT_CAP: '暗黙Cap率の計算が不安定です',
    IMPLICIT_CAP_OUT_OF_RANGE: '暗黙Cap率が市場の一般的範囲(1%-20%)を外れています',
    LOAN_EXCEEDS_PROPERTY_VALUE: '借入額が物件価格の120%を超えています。高いレバレッジとなります',
    SHORT_LOAN_TERM: '返済期間が保有期間より短く、売却時に残債があります',
    HIGH_RENT_DECAY: '家賃下落率が10%を超えています。非常に厳しい想定です',
    HIGH_PRICE_DECAY: '物件価格下落率が5%を超えています。非常に厳しい想定です',
    HIGH_VACANCY: '空室率が30%を超えています。非常に厳しい想定です',
    EQUITY_DISCOUNT_RATE_ANOMALY: 'エクイティ割引率が資産割引率より低くなっています。通常はレバレッジリスクを考慮してエクイティの方が高くなります',
    UNEXPECTED_ERROR: '予期しないエラーが発生しました',
  }
}

// 型安全性のための型定義
export type DCFConfig = typeof DCF_CONFIG
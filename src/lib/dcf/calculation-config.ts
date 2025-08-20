/**
 * DCF数値計算設定（内部使用のみ）
 */
interface CalculationConfig {
  EPS: number
  MAX_IRR_ITERATIONS: number
  IRR_TOLERANCE: number
  DERIVATIVE_TOLERANCE: number
  IRR_BOUNDS: {
    LOW: number
    HIGH: number
  }
  BISECTION_TOLERANCE: number
  GRID_SEARCH: {
    COARSE_START: number
    COARSE_END: number
    FINE_STEP: number
    FINE_RANGE: number
  }
}

/**
 * 数値計算設定
 */
export const CALCULATION_CONFIG: CalculationConfig = {
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
  },
}

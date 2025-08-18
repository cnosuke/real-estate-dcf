/**
 * DCF数値計算設定
 */
export interface CalculationConfig {
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
  }
}

/**
 * 数値計算ヘルパークラス
 */
export class CalculationUtils {
  /**
   * 数値が計算に適しているかチェック
   */
  static isValidForCalculation(value: number): boolean {
    return Number.isFinite(value) && !Number.isNaN(value) && Math.abs(value) < Number.MAX_SAFE_INTEGER
  }

  /**
   * 許容誤差内での等価性をチェック
   */
  static isNearlyEqual(a: number, b: number, epsilon = CALCULATION_CONFIG.EPS): boolean {
    return Math.abs(a - b) < epsilon
  }

  /**
   * ゼロに近いかチェック
   */
  static isNearlyZero(value: number, epsilon = CALCULATION_CONFIG.EPS): boolean {
    return Math.abs(value) < epsilon
  }

  /**
   * IRRの境界内にあるかチェック
   */
  static isWithinIRRBounds(irr: number): boolean {
    return irr >= CALCULATION_CONFIG.IRR_BOUNDS.LOW && irr <= CALCULATION_CONFIG.IRR_BOUNDS.HIGH
  }

  /**
   * 数値を安全な範囲にクランプ
   */
  static clampToSafeRange(value: number): number {
    if (!Number.isFinite(value)) return 0
    return Math.max(-Number.MAX_SAFE_INTEGER, Math.min(Number.MAX_SAFE_INTEGER, value))
  }
}
import { DCFErrorFactory } from '@/lib/errors'
import { CALCULATION_CONFIG } from '../calculation-config'
import type { IRRCalculationStrategy, IRRResult } from './irr-calculator'

/**
 * Bisection method for IRR calculation
 * Robust and guaranteed to converge when a root exists within the search bounds
 */
export class BisectionIRRStrategy implements IRRCalculationStrategy {
  getName(): string {
    return 'bisection'
  }

  isApplicable(cashFlows: number[]): boolean {
    // Bisection method requires sign change in NPV within the bounds
    const bounds = CALCULATION_CONFIG.IRR_BOUNDS
    const npvLow = this.calculateNPV(cashFlows, bounds.LOW)
    const npvHigh = this.calculateNPV(cashFlows, bounds.HIGH)
    return npvLow * npvHigh < 0
  }

  calculate(cashFlows: number[]): IRRResult {
    const bounds = CALCULATION_CONFIG.IRR_BOUNDS
    let low = bounds.LOW
    let high = bounds.HIGH
    const tolerance = CALCULATION_CONFIG.BISECTION_TOLERANCE
    const maxIterations = CALCULATION_CONFIG.MAX_IRR_ITERATIONS

    const npvLow = this.calculateNPV(cashFlows, low)
    const npvHigh = this.calculateNPV(cashFlows, high)

    if (npvLow * npvHigh > 0) {
      return {
        value: NaN,
        method: this.getName(),
        converged: false,
        error: DCFErrorFactory.createIRRError(this.getName(), cashFlows, {
          reason: 'no_root_in_bounds',
          npvAtLowBound: npvLow,
          npvAtHighBound: npvHigh,
          lowBound: low,
          highBound: high,
        }),
      }
    }

    for (let i = 0; i < maxIterations; i++) {
      const mid = (low + high) / 2
      const npvMid = this.calculateNPV(cashFlows, mid)

      if (Math.abs(npvMid) < tolerance || Math.abs(high - low) < tolerance) {
        return {
          value: mid,
          method: this.getName(),
          iterations: i + 1,
          converged: true,
        }
      }

      if (npvMid * npvLow < 0) {
        high = mid
      } else {
        low = mid
      }
    }

    return {
      value: NaN,
      method: this.getName(),
      iterations: maxIterations,
      converged: false,
      error: DCFErrorFactory.createIRRError(this.getName(), cashFlows, {
        reason: 'max_iterations_reached',
      }),
    }
  }

  private calculateNPV(cashFlows: number[], rate: number): number {
    return cashFlows.reduce((acc, cf, t) => acc + cf / (1 + rate) ** t, 0)
  }
}

import { DCF_CONFIG } from '../config'
import { DCFErrorFactory } from '@/lib/error-utils'
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
    const bounds = DCF_CONFIG.CALCULATION.IRR_BOUNDS
    const npvLow = this.calculateNPV(cashFlows, bounds.LOW)
    const npvHigh = this.calculateNPV(cashFlows, bounds.HIGH)
    return npvLow * npvHigh < 0
  }

  calculate(cashFlows: number[]): IRRResult {
    const bounds = DCF_CONFIG.CALCULATION.IRR_BOUNDS
    let low = bounds.LOW
    let high = bounds.HIGH
    const tolerance = DCF_CONFIG.CALCULATION.BISECTION_TOLERANCE
    const maxIterations = DCF_CONFIG.CALCULATION.MAX_IRR_ITERATIONS
    
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
          highBound: high
        })
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
          converged: true
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
        reason: 'max_iterations_reached'
      })
    }
  }

  private calculateNPV(cashFlows: number[], rate: number): number {
    return cashFlows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0)
  }
}
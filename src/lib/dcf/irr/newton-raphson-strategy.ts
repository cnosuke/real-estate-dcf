import { DCFErrorFactory } from '@/lib/errors'
import { CALCULATION_CONFIG } from '../calculation-config'
import type { IRRCalculationStrategy, IRRResult } from './irr-calculator'

/**
 * Newton-Raphson method for IRR calculation
 * Fast convergence when derivative is well-behaved, but can be unstable
 */
export class NewtonRaphsonIRRStrategy implements IRRCalculationStrategy {
  getName(): string {
    return 'newton-raphson'
  }

  isApplicable(_cashFlows: number[]): boolean {
    // Newton-Raphson method is generally applicable to all cases
    return true
  }

  calculate(cashFlows: number[], initialGuess = 0.08): IRRResult {
    let r = initialGuess
    let lastR = Number.POSITIVE_INFINITY
    const maxIterations = CALCULATION_CONFIG.MAX_IRR_ITERATIONS
    const tolerance = CALCULATION_CONFIG.IRR_TOLERANCE

    for (let i = 0; i < maxIterations; i++) {
      const { npv, derivative } = this.calculateNPVAndDerivative(cashFlows, r)

      // Check for near-zero derivative (critical point)
      if (Math.abs(derivative) < CALCULATION_CONFIG.DERIVATIVE_TOLERANCE) {
        return {
          value: NaN,
          method: this.getName(),
          iterations: i,
          converged: false,
          error: DCFErrorFactory.createIRRError(this.getName(), cashFlows, {
            reason: 'derivative_near_zero',
            iteration: i,
            derivative,
          }),
        }
      }

      const newR = r - npv / derivative

      // Convergence check
      if (Number.isFinite(newR) && Math.abs(newR - r) < tolerance) {
        return {
          value: newR,
          method: this.getName(),
          iterations: i + 1,
          converged: true,
        }
      }

      // Oscillation check
      if (Math.abs(newR - lastR) < tolerance) {
        return {
          value: NaN,
          method: this.getName(),
          iterations: i,
          converged: false,
          error: DCFErrorFactory.createIRRError(this.getName(), cashFlows, {
            reason: 'oscillation',
            iteration: i,
            currentR: r,
            newR,
            lastR,
          }),
        }
      }

      // Divergence check
      if (!Number.isFinite(newR) || Math.abs(newR) > 100) {
        return {
          value: NaN,
          method: this.getName(),
          iterations: i,
          converged: false,
          error: DCFErrorFactory.createIRRError(this.getName(), cashFlows, {
            reason: 'divergence',
            iteration: i,
            newR,
          }),
        }
      }

      lastR = r
      r = newR
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

  private calculateNPVAndDerivative(
    cashFlows: number[],
    rate: number,
  ): { npv: number; derivative: number } {
    let npv = 0
    let derivative = 0

    for (let t = 0; t < cashFlows.length; t++) {
      const powerTerm = (1 + rate) ** t

      if (!Number.isFinite(powerTerm) || powerTerm <= 0) {
        throw DCFErrorFactory.createCalculationError('npv_derivative', {
          rate,
          period: t,
          powerTerm,
        })
      }

      npv += cashFlows[t] / powerTerm

      // Calculate derivative more carefully
      if (t > 0) {
        derivative -= (t * cashFlows[t]) / (powerTerm * (1 + rate))
      }
    }

    return { npv, derivative }
  }
}

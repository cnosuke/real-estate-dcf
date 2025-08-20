import { type DCFError, DCFErrorFactory } from '@/lib/errors'
import { BisectionIRRStrategy } from './bisection-strategy'
import { GridSearchIRRStrategy } from './grid-search-strategy'
import { NewtonRaphsonIRRStrategy } from './newton-raphson-strategy'

/**
 * IRR calculation result
 */
export interface IRRResult {
  value: number
  method: string
  iterations?: number
  converged: boolean
  error?: DCFError
}

/**
 * IRR calculation strategy interface - Strategy Pattern implementation
 */
export interface IRRCalculationStrategy {
  calculate(cashFlows: number[], initialGuess?: number): IRRResult
  getName(): string
  isApplicable(cashFlows: number[]): boolean
}

/**
 * Main IRR calculator class - implements Strategy Pattern for robust IRR calculation
 * Uses multiple calculation methods with fallback mechanism for reliability
 */
export class IRRCalculator {
  private strategies: IRRCalculationStrategy[]

  constructor() {
    this.strategies = [
      new NewtonRaphsonIRRStrategy(),
      new BisectionIRRStrategy(),
      new GridSearchIRRStrategy(),
    ]
  }

  /**
   * Calculate IRR using multiple methods with fallback
   * Tries each strategy in order until one succeeds
   */
  calculate(cashFlows: number[], initialGuess = 0.08): IRRResult {
    // Basic validation
    const validationError = this.validateCashFlows(cashFlows)
    if (validationError) {
      return {
        value: NaN,
        method: 'validation',
        converged: false,
        error: validationError,
      }
    }

    // Try each strategy in order
    for (const strategy of this.strategies) {
      if (!strategy.isApplicable(cashFlows)) continue

      try {
        const result = strategy.calculate(cashFlows, initialGuess)
        if (result.converged && this.isValidIRR(result.value)) {
          return result
        }
      } catch (_error) {}
    }

    // All strategies failed
    return {
      value: NaN,
      method: 'failed',
      converged: false,
      error: DCFErrorFactory.createIRRError('all_methods', cashFlows, {
        attemptedMethods: this.strategies.map((s) => s.getName()),
      }),
    }
  }

  private validateCashFlows(cashFlows: number[]): DCFError | null {
    if (!cashFlows || cashFlows.length === 0) {
      return DCFErrorFactory.createIRRError('validation', cashFlows, {
        reason: 'empty_cash_flows',
      })
    }

    const positiveCount = cashFlows.filter((cf) => cf > 0).length
    const negativeCount = cashFlows.filter((cf) => cf < 0).length

    if (positiveCount === 0 || negativeCount === 0) {
      return DCFErrorFactory.createIRRError('validation', cashFlows, {
        reason: 'no_sign_change',
        positiveCount,
        negativeCount,
      })
    }

    return null
  }

  private isValidIRR(irr: number): boolean {
    return Number.isFinite(irr) && irr > -0.99 && irr < 100
  }
}

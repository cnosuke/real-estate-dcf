import { DCF_CONFIG } from '../config'
import { DCFErrorFactory } from '@/lib/error-utils'
import type { IRRCalculationStrategy, IRRResult } from './irr-calculator'

/**
 * Grid search method for IRR calculation
 * Brute force approach that searches the entire range - used as last resort
 */
export class GridSearchIRRStrategy implements IRRCalculationStrategy {
  getName(): string {
    return 'grid-search'
  }

  isApplicable(cashFlows: number[]): boolean {
    // Grid search is always applicable as a last resort
    return true
  }

  calculate(cashFlows: number[]): IRRResult {
    const coarseResult = this.coarseGridSearch(cashFlows)
    if (!Number.isFinite(coarseResult.rate)) {
      return {
        value: NaN,
        method: this.getName(),
        converged: false,
        error: DCFErrorFactory.createIRRError(this.getName(), cashFlows, {
          reason: 'no_solution_found',
          coarseError: coarseResult.error
        })
      }
    }

    const fineResult = this.fineGridSearch(cashFlows, coarseResult.rate)
    
    return {
      value: fineResult.rate,
      method: this.getName(),
      converged: fineResult.error < 1e-6 // Convergence criteria
    }
  }

  private coarseGridSearch(cashFlows: number[]): { rate: number; error: number } {
    const config = DCF_CONFIG.CALCULATION.GRID_SEARCH
    let best = { rate: NaN, error: Number.POSITIVE_INFINITY }
    
    for (let bp = config.COARSE_START; bp <= config.COARSE_END; bp++) {
      const rate = bp / 100
      try {
        const npv = this.calculateNPV(cashFlows, rate)
        const error = Math.abs(npv)
        if (Number.isFinite(error) && error < best.error) {
          best = { rate, error }
        }
      } catch {
        continue
      }
    }
    
    return best
  }

  private fineGridSearch(cashFlows: number[], centerRate: number): { rate: number; error: number } {
    const config = DCF_CONFIG.CALCULATION.GRID_SEARCH
    let best = { rate: centerRate, error: Math.abs(this.calculateNPV(cashFlows, centerRate)) }
    
    for (let offset = -config.FINE_RANGE; offset <= config.FINE_RANGE; offset += config.FINE_STEP) {
      const rate = centerRate + offset
      if (rate <= -1) continue
      
      try {
        const npv = this.calculateNPV(cashFlows, rate)
        const error = Math.abs(npv)
        if (Number.isFinite(error) && error < best.error) {
          best = { rate, error }
        }
      } catch {
        continue
      }
    }
    
    return best
  }

  private calculateNPV(cashFlows: number[], rate: number): number {
    return cashFlows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0)
  }
}
import { CheckCircle, Clock, type LucideIcon, XCircle } from 'lucide-react'

/**
 * Investment grade classification
 */
type InvestmentGrade = 'excellent' | 'good' | 'caution' | 'poor'

/**
 * Investment grade result with UI properties
 */
type InvestmentGradeResult = {
  grade: InvestmentGrade
  variant: 'default' | 'secondary' | 'destructive'
  label: string
  bgColor: string
  textColor: string
  icon: LucideIcon
  description: string
}

/**
 * Evaluates investment quality based on NPV and IRR metrics
 *
 * @param npv - Net Present Value in Japanese Yen
 * @param irr - Internal Rate of Return as decimal (e.g., 0.05 for 5%)
 * @param discountRate - Required rate of return as decimal
 * @returns Investment grade with UI styling properties
 *
 * @example
 * const grade = getInvestmentGrade(1000000, 0.08, 0.05)
 * // Returns { grade: 'excellent', label: '良い投資', ... }
 */
export function getInvestmentGrade(
  npv: number,
  irr: number,
  discountRate: number,
): InvestmentGradeResult {
  // Validate inputs
  if (
    !Number.isFinite(npv) ||
    !Number.isFinite(irr) ||
    !Number.isFinite(discountRate)
  ) {
    throw new Error('All parameters must be finite numbers')
  }

  if (discountRate < 0) {
    throw new Error('Discount rate must be non-negative')
  }

  // Use imported icons

  // Excellent investment: Positive NPV and IRR significantly above discount rate
  if (npv > 0 && irr > discountRate + 0.01) {
    return {
      grade: 'excellent',
      variant: 'default',
      label: '良い投資',
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      icon: CheckCircle,
      description: 'NPVが正でIRRが基準を大きく上回っています',
    }
  }

  // Good investment: Non-negative NPV and IRR meets or exceeds discount rate
  if (npv >= 0 && irr >= discountRate) {
    return {
      grade: 'good',
      variant: 'default',
      label: '投資可',
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
      icon: CheckCircle,
      description: 'NPVが正でIRRが基準を上回っています',
    }
  }

  // Caution: Marginal investment with small negative NPV or slightly below discount rate
  if (npv >= -1_000_000 && irr >= discountRate - 0.01) {
    return {
      grade: 'caution',
      variant: 'secondary',
      label: '要検討',
      bgColor: 'bg-yellow-500',
      textColor: 'text-white',
      icon: Clock,
      description: 'NPVまたはIRRが基準を下回っています',
    }
  }

  // Poor investment: Significantly negative NPV or IRR well below discount rate
  return {
    grade: 'poor',
    variant: 'destructive',
    label: '推奨しない',
    bgColor: 'bg-red-500',
    textColor: 'text-white',
    icon: XCircle,
    description: 'NPVが負でIRRが基準を大きく下回っています',
  }
}

/**
 * Calculates the payback period for an investment based on equity cash flows
 *
 * @param cfEquity - Array of equity cash flows where index 0 is initial investment (negative)
 *                   and subsequent values are annual cash flows (excluding sale proceeds)
 * @returns Number of years to recover initial investment, or total investment period if never recovered
 *
 * @example
 * const payback = calculatePaybackPeriod([-10000000, 500000, 600000, 700000])
 * // Returns the year when cumulative cash flows >= initial investment
 */
export function calculatePaybackPeriod(cfEquity: number[]): number {
  // Validate input
  if (!Array.isArray(cfEquity) || cfEquity.length < 2) {
    throw new Error(
      'Cash flow array must contain at least 2 elements (initial investment + 1 year)',
    )
  }

  const initialInvestment = Math.abs(cfEquity[0])

  if (initialInvestment === 0) {
    return 0 // No investment means immediate payback
  }

  let cumulativeCF = 0

  // Iterate through operating years (excluding sale year which is the last element)
  for (let t = 1; t < cfEquity.length - 1; t++) {
    const annualCF = cfEquity[t]

    // Validate individual cash flow
    if (!Number.isFinite(annualCF)) {
      throw new Error(`Cash flow at year ${t} must be a finite number`)
    }

    cumulativeCF += annualCF

    if (cumulativeCF >= initialInvestment) {
      return t
    }
  }

  // If never recovered during operating period, return total investment period
  return cfEquity.length - 1
}

/**
 * Calculates the annual payment for an annuity (level payment loan)
 *
 * @param principal - Loan amount
 * @param rate - Annual interest rate as decimal (e.g., 0.05 for 5%)
 * @param years - Loan term in years
 * @returns Annual payment amount
 *
 * @example
 * const payment = annuityPayment(35000000, 0.025, 25)
 * // Returns annual payment amount for 35M yen loan at 2.5% for 25 years
 */
function annuityPayment(
  principal: number,
  rate: number,
  years: number,
): number {
  if (principal <= 0 || years <= 0) return 0
  if (Math.abs(rate) < 1e-10) return principal / years // Handle zero rate case
  return (principal * rate) / (1 - (1 + rate) ** -years)
}

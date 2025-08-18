// Constrained numeric types for type safety
export type Percentage = number & { readonly __brand: 'Percentage' } // [0, 1]
export type PositiveNumber = number & { readonly __brand: 'PositiveNumber' } // > 0
export type NonNegativeNumber = number & {
  readonly __brand: 'NonNegativeNumber'
} // >= 0
export type Year = number & { readonly __brand: 'Year' } // >= 1
export type Rate = number & { readonly __brand: 'Rate' } // >= 0

export type Input = {
  // Base property information
  p0: number // Property purchase price (excluding fees) - should be positive
  i0: number // Initial costs - should be positive
  rentMonthly0: number // Initial monthly rent (including management fees) - should be positive
  monthlyOpex0: number // Monthly operating expenses (excluding taxes) - should be positive
  vacancy: number // Expected vacancy rate [0..1] - should be percentage
  inflation: number // Annual inflation rate - should be non-negative
  rentDecay: number // Annual rent decline rate - should be non-negative
  priceDecay: number // Annual property value decline rate - should be non-negative
  taxAnnualFixed: number // Fixed annual property tax (not inflation-adjusted) - should be positive
  exitCostRate: number // Sale cost rate [0..1] - should be percentage
  years: number // Holding period (years) - should be integer >= 1
  // Discount rates
  discountAsset: number // Asset discount rate (for unlevered analysis) - should be non-negative
  discountEquity: number // Equity discount rate - should be non-negative
  // Loan information (level payment)
  loanAmount: number // Loan amount (0 if no loan) - should be non-negative
  loanRate: number // Interest rate (annual) - should be non-negative
  loanTerm: number // Repayment period (years) - should be integer >= 1
  prepayPenaltyRate?: number // Prepayment penalty rate (optional) - should be percentage
}

export type DebtYear = {
  year: number
  beginBalance: number
  interest: number
  principal: number
  payment: number
  endBalance: number
}

export type Result = {
  cfAsset: number[] // Unlevered cash flows (years 0..N)
  cfEquity: number[] // Equity cash flows (years 0..N)
  npvAsset: number // Net present value of unlevered cash flows
  npvEquity: number // Net present value of equity cash flows
  irrAsset: number // Internal rate of return for unlevered cash flows
  irrEquity: number // Internal rate of return for equity cash flows
  salePriceNet: number // Net sale price (after costs)
  remainingDebtAtExit: number // Remaining debt at exit (if holding < loan term)
  implicitCap?: number // Implicit cap rate for validation = NOI_{N+1}/P_N (optional)
  warnings?: unknown[] // Calculation warnings that don't prevent computation (DCFError[])
}

export type DCFDataset = {
  id: string
  name: string
  createdAt: string
  input: Input
}

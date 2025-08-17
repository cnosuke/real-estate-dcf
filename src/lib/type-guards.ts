import type { Input, Percentage, PositiveNumber, NonNegativeNumber, Rate, Year } from '@/types/dcf'

/**
 * Type guard for Percentage (0 <= value <= 1)
 */
export function isPercentage(value: number): value is Percentage {
  return Number.isFinite(value) && value >= 0 && value <= 1
}

/**
 * Type guard for PositiveNumber (value > 0)
 */
export function isPositiveNumber(value: number): value is PositiveNumber {
  return Number.isFinite(value) && value > 0
}

/**
 * Type guard for NonNegativeNumber (value >= 0)
 */
export function isNonNegativeNumber(value: number): value is NonNegativeNumber {
  return Number.isFinite(value) && value >= 0
}

/**
 * Type guard for Year (value >= 1)
 */
export function isYear(value: number): value is Year {
  return Number.isInteger(value) && value >= 1
}

/**
 * Type guard for Rate (value >= 0)
 */
export function isRate(value: number): value is Rate {
  return Number.isFinite(value) && value >= 0
}

/**
 * Validation error details
 */
export interface ValidationError {
  field: string
  value: unknown
  message: string
}

/**
 * Validates and creates constrained types with detailed error reporting
 */
export class TypeValidationResult<T> {
  constructor(
    public readonly isValid: boolean,
    public readonly value: T | null = null,
    public readonly errors: ValidationError[] = []
  ) {}

  static success<T>(value: T): TypeValidationResult<T> {
    return new TypeValidationResult(true, value, [])
  }

  static failure<T>(errors: ValidationError[]): TypeValidationResult<T> {
    return new TypeValidationResult<T>(false, null, errors)
  }
}

/**
 * Validates input object with detailed error reporting
 */
export function validateInput(input: unknown): TypeValidationResult<Input> {
  if (typeof input !== 'object' || input === null) {
    return TypeValidationResult.failure([
      { field: 'input', value: input, message: 'Input must be an object' }
    ])
  }

  const obj = input as Record<string, unknown>
  const errors: ValidationError[] = []

  // Helper function to validate a field
  const validateField = (
    fieldName: string,
    value: unknown,
    validator: (val: number) => val is number,
    description: string
  ): number | undefined => {
    if (typeof value !== 'number') {
      errors.push({
        field: fieldName,
        value,
        message: `${fieldName} must be a number`
      })
      return undefined
    }

    if (!validator(value)) {
      errors.push({
        field: fieldName,
        value,
        message: `${fieldName} must be ${description}`
      })
      return undefined
    }

    return value
  }

  // Validate required positive number fields
  const p0 = validateField('p0', obj.p0, (val): val is number => isPositiveNumber(val), 'a positive number')
  const i0 = validateField('i0', obj.i0, (val): val is number => isPositiveNumber(val), 'a positive number')
  const rentMonthly0 = validateField('rentMonthly0', obj.rentMonthly0, (val): val is number => isPositiveNumber(val), 'a positive number')
  const monthlyOpex0 = validateField('monthlyOpex0', obj.monthlyOpex0, (val): val is number => isPositiveNumber(val), 'a positive number')
  const taxAnnualFixed = validateField('taxAnnualFixed', obj.taxAnnualFixed, (val): val is number => isPositiveNumber(val), 'a positive number')
  const loanAmount = validateField('loanAmount', obj.loanAmount, (val): val is number => isNonNegativeNumber(val), 'a non-negative number')

  // Validate percentage fields
  const vacancy = validateField('vacancy', obj.vacancy, (val): val is number => isPercentage(val), 'between 0 and 1')
  const exitCostRate = validateField('exitCostRate', obj.exitCostRate, (val): val is number => isPercentage(val), 'between 0 and 1')

  // Validate rate fields
  const inflation = validateField('inflation', obj.inflation, (val): val is number => isRate(val), 'a non-negative number')
  const rentDecay = validateField('rentDecay', obj.rentDecay, (val): val is number => isRate(val), 'a non-negative number')
  const priceDecay = validateField('priceDecay', obj.priceDecay, (val): val is number => isRate(val), 'a non-negative number')
  const discountAsset = validateField('discountAsset', obj.discountAsset, (val): val is number => isRate(val), 'a non-negative number')
  const discountEquity = validateField('discountEquity', obj.discountEquity, (val): val is number => isRate(val), 'a non-negative number')
  const loanRate = validateField('loanRate', obj.loanRate, (val): val is number => isRate(val), 'a non-negative number')

  // Validate year fields
  const years = validateField('years', obj.years, (val): val is number => isYear(val), 'an integer >= 1')
  const loanTerm = validateField('loanTerm', obj.loanTerm, (val): val is number => isYear(val), 'an integer >= 1')

  // Validate optional prepayPenaltyRate
  let prepayPenaltyRate: number | undefined
  if (obj.prepayPenaltyRate !== undefined) {
    prepayPenaltyRate = validateField('prepayPenaltyRate', obj.prepayPenaltyRate, (val): val is number => isPercentage(val), 'between 0 and 1')
  }

  if (errors.length > 0) {
    return TypeValidationResult.failure(errors)
  }

  // All validations passed, construct the validated input
  const validatedInput: Input = {
    p0: p0!,
    i0: i0!,
    rentMonthly0: rentMonthly0!,
    monthlyOpex0: monthlyOpex0!,
    vacancy: vacancy!,
    inflation: inflation!,
    rentDecay: rentDecay!,
    priceDecay: priceDecay!,
    taxAnnualFixed: taxAnnualFixed!,
    exitCostRate: exitCostRate!,
    years: years!,
    discountAsset: discountAsset!,
    discountEquity: discountEquity!,
    loanAmount: loanAmount!,
    loanRate: loanRate!,
    loanTerm: loanTerm!,
    ...(prepayPenaltyRate !== undefined && { prepayPenaltyRate })
  }

  return TypeValidationResult.success(validatedInput)
}

/**
 * Simple type guard for backward compatibility
 */
export function isValidInput(input: unknown): input is Input {
  return validateInput(input).isValid
}

/**
 * Type assertion functions that throw on invalid input
 */
export function assertPercentage(value: number, fieldName: string): asserts value is Percentage {
  if (!isPercentage(value)) {
    throw new Error(`${fieldName} must be between 0 and 1, got ${value}`)
  }
}

export function assertPositiveNumber(value: number, fieldName: string): asserts value is PositiveNumber {
  if (!isPositiveNumber(value)) {
    throw new Error(`${fieldName} must be a positive number, got ${value}`)
  }
}

export function assertNonNegativeNumber(value: number, fieldName: string): asserts value is NonNegativeNumber {
  if (!isNonNegativeNumber(value)) {
    throw new Error(`${fieldName} must be a non-negative number, got ${value}`)
  }
}

export function assertYear(value: number, fieldName: string): asserts value is Year {
  if (!isYear(value)) {
    throw new Error(`${fieldName} must be an integer >= 1, got ${value}`)
  }
}

export function assertRate(value: number, fieldName: string): asserts value is Rate {
  if (!isRate(value)) {
    throw new Error(`${fieldName} must be a non-negative number, got ${value}`)
  }
}

/**
 * Safe type casting functions for creating constrained types
 */
export function toPercentage(value: number): Percentage {
  assertPercentage(value, 'value')
  return value as Percentage
}

export function toPositiveNumber(value: number): PositiveNumber {
  assertPositiveNumber(value, 'value')
  return value as PositiveNumber
}

export function toNonNegativeNumber(value: number): NonNegativeNumber {
  assertNonNegativeNumber(value, 'value')
  return value as NonNegativeNumber
}

export function toYear(value: number): Year {
  assertYear(value, 'value')
  return value as Year
}

export function toRate(value: number): Rate {
  assertRate(value, 'value')
  return value as Rate
}
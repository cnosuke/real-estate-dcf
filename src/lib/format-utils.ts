/**
 * Formats a number as Japanese currency with appropriate units
 *
 * @param value - The monetary value in Japanese Yen
 * @returns Formatted currency string with appropriate units (円, 万円, 億円)
 *
 * @example
 * formatCurrency(5000) // "5,000円"
 * formatCurrency(150000) // "15万円"
 * formatCurrency(250000000) // "2.5億円"
 * formatCurrency(-100000) // "-10万円"
 */
export function formatCurrency(value: number): string {
  // Validate input
  if (!Number.isFinite(value)) {
    throw new Error('Value must be a finite number')
  }

  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''

  // 1億円以上は億円単位で表示
  if (absValue >= 100_000_000) {
    const okuValue = absValue / 100_000_000
    return `${sign}${okuValue.toFixed(1)}億円`
  }

  // 1万円以上は万円単位で表示
  if (absValue >= 10_000) {
    const manValue = absValue / 10_000
    return `${sign}${manValue.toFixed(0)}万円`
  }

  // 1万円未満はそのまま表示
  return `${sign}${absValue.toLocaleString('ja-JP')}円`
}

/**
 * Formats a decimal rate as a percentage with 2 decimal places
 *
 * @param value - The rate as a decimal (e.g., 0.05 for 5%)
 * @returns Formatted percentage string
 *
 * @example
 * formatPercent(0.05) // "5.00%"
 * formatPercent(0.1234) // "12.34%"
 * formatPercent(-0.02) // "-2.00%"
 */
export function formatPercent(value: number): string {
  // Validate input
  if (!Number.isFinite(value)) {
    throw new Error('Value must be a finite number')
  }

  const percentValue = value * 100
  return `${percentValue.toFixed(2)}%`
}

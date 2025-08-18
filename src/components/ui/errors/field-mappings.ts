/**
 * フィールド名の日本語マッピング
 */
export const FIELD_DISPLAY_NAMES: Record<string, string> = {
  p0: '物件価格',
  i0: '初期費用',
  rentMonthly0: '月額家賃',
  monthlyOpex0: '月額運営費用',
  vacancy: '空室率',
  inflation: 'インフレ率',
  rentDecay: '家賃下落率',
  priceDecay: '物件価格下落率',
  taxAnnualFixed: '年間固定資産税',
  exitCostRate: '売却コスト率',
  years: '保有年数',
  discountAsset: '資産割引率',
  discountEquity: 'エクイティ割引率',
  loanAmount: '借入額',
  loanRate: '借入金利',
  loanTerm: '返済期間',
  prepayPenaltyRate: '期限前償還手数料率',
  irrAsset: '資産IRR',
  irrEquity: 'エクイティIRR',
  npvAsset: '資産NPV',
  npvEquity: 'エクイティNPV',
  implicitCap: '暗黙Cap率',
  cashFlows: 'キャッシュフロー',
  noi: 'NOI',
  salePrice: '売却価格'
}

/**
 * フィールド名を日本語に変換
 */
export function getFieldDisplayName(field: string): string {
  return FIELD_DISPLAY_NAMES[field] || field
}

/**
 * 値をフォーマット
 */
export function formatValue(value: unknown): string {
  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return value.toLocaleString()
    }
    return value.toFixed(4)
  }
  
  if (Array.isArray(value)) {
    return `配列 (${value.length}要素)`
  }
  
  return String(value)
}
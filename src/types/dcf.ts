export type Input = {
  // ベース
  p0: number // 物件購入額（本体）
  i0: number // 初期諸費用
  rentMonthly0: number // 初期家賃(月) 管理費等込み
  monthlyOpex0: number // 月次諸費用(月)（税を除く）
  vacancy: number // 想定空室率 [0..1]
  inflation: number // インフレ率(年)
  rentDecay: number // 家賃逓減率(年)
  priceDecay: number // 物件価値逓減率(年)
  taxAnnualFixed: number // 固定資産税・都市計画税（年額固定、インフレ連動なし）
  exitCostRate: number // 売却コスト率 [0..1]
  years: number // 保有年数 N
  // 割引率
  discountAsset: number // 資産割引率（アンレバ用）
  discountEquity: number // エクイティ割引率
  // 借入（元利均等）
  loanAmount: number // 借入額 L（0なら無借入）
  loanRate: number // 金利 r_ℓ（年）
  loanTerm: number // 返済年数 n_ℓ
  prepayPenaltyRate?: number // 繰上償還ペナルティ率（任意）
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
  cfAsset: number[] // アンレバCF（0..N）
  cfEquity: number[] // エクイティCF（0..N）
  npvAsset: number
  npvEquity: number
  irrAsset: number
  irrEquity: number
  salePriceNet: number // 売却純額（コスト控除後）
  remainingDebtAtExit: number // 売却時残債（保有<返済期間の場合）
  implicitCap?: number // 暗黙のCap（検算用）= NOI_{N+1}/P_N（任意）
}

export type DCFDataset = {
  id: string
  name: string
  createdAt: string
  input: Input
}

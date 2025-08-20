# DCF法の理論と実装

## DCF（Discounted Cash Flow）法とは

DCF法は、将来のキャッシュフローを現在価値に割り引いて投資の価値を評価する分析手法です。不動産投資において、物件から得られる将来の賃料収入や売却収入を現在価値に換算し、投資判断を行うために使用されます。

## 基本理論

### 現在価値（Present Value）の概念

将来のお金は現在のお金よりも価値が低いという「お金の時間価値」の概念に基づき、将来キャッシュフローを割引率で現在価値に換算します。

```
PV = CF / (1 + r)^t
```

- PV: 現在価値
- CF: t年後のキャッシュフロー
- r: 割引率
- t: 時間（年）

### 正味現在価値（NPV）

投資によって得られる全期間のキャッシュフローの現在価値から、初期投資額を差し引いた値です。

```
NPV = -初期投資額 + Σ(CFt / (1 + r)^t)
```

NPVが正の場合、その投資は割引率以上の収益をもたらすため、投資価値があると判断されます。

## 不動産投資におけるキャッシュフロー構成

### 1. 営業キャッシュフロー（Annual Cash Flow）

```typescript
// src/lib/dcf/dcf-calculator.ts の実装例
const grossRent = baseBuildingCost * grossRentYield / 100
const operatingIncome = grossRent * (1 - vacancyRate / 100)
const operatingExpenses = operatingIncome * operatingExpenseRatio / 100
const noi = operatingIncome - operatingExpenses
```

#### 主要な構成要素：
- **賃料収入**: 物件から得られる年間賃料
- **空室損失**: 空室率を考慮した収入減少
- **運営費用**: 管理費、修繕費、税金等
- **NOI（Net Operating Income）**: 運営費用控除後の営業利益

### 2. 税引後キャッシュフロー（After-Tax Cash Flow）

```typescript
// 減価償却費の計算
const depreciationExpense = Math.min(
  baseBuildingCost / depreciationYears,
  remainingDepreciableAmount
)

// 税引前キャッシュフロー
const beforeTaxCashFlow = noi - debtService

// 課税所得の計算
const taxableIncome = beforeTaxCashFlow - depreciationExpense

// 税引後キャッシュフロー
const afterTaxCashFlow = beforeTaxCashFlow - (taxableIncome * taxRate / 100)
```

### 3. 売却時キャッシュフロー（Terminal Cash Flow）

```typescript
// 売却時の実装
const saleProceeds = salePrice * (1 - saleCostRate / 100)
const remainingLoanBalance = /* ローン残高計算 */
const beforeTaxSaleProceeds = saleProceeds - remainingLoanBalance

// 売却益の計算
const totalDepreciation = /* 累積減価償却費 */
const bookValue = baseBuildingCost - totalDepreciation
const capitalGain = salePrice - bookValue

// 譲渡税計算
const transferTax = capitalGain * transferTaxRate / 100
const afterTaxSaleProceeds = beforeTaxSaleProceeds - transferTax
```

## 実装における重要な考慮事項

### 1. 数値精度の管理

```typescript
// calculation-config.ts
export const CALCULATION_CONFIG = {
  EPS: 1e-10,  // 計算精度
  MAX_YEARS: 50,  // 最大計算年数
  DEFAULT_ITERATIONS: 1000  // IRR計算の最大反復回数
}
```

微小な数値誤差を避けるため、適切な精度管理を行っています。

### 2. エラーハンドリング

```typescript
// DCFValidator による入力値検証
const validationResult = DCFValidator.validateInput(input)
if (!validationResult.isValid) {
  throw DCFErrorFactory.createValidationError(
    'Invalid input parameters',
    validationResult.errors
  )
}
```

不正な入力値や計算不可能な条件を事前に検証し、適切なエラーメッセージを提供します。

## 実際の計算フロー

本アプリケーションでは、以下の順序でDCF計算を実行します：

1. **入力値検証**: 必須項目チェック、論理的整合性の確認
2. **ローンスケジュール構築**: 元利均等返済による年度別返済計画
3. **年度別キャッシュフロー計算**: 各年の税引後キャッシュフロー算出
4. **売却時キャッシュフロー計算**: 最終年度の売却による手取り額
5. **NPV計算**: 全キャッシュフローの現在価値合計
6. **IRR計算**: 内部収益率の数値解法による算出

## 割引率の設定

### 資産基準利回り（Asset Discount Rate）
物件全体（負債＋自己資金）に対する要求利回りです。一般的に以下を参考に設定します：
- 長期国債利回り + リスクプレミアム
- 類似物件の取引利回り
- 投資家の機会費用

### 自己資金基準利回り（Equity Discount Rate）
自己資金部分に対する要求利回りです。レバレッジ効果を考慮し、通常は資産基準利回りより高く設定します。

## DCF分析の限界と注意点

1. **将来予測の不確実性**: 賃料上昇率、空室率等の予測値に依存
2. **割引率設定の主観性**: 適切な割引率の設定が困難
3. **市場環境の変化**: 金利変動、法制度変更等の外部要因
4. **流動性リスク**: 不動産の売却時期や価格の不確実性

これらの限界を理解した上で、感度分析やシナリオ分析と組み合わせて使用することが重要です。
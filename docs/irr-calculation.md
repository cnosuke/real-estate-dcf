# IRR計算アルゴリズム

## IRR（Internal Rate of Return）とは

IRR（内部収益率）は、投資のNPVをゼロにする割引率のことです。投資から得られるキャッシュフローの現在価値の合計が、初期投資額と等しくなる利回りを表します。

## IRRの数学的定義

IRRは以下の方程式を満たす利回り r です：

```
NPV = 0 = -C₀ + CF₁/(1+r)¹ + CF₂/(1+r)² + ... + CFₙ/(1+r)ⁿ
```

- C₀: 初期投資額
- CFₜ: t期のキャッシュフロー
- r: IRR（求める内部収益率）
- n: 投資期間

この方程式は解析的に解くことが困難なため、数値解法を用いて近似解を求めます。

## 本アプリケーションの実装戦略

本アプリケーションでは、堅牢性と精度を両立するため、複数のアルゴリズムを段階的に適用するアプローチを採用しています。

### 計算戦略の概要

```typescript
// src/lib/dcf/irr/irr-calculator.ts
export class IRRCalculator {
  static calculate(cashFlows: number[]): number {
    // 1. グリッドサーチによる粗い推定
    const gridEstimate = GridSearchStrategy.findInitialEstimate(cashFlows)
    
    // 2. ニュートン・ラフソン法による精密計算
    const newtonResult = NewtonRaphsonStrategy.solve(cashFlows, gridEstimate)
    if (newtonResult.converged) {
      return newtonResult.rate
    }
    
    // 3. バイセクション法によるフォールバック
    return BisectionStrategy.solve(cashFlows)
  }
}
```

## 1. グリッドサーチ戦略

### 目的
ニュートン・ラフソン法の初期値として適切な推定値を見つけるため、広範囲の利回りで粗い探索を行います。

### 実装

```typescript
// src/lib/dcf/irr/grid-search-strategy.ts
export class GridSearchStrategy {
  private static readonly GRID_MIN = -0.99  // -99%
  private static readonly GRID_MAX = 5.0    // 500%
  private static readonly GRID_STEP = 0.01  // 1%

  static findInitialEstimate(cashFlows: number[]): number {
    let bestRate = 0
    let bestNPV = Number.POSITIVE_INFINITY
    
    for (let rate = this.GRID_MIN; rate <= this.GRID_MAX; rate += this.GRID_STEP) {
      const npv = this.calculateNPV(cashFlows, rate)
      if (Math.abs(npv) < Math.abs(bestNPV)) {
        bestNPV = npv
        bestRate = rate
      }
    }
    
    return bestRate
  }
}
```

### 特徴
- **範囲**: -99%から500%まで1%刻みで探索
- **目的**: NPVの絶対値が最小となる利回りを初期推定値とする
- **利点**: 複数解がある場合でも安定した初期値を提供

## 2. ニュートン・ラフソン法

### 理論的背景
ニュートン・ラフソン法は、関数の導関数を利用して高速に解に収束する数値解法です。

```
r_{n+1} = r_n - f(r_n) / f'(r_n)
```

- f(r) = NPV(r): NPV関数
- f'(r): NPVの1次導関数

### NPVの導関数

```typescript
// NPVの1次導関数の計算
private static calculateNPVDerivative(cashFlows: number[], rate: number): number {
  return cashFlows.reduce((sum, cf, t) => {
    if (t === 0) return sum  // 初期投資は t=0 なので導関数に寄与しない
    return sum - (t * cf) / Math.pow(1 + rate, t + 1)
  }, 0)
}
```

### 実装

```typescript
// src/lib/dcf/irr/newton-raphson-strategy.ts
export class NewtonRaphsonStrategy {
  private static readonly MAX_ITERATIONS = 100
  private static readonly TOLERANCE = 1e-8

  static solve(cashFlows: number[], initialGuess: number): IRRResult {
    let rate = initialGuess
    
    for (let i = 0; i < this.MAX_ITERATIONS; i++) {
      const npv = this.calculateNPV(cashFlows, rate)
      const derivative = this.calculateNPVDerivative(cashFlows, rate)
      
      // 導関数がゼロに近い場合は収束失敗
      if (Math.abs(derivative) < 1e-15) {
        return { rate: NaN, converged: false, iterations: i }
      }
      
      const newRate = rate - npv / derivative
      
      // 収束判定
      if (Math.abs(newRate - rate) < this.TOLERANCE) {
        return { rate: newRate, converged: true, iterations: i + 1 }
      }
      
      rate = newRate
    }
    
    return { rate: NaN, converged: false, iterations: this.MAX_ITERATIONS }
  }
}
```

### 特徴
- **高速収束**: 良い初期値があれば数回の反復で収束
- **高精度**: 1e-8の許容誤差で計算
- **収束条件**: 連続する推定値の差が許容誤差以下

## 3. バイセクション法（フォールバック）

### 目的
ニュートン・ラフソン法が収束しない場合の堅牢なフォールバック手法です。

### 理論
NPV関数が連続で、異符号の区間でゼロ点を持つことを利用した二分探索法です。

### 実装

```typescript
// src/lib/dcf/irr/bisection-strategy.ts
export class BisectionStrategy {
  private static readonly MAX_ITERATIONS = 1000
  private static readonly TOLERANCE = 1e-10

  static solve(cashFlows: number[]): number {
    // 符号が異なる区間を探索
    let lower = -0.99  // -99%
    let upper = 5.0    // 500%
    
    let npvLower = this.calculateNPV(cashFlows, lower)
    let npvUpper = this.calculateNPV(cashFlows, upper)
    
    // 符号が同じ場合はIRRが存在しない可能性
    if (npvLower * npvUpper > 0) {
      throw new Error('IRR may not exist or multiple solutions exist')
    }
    
    for (let i = 0; i < this.MAX_ITERATIONS; i++) {
      const mid = (lower + upper) / 2
      const npvMid = this.calculateNPV(cashFlows, mid)
      
      if (Math.abs(npvMid) < this.TOLERANCE) {
        return mid
      }
      
      if (npvLower * npvMid < 0) {
        upper = mid
        npvUpper = npvMid
      } else {
        lower = mid
        npvLower = npvMid
      }
    }
    
    return (lower + upper) / 2
  }
}
```

### 特徴
- **確実な収束**: 解が存在する区間では必ず収束
- **堅牢性**: 初期値に依存しない
- **低速**: 収束は遅いがフォールバックとして有効

## IRR計算の特殊ケース

### 1. 複数解の存在

不動産投資では稀ですが、キャッシュフローの符号が複数回変わる場合、IRRが複数存在する可能性があります。本実装では最初に見つかった解を返します。

### 2. 解が存在しないケース

```typescript
// 検証例
const cashFlows = [-1000, -100, -100, -100]  // すべて負のキャッシュフロー
// この場合、どの利回りでもNPVは負となり、IRRは存在しない
```

### 3. 無限大に発散するケース

```typescript
// 初期投資がゼロまたは正の場合
const cashFlows = [0, 1000, 1000, 1000]  // 初期投資なし
// IRRは無限大に発散
```

## パフォーマンス最適化

### 計算結果のキャッシュ

```typescript
// 同一のキャッシュフローに対する再計算を避ける
private static cache = new Map<string, number>()

static calculate(cashFlows: number[]): number {
  const key = cashFlows.join(',')
  if (this.cache.has(key)) {
    return this.cache.get(key)!
  }
  
  const result = this.performCalculation(cashFlows)
  this.cache.set(key, result)
  return result
}
```

### 早期終了条件

```typescript
// 明らかに計算不要なケースの早期判定
if (cashFlows.length === 0 || cashFlows[0] >= 0) {
  throw new DCFError('Invalid cash flow pattern for IRR calculation')
}
```

## エラーハンドリング

### 計算エラーの分類

1. **入力エラー**: 不正なキャッシュフロー配列
2. **数値エラー**: 計算中のオーバーフロー・アンダーフロー
3. **収束エラー**: 全てのアルゴリズムが収束に失敗
4. **論理エラー**: IRRが数学的に存在しない

### エラー報告

```typescript
try {
  const irr = IRRCalculator.calculate(cashFlows)
} catch (error) {
  if (error instanceof DCFError) {
    // 適切なユーザー向けメッセージを表示
    console.error('IRR calculation failed:', error.message)
  }
}
```

## 精度と計算時間のトレードオフ

| 手法 | 精度 | 速度 | 堅牢性 |
|------|------|------|--------|
| グリッドサーチ | 低 | 中 | 高 |
| ニュートン・ラフソン | 高 | 高 | 中 |
| バイセクション | 高 | 低 | 高 |

本実装では、これらの特性を活かして段階的に適用することで、精度・速度・堅牢性を同時に実現しています。
import { useAtomValue } from 'jotai'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Info,
  MinusCircle,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
import {
  discountAssetAtom,
  discountEquityAtom,
} from '@/atoms/calculation/dcf-input'
import {
  currentDCFErrorAtom,
  dcfResultAtom,
  hasCalculationErrorAtom,
} from '@/atoms/calculation/dcf-output'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ErrorList } from '@/components/ui/errors'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { DCFError } from '@/lib/errors'
import { formatCurrency, formatPercent } from '@/lib/format-utils'
import { calculatePaybackPeriod } from '@/lib/investment-utils'
import {
  getResultHelpText,
  RESULT_FAQ,
  RESULT_HELP_TEXTS,
} from '@/lib/result-help-texts'
import type { Result } from '@/types/dcf'

export function DCFResultDisplay() {
  const result = useAtomValue(dcfResultAtom)
  const currentError = useAtomValue(currentDCFErrorAtom)
  const hasError = useAtomValue(hasCalculationErrorAtom)
  const [activeTab, setActiveTab] = useState('summary')
  const [showHelpDetails, setShowHelpDetails] = useState(false)

  // Show error state if calculation failed
  if (hasError && currentError) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            計算エラー
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorList errors={[currentError]} warnings={[]} compact={false} />
        </CardContent>
      </Card>
    )
  }

  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>投資分析結果</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            入力値を設定してDCF分析を実行してください。
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            投資分析結果
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHelpDetails(!showHelpDetails)}
              >
                <Info className="h-4 w-4 mr-1" />
                {showHelpDetails ? '説明を閉じる' : '詳しい説明'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        {showHelpDetails && (
          <CardContent>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                以下の分析結果は、入力された条件に基づく予測値です。実際の投資成果は市場環境や運営状況により変動する可能性があります。
                投資判断は複数の指標を総合的に検討して行ってください。
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* メイン結果表示 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">総合判定</TabsTrigger>
          <TabsTrigger value="profitability">収益性</TabsTrigger>
          <TabsTrigger value="cashflow">キャッシュフロー</TabsTrigger>
          <TabsTrigger value="details">詳細分析</TabsTrigger>
        </TabsList>

        {/* 総合判定タブ */}
        <TabsContent value="summary">
          <InvestmentSummary result={result} />
        </TabsContent>

        {/* 収益性タブ */}
        <TabsContent value="profitability">
          <ProfitabilityAnalysis result={result} />
        </TabsContent>

        {/* キャッシュフロータブ */}
        <TabsContent value="cashflow">
          <CashFlowAnalysis result={result} />
        </TabsContent>

        {/* 詳細分析タブ */}
        <TabsContent value="details">
          <DetailedAnalysis result={result} />
        </TabsContent>
      </Tabs>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>よくある質問</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {RESULT_FAQ.map((faq) => (
              <Collapsible key={faq.question.slice(0, 20)}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-left h-auto p-3"
                  >
                    <span className="font-medium">{faq.question}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-3 pb-3">
                  <div className="text-sm text-muted-foreground">
                    {faq.answer}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 総合判定コンポーネント
function InvestmentSummary({ result }: { result: Result }) {
  const discountAsset = useAtomValue(discountAssetAtom)
  const discountEquity = useAtomValue(discountEquityAtom)
  const overallRating = calculateOverallRating(
    result,
    discountAsset,
    discountEquity,
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            総合評価
            <Badge variant={overallRating.variant}>{overallRating.label}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {overallRating.description}
            </div>

            {/* 主要指標のサマリー */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <IndicatorCard
                title="NPV（資産）"
                value={formatCurrency(result.npvAsset)}
                status={result.npvAsset > 0 ? 'positive' : 'negative'}
                helpText={getResultHelpText('npvAsset')}
              />
              <IndicatorCard
                title="IRR（資産）"
                value={formatPercent(result.irrAsset)}
                status={
                  result.irrAsset > discountAsset ? 'positive' : 'negative'
                }
                helpText={getResultHelpText('irrAsset')}
              />
              <IndicatorCard
                title="NPV（エクイティ）"
                value={formatCurrency(result.npvEquity)}
                status={result.npvEquity > 0 ? 'positive' : 'negative'}
                helpText={getResultHelpText('npvEquity')}
              />
              <IndicatorCard
                title="IRR（エクイティ）"
                value={formatPercent(result.irrEquity)}
                status={
                  result.irrEquity > discountEquity ? 'positive' : 'negative'
                }
                helpText={getResultHelpText('irrEquity')}
              />
            </div>

            {/* 投資判断のガイダンス */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">投資判断のポイント</div>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>NPVがプラスの場合、理論的には投資価値があります</li>
                    <li>IRRが要求利回りを上回っているか確認しましょう</li>
                    <li>キャッシュフローの安定性も重要な要素です</li>
                    <li>
                      暗黙のキャップレートが市場相場と整合しているか確認しましょう
                    </li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 収益性分析コンポーネント
function ProfitabilityAnalysis({ result }: { result: Result }) {
  const discountAsset = useAtomValue(discountAssetAtom)
  const discountEquity = useAtomValue(discountEquityAtom)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>収益性指標の詳細分析</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* NPV分析 */}
          <div>
            <h4 className="text-lg font-semibold mb-3">NPV（正味現在価値）</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">NPV（資産）</span>
                  <HelpTooltip
                    title={RESULT_HELP_TEXTS.npvAsset.title}
                    content={getResultHelpText('npvAsset')?.content || ''}
                  />
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(result.npvAsset)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  基準利回り: {formatPercent(discountAsset)}
                </div>
                <div
                  className={`text-sm mt-2 ${result.npvAsset > 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {result.npvAsset > 0 ? '投資価値あり' : '投資価値疑問'}
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">NPV（エクイティ）</span>
                  <HelpTooltip
                    title={RESULT_HELP_TEXTS.npvEquity.title}
                    content={getResultHelpText('npvEquity')?.content || ''}
                  />
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(result.npvEquity)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  基準利回り: {formatPercent(discountEquity)}
                </div>
                <div
                  className={`text-sm mt-2 ${result.npvEquity > 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {result.npvEquity > 0
                    ? 'レバレッジ効果あり'
                    : 'レバレッジ効果なし'}
                </div>
              </div>
            </div>
          </div>

          {/* IRR分析 */}
          <div>
            <h4 className="text-lg font-semibold mb-3">IRR（内部収益率）</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">IRR（資産）</span>
                  <HelpTooltip
                    title={RESULT_HELP_TEXTS.irrAsset.title}
                    content={getResultHelpText('irrAsset')?.content || ''}
                  />
                </div>
                <div className="text-2xl font-bold">
                  {formatPercent(result.irrAsset)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  vs 基準利回り: {formatPercent(discountAsset)}
                </div>
                <div
                  className={`text-sm mt-2 ${result.irrAsset > discountAsset ? 'text-green-600' : 'text-red-600'}`}
                >
                  {result.irrAsset > discountAsset
                    ? `+${formatPercent(result.irrAsset - discountAsset)} 超過`
                    : `${formatPercent(discountAsset - result.irrAsset)} 不足`}
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">IRR（エクイティ）</span>
                  <HelpTooltip
                    title={RESULT_HELP_TEXTS.irrEquity.title}
                    content={getResultHelpText('irrEquity')?.content || ''}
                  />
                </div>
                <div className="text-2xl font-bold">
                  {formatPercent(result.irrEquity)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  vs 基準利回り: {formatPercent(discountEquity)}
                </div>
                <div
                  className={`text-sm mt-2 ${result.irrEquity > discountEquity ? 'text-green-600' : 'text-red-600'}`}
                >
                  {result.irrEquity > discountEquity
                    ? `+${formatPercent(result.irrEquity - discountEquity)} 超過`
                    : `${formatPercent(discountEquity - result.irrEquity)} 不足`}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// キャッシュフロー分析コンポーネント
function CashFlowAnalysis({ result }: { result: Result }) {
  const paybackPeriod = calculatePaybackPeriod(result.cfEquity)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>キャッシュフロー詳細分析</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 年次キャッシュフロー */}
          <div>
            <h4 className="text-lg font-semibold mb-3">
              年次キャッシュフロー推移
            </h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>年度</TableHead>
                  <TableHead className="text-right">資産CF</TableHead>
                  <TableHead className="text-right">エクイティCF</TableHead>
                  <TableHead className="text-right">累積CF</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.cfAsset.map((assetCf, index) => {
                  const cumulativeCf = result.cfEquity
                    .slice(0, index + 1)
                    .reduce((sum, cf) => sum + cf, 0)
                  return (
                    <TableRow key={`cf-year-${index}-${assetCf}`}>
                      <TableCell className="font-medium">
                        {index === 0 ? '初期' : `${index}年目`}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatCurrency(assetCf)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        <span
                          className={
                            result.cfEquity[index] >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }
                        >
                          {formatCurrency(result.cfEquity[index])}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        <span
                          className={
                            cumulativeCf >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }
                        >
                          {formatCurrency(cumulativeCf)}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* キャッシュフロー指標 */}
          <div>
            <h4 className="text-lg font-semibold mb-3">キャッシュフロー指標</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">
                  投資回収期間
                </div>
                <div className="text-xl font-bold">{paybackPeriod}年</div>
                <div className="text-xs text-muted-foreground mt-1">
                  売却除く
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">
                  平均年間CF
                </div>
                <div className="text-xl font-bold">
                  {formatCurrency(
                    result.cfEquity
                      .slice(1, -1)
                      .reduce((sum, cf) => sum + cf, 0) /
                      Math.max(1, result.cfEquity.length - 2),
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  売却年除く
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">
                  CF安定性
                </div>
                <div className="text-xl font-bold">
                  {result.cfEquity.slice(1).every((cf) => cf >= 0)
                    ? '安定'
                    : '要注意'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {result.cfEquity.slice(1).filter((cf) => cf < 0).length}
                  年マイナス
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 詳細分析コンポーネント
function DetailedAnalysis({ result }: { result: Result }) {
  const warnings: DCFError[] = (result.warnings as DCFError[]) || []

  return (
    <div className="space-y-4">
      {/* 警告表示 */}
      {warnings.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              計算時の警告
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorList errors={[]} warnings={warnings} compact={false} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>出口戦略・リスク分析</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 売却・残債情報 */}
          <div>
            <h4 className="text-lg font-semibold mb-3">売却・残債情報</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">売却純額</span>
                  <HelpTooltip
                    title={RESULT_HELP_TEXTS.salePriceNet.title}
                    content={getResultHelpText('salePriceNet')?.content || ''}
                  />
                </div>
                <div className="text-xl font-bold">
                  {formatCurrency(result.salePriceNet)}
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">売却時残債</span>
                  <HelpTooltip
                    title={RESULT_HELP_TEXTS.remainingDebtAtExit.title}
                    content={
                      getResultHelpText('remainingDebtAtExit')?.content || ''
                    }
                  />
                </div>
                <div className="text-xl font-bold">
                  {formatCurrency(result.remainingDebtAtExit)}
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">残債比率</span>
                  <HelpTooltip content="売却純額に対する残債の比率。50%以下が理想的。" />
                </div>
                <div className="text-xl font-bold">
                  {result.salePriceNet > 0
                    ? formatPercent(
                        result.remainingDebtAtExit / result.salePriceNet,
                      )
                    : 'N/A'}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    result.salePriceNet > 0 &&
                    result.remainingDebtAtExit / result.salePriceNet <= 0.5
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }`}
                >
                  {result.salePriceNet > 0 &&
                  result.remainingDebtAtExit / result.salePriceNet <= 0.5
                    ? '良好'
                    : '要注意'}
                </div>
              </div>
            </div>
          </div>

          {/* 暗黙キャップレート */}
          <div>
            <h4 className="text-lg font-semibold mb-3">市場整合性チェック</h4>
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  暗黙のキャップレート
                </span>
                <HelpTooltip
                  title={RESULT_HELP_TEXTS.implicitCap.title}
                  content={getResultHelpText('implicitCap')?.content || ''}
                />
              </div>
              <div className="text-xl font-bold">
                {result.implicitCap ? formatPercent(result.implicitCap) : 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                市場相場と比較して前提条件の妥当性を確認
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 指標カードコンポーネント
interface IndicatorCardProps {
  title: string
  value: string
  status: 'positive' | 'negative' | 'neutral'
  helpText: { title: string; content: string } | null
}

function IndicatorCard({ title, value, status, helpText }: IndicatorCardProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'positive':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'negative':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <MinusCircle className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'positive':
        return 'border-green-200 bg-green-50'
      case 'negative':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-yellow-200 bg-yellow-50'
    }
  }

  return (
    <div className={`p-3 rounded-lg border ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-muted-foreground">
          {title}
        </span>
        <div className="flex items-center gap-1">
          {getStatusIcon()}
          {helpText && (
            <HelpTooltip title={helpText.title} content={helpText.content} />
          )}
        </div>
      </div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  )
}

// 総合評価の計算
function calculateOverallRating(
  result: Result,
  discountAsset: number,
  discountEquity: number,
) {
  const scores = {
    npvAsset: result.npvAsset > 0 ? 1 : 0,
    npvEquity: result.npvEquity > 0 ? 1 : 0,
    irrAsset: result.irrAsset > discountAsset ? 1 : 0,
    irrEquity: result.irrEquity > discountEquity ? 1 : 0,
  }

  const totalScore = Object.values(scores).reduce(
    (sum, score) => sum + score,
    0,
  )

  if (totalScore >= 4) {
    return {
      label: '優良',
      variant: 'default' as const,
      description: '全ての主要指標が良好で、投資価値の高い物件です。',
    }
  } else if (totalScore >= 3) {
    return {
      label: '良好',
      variant: 'secondary' as const,
      description: 'おおむね良好な指標ですが、一部注意が必要な要素があります。',
    }
  } else if (totalScore >= 2) {
    return {
      label: '要検討',
      variant: 'outline' as const,
      description:
        '投資価値はありますが、リスクを慎重に検討する必要があります。',
    }
  } else {
    return {
      label: '要注意',
      variant: 'destructive' as const,
      description: '投資価値に疑問があります。条件の見直しを検討してください。',
    }
  }
}

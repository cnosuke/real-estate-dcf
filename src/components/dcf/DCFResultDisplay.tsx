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
  const [activeTab, setActiveTab] = useState('analysis')
  const [showHelpDetails, setShowHelpDetails] = useState(false)

  // Show error state if calculation failed
  if (hasError && currentError) {
    return (
      <Card className="border-destructive/50">
        <CardHeader className="py-3">
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            計算エラー
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3">
          <ErrorList errors={[currentError]} warnings={[]} compact={false} />
        </CardContent>
      </Card>
    )
  }

  if (!result) {
    return (
      <Card>
        <CardHeader className="py-3">
          <CardTitle>投資分析結果</CardTitle>
        </CardHeader>
        <CardContent className="py-3">
          <div className="text-center text-muted-foreground">
            入力値を設定してDCF分析を実行してください。
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {/* メイン結果表示 */}
      <Card>
        <CardHeader className="py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <CardTitle className="flex items-center justify-between text-base text-blue-800">
            投資分析結果
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHelpDetails(!showHelpDetails)}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <Info className="h-4 w-4 mr-1" />
                {showHelpDetails ? '説明を閉じる' : '詳しい説明'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        {showHelpDetails && (
          <CardContent className="py-3">
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold text-blue-700 mb-2">DCF法による計算の仕組み</h4>
                <p className="text-xs leading-relaxed">
                  将来のキャッシュフローを現在価値に割り引いて投資価値を算出。年次の家賃収入から運営費・税金・借入返済を差し引き、
                  最終年に物件売却益を加算したキャッシュフローを基準利回りで現在価値化します。
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <h5 className="font-medium text-gray-700">主要な計算前提</h5>
                  <ul className="list-disc list-inside space-y-1 mt-1 text-gray-600">
                    <li>家賃は年率で逓減（空室率考慮）</li>
                    <li>物件価格は年率で逓減</li>
                    <li>固定資産税・運営費はインフレ率で増加</li>
                    <li>借入は元利均等返済</li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-700">指標の読み方</h5>
                  <ul className="list-disc list-inside space-y-1 mt-1 text-gray-600">
                    <li>NPV &gt; 0：投資価値あり</li>
                    <li>IRR &gt; 基準利回り：期待収益を上回る</li>
                    <li>資産ベース：物件全体の収益性</li>
                    <li>エクイティベース：自己資金の収益性</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        )}

        <CardContent className="py-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 h-9 bg-gray-100">
              <TabsTrigger 
                value="analysis" 
                className="text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                分析結果
              </TabsTrigger>
              <TabsTrigger 
                value="details" 
                className="text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                詳細情報
              </TabsTrigger>
            </TabsList>

            {/* 分析結果タブ */}
            <TabsContent value="analysis" className="space-y-3">
              <InvestmentSummary result={result} />
              <ProfitabilityAnalysis result={result} />
            </TabsContent>

            {/* 詳細情報タブ */}
            <TabsContent value="details" className="space-y-3">
              <CashFlowAnalysis result={result} />
              <DetailedAnalysis result={result} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle>よくある質問</CardTitle>
        </CardHeader>
        <CardContent className="py-3">
          <div className="space-y-3">
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
    <div className="space-y-3">
      <Card>
        <CardHeader className="py-3 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardTitle className="flex items-center gap-2 text-base text-green-800">
            総合評価
            <Badge variant={overallRating.variant}>{overallRating.label}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3">
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              {overallRating.description}
            </div>

            {/* 主要指標のサマリー */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

            {/* 投資利益サマリー */}
            <div className="p-4 border rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
              <h4 className="text-sm font-semibold text-emerald-800 mb-3">投資利益の見込み</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-emerald-700 mb-1">
                    自己資金利益（NPV）
                    <HelpTooltip content="将来のキャッシュフローを現在価値に割り引いた投資の利益額。プラスなら投資価値があり、金額が大きいほど有利な投資。" />
                  </div>
                  <div className={`text-lg font-bold ${result.npvEquity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(result.npvEquity)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-emerald-700 mb-1">
                    累積キャッシュフロー
                    <HelpTooltip content="投資開始から売却まで全期間のキャッシュフロー合計。初期投資・毎年の家賃収入・売却益をすべて含んだ投資の総収支。" />
                  </div>
                  <div className={`text-lg font-bold ${result.cfEquity.reduce((sum, cf) => sum + cf, 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(result.cfEquity.reduce((sum, cf) => sum + cf, 0))}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-emerald-700 mb-1">
                    総投資収益率
                    <HelpTooltip content="自己資金に対する年平均収益率（IRR）。基準利回りを上回っていれば期待収益を満たす投資。" />
                  </div>
                  <div className={`text-lg font-bold ${result.irrEquity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(result.irrEquity)}
                  </div>
                </div>
              </div>
              <div className="mt-3 p-3 bg-white/50 rounded-lg border border-emerald-200">
                <div className="text-xs text-emerald-800 leading-relaxed">
                  {result.npvEquity > 0 ? (
                    <>
                      <span className="font-semibold">この投資は有望です。</span>
                      自己資金に対して約<span className="font-bold text-green-600">{formatCurrency(Math.abs(result.npvEquity))}</span>の利益が見込まれます。
                      これは、将来の家賃収入と売却益から借入返済や諸費用を差し引き、現在価値に割り引いた結果の純利益です。
                      年平均収益率は<span className="font-bold">{formatPercent(result.irrEquity)}</span>となり、
                      {result.irrEquity > discountEquity ? 
                        `基準利回り（${formatPercent(discountEquity)}）を上回る良好な投資です。` :
                        `基準利回り（${formatPercent(discountEquity)}）を下回っているため、条件の見直しを検討してください。`
                      }
                    </>
                  ) : (
                    <>
                      <span className="font-semibold">この投資は慎重な検討が必要です。</span>
                      現在の条件では約<span className="font-bold text-red-600">{formatCurrency(Math.abs(result.npvEquity))}</span>の損失が予想されます。
                      これは、将来の家賃収入と売却益が、借入返済や諸費用を含む総投資額を下回ることを意味します。
                      購入価格の引き下げ、家賃設定の見直し、または運営費の削減などを検討することをお勧めします。
                    </>
                  )}
                </div>
              </div>
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
    <div className="space-y-3">
      <Card>
        <CardHeader className="py-3 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardTitle className="text-base text-amber-800">収益性指標の詳細分析</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* NPV分析 */}
          <div>
            <h4 className="text-sm font-medium mb-2">NPV（正味現在価値）</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-blue-700">NPV（資産）</span>
                  <HelpTooltip
                    title={RESULT_HELP_TEXTS.npvAsset.title}
                    content={getResultHelpText('npvAsset')?.content || ''}
                  />
                </div>
                <div className="text-lg font-bold">
                  {formatCurrency(result.npvAsset)}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  基準: {formatPercent(discountAsset)}
                </div>
                <div
                  className={`text-xs mt-1 ${result.npvAsset > 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {result.npvAsset > 0 ? '投資価値あり' : '投資価値疑問'}
                </div>
              </div>

              <div className="p-3 border rounded-lg bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-green-700">NPV（エクイティ）</span>
                  <HelpTooltip
                    title={RESULT_HELP_TEXTS.npvEquity.title}
                    content={getResultHelpText('npvEquity')?.content || ''}
                  />
                </div>
                <div className="text-lg font-bold">
                  {formatCurrency(result.npvEquity)}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  基準: {formatPercent(discountEquity)}
                </div>
                <div
                  className={`text-xs mt-1 ${result.npvEquity > 0 ? 'text-green-600' : 'text-red-600'}`}
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
            <h4 className="text-sm font-medium mb-2">IRR（内部収益率）</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-indigo-700">IRR（資産）</span>
                  <HelpTooltip
                    title={RESULT_HELP_TEXTS.irrAsset.title}
                    content={getResultHelpText('irrAsset')?.content || ''}
                  />
                </div>
                <div className="text-lg font-bold">
                  {formatPercent(result.irrAsset)}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  vs 基準: {formatPercent(discountAsset)}
                </div>
                <div
                  className={`text-xs mt-1 ${result.irrAsset > discountAsset ? 'text-green-600' : 'text-red-600'}`}
                >
                  {result.irrAsset > discountAsset
                    ? `+${formatPercent(result.irrAsset - discountAsset)} 超過`
                    : `${formatPercent(discountAsset - result.irrAsset)} 不足`}
                </div>
              </div>

              <div className="p-3 border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-purple-700">IRR（エクイティ）</span>
                  <HelpTooltip
                    title={RESULT_HELP_TEXTS.irrEquity.title}
                    content={getResultHelpText('irrEquity')?.content || ''}
                  />
                </div>
                <div className="text-lg font-bold">
                  {formatPercent(result.irrEquity)}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  vs 基準: {formatPercent(discountEquity)}
                </div>
                <div
                  className={`text-xs mt-1 ${result.irrEquity > discountEquity ? 'text-green-600' : 'text-red-600'}`}
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
  const [showCashFlowTable, setShowCashFlowTable] = useState(false)

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="py-3 bg-gradient-to-r from-purple-50 to-violet-50">
          <CardTitle className="text-base text-purple-800">キャッシュフロー分析</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* キャッシュフロー指標 */}
          <div>
            <h4 className="text-sm font-medium mb-2">主要指標</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 border rounded-lg bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
                <div className="text-xs text-cyan-700 mb-1 font-medium">
                  投資回収期間
                </div>
                <div className="text-lg font-bold">{paybackPeriod}年</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  売却除く
                </div>
              </div>

              <div className="p-3 border rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
                <div className="text-xs text-teal-700 mb-1 font-medium">
                  平均年間CF
                </div>
                <div className="text-lg font-bold">
                  {formatCurrency(
                    result.cfEquity
                      .slice(1, -1)
                      .reduce((sum, cf) => sum + cf, 0) /
                      Math.max(1, result.cfEquity.length - 2),
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  売却年除く
                </div>
              </div>

              <div className="p-3 border rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                <div className="text-xs text-emerald-700 mb-1 font-medium">
                  CF安定性
                </div>
                <div className="text-lg font-bold">
                  {result.cfEquity.slice(1).every((cf) => cf >= 0)
                    ? '安定'
                    : '要注意'}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {result.cfEquity.slice(1).filter((cf) => cf < 0).length}
                  年マイナス
                </div>
              </div>
            </div>
          </div>

          {/* 年次キャッシュフロー（トグル表示） */}
          <div>
            <Collapsible open={showCashFlowTable} onOpenChange={setShowCashFlowTable}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium">年次キャッシュフロー推移</h4>
                    <ChevronDown className={`h-4 w-4 transition-transform ${
                      showCashFlowTable ? 'rotate-180' : ''
                    }`} />
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">年度</TableHead>
                      <TableHead className="text-right text-xs">資産CF</TableHead>
                      <TableHead className="text-right text-xs">エクイティCF</TableHead>
                      <TableHead className="text-right text-xs">累積CF</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.cfAsset.map((assetCf, index) => {
                      const cumulativeCf = result.cfEquity
                        .slice(0, index + 1)
                        .reduce((sum, cf) => sum + cf, 0)
                      return (
                        <TableRow key={`cf-year-${index}-${assetCf}`}>
                          <TableCell className="font-medium text-xs">
                            {index === 0 ? '初期' : `${index}年目`}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {formatCurrency(assetCf)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
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
                          <TableCell className="text-right font-mono text-xs">
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
              </CollapsibleContent>
            </Collapsible>
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
    <div className="space-y-3">
      {/* 警告表示 */}
      {warnings.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader className="py-3">
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              計算時の警告
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3">
            <ErrorList errors={[]} warnings={warnings} compact={false} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="py-3 bg-gradient-to-r from-red-50 to-pink-50">
          <CardTitle className="text-base text-red-800">出口戦略・リスク分析</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-blue-700">売却純額</span>
                <HelpTooltip
                  title={RESULT_HELP_TEXTS.salePriceNet.title}
                  content={getResultHelpText('salePriceNet')?.content || ''}
                />
              </div>
              <div className="text-lg font-bold">
                {formatCurrency(result.salePriceNet)}
              </div>
            </div>

            <div className="p-3 border rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-orange-700">売却時残債</span>
                <HelpTooltip
                  title={RESULT_HELP_TEXTS.remainingDebtAtExit.title}
                  content={
                    getResultHelpText('remainingDebtAtExit')?.content || ''
                  }
                />
              </div>
              <div className="text-lg font-bold">
                {formatCurrency(result.remainingDebtAtExit)}
              </div>
            </div>

            <div className="p-3 border rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-amber-700">残債比率</span>
                <HelpTooltip content="売却純額に対する残債の比率。50%以下が理想的。" />
              </div>
              <div className="text-lg font-bold">
                {result.salePriceNet > 0
                  ? formatPercent(
                      result.remainingDebtAtExit / result.salePriceNet,
                    )
                  : 'N/A'}
              </div>
              <div
                className={`text-xs mt-0.5 ${
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

            <div className="p-3 border rounded-lg bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-violet-700">
                  暗黙キャップレート
                </span>
                <HelpTooltip
                  title={RESULT_HELP_TEXTS.implicitCap.title}
                  content={getResultHelpText('implicitCap')?.content || ''}
                />
              </div>
              <div className="text-lg font-bold">
                {result.implicitCap ? formatPercent(result.implicitCap) : 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                市場相場比較
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
    <div className={`p-2 rounded-lg border ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-muted-foreground">
          {title}
        </span>
        <div className="flex items-center gap-0.5">
          {getStatusIcon()}
          {helpText && (
            <HelpTooltip title={helpText.title} content={helpText.content} />
          )}
        </div>
      </div>
      <div className="text-sm font-semibold">{value}</div>
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

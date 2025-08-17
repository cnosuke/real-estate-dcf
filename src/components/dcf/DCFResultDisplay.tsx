import { useAtomValue } from 'jotai'
import {
  AlertTriangle,
  TrendingUp,
} from 'lucide-react'
import { discountAssetAtom, discountEquityAtom } from '@/atoms/dcf-input-atoms'
import { dcfResultAtom, currentDCFErrorAtom, hasCalculationErrorAtom } from '@/atoms/dcf-output-atoms'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatPercent } from '@/lib/format-utils'
import { calculatePaybackPeriod, getInvestmentGrade } from '@/lib/investment-utils'
import { ErrorList } from '@/components/common/ErrorDisplay'
import { DCFError } from '@/lib/error-utils'


export function DCFResultDisplay() {
  const result = useAtomValue(dcfResultAtom)
  const currentError = useAtomValue(currentDCFErrorAtom)
  const hasError = useAtomValue(hasCalculationErrorAtom)
  const discountAsset = useAtomValue(discountAssetAtom)
  const discountEquity = useAtomValue(discountEquityAtom)

  // Show error state if calculation failed
  if (hasError && currentError) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            計算エラー
          </CardTitle>
          <CardDescription>
            DCF計算中にエラーが発生しました
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorList 
            errors={[currentError]} 
            warnings={[]} 
            compact={false}
          />
        </CardContent>
      </Card>
    )
  }

  if (!result) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            計算結果を表示するには、左側のパラメータを入力してください
          </p>
        </CardContent>
      </Card>
    )
  }

  // Extract warnings from result
  const warnings: DCFError[] = (result.warnings as DCFError[]) || []

  const _assetGrade = getInvestmentGrade(
    result.npvAsset,
    result.irrAsset,
    discountAsset,
  )
  const equityGrade = getInvestmentGrade(
    result.npvEquity,
    result.irrEquity,
    discountEquity,
  )
  const paybackPeriod = calculatePaybackPeriod(result.cfEquity)

  return (
    <div className="space-y-6">
      {/* Display warnings if any */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">計算時の警告</h3>
          <ErrorList 
            errors={[]} 
            warnings={warnings} 
            compact={true}
          />
        </div>
      )}
      {/* メイン投資結果表示 */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            投資分析結果
          </CardTitle>
          <CardDescription>
            あなたの投資の実際の利回りと投資判定
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 自己資金投資の結果（メイン表示）*/}
          <div className={`p-6 rounded-lg ${equityGrade.bgColor}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <equityGrade.icon
                  className={`h-8 w-8 ${equityGrade.textColor}`}
                />
                <div>
                  <h3 className={`text-2xl font-bold ${equityGrade.textColor}`}>
                    {equityGrade.label}
                  </h3>
                  <p className={`text-sm ${equityGrade.textColor} opacity-90`}>
                    {equityGrade.description}
                  </p>
                </div>
              </div>
            </div>

            {/* 主要指標の大きな表示 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div
                  className={`text-3xl font-bold ${equityGrade.textColor} mb-1`}
                >
                  {formatPercent(result.irrEquity)}
                </div>
                <div
                  className={`text-sm ${equityGrade.textColor} opacity-90 font-medium`}
                >
                  実際の投資利回り
                </div>
                <div className={`text-xs ${equityGrade.textColor} opacity-75`}>
                  自己資金IRR
                </div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${equityGrade.textColor} mb-1`}
                >
                  {formatPercent(result.irrAsset)}
                </div>
                <div
                  className={`text-sm ${equityGrade.textColor} opacity-90 font-medium`}
                >
                  物件の利回り
                </div>
                <div className={`text-xs ${equityGrade.textColor} opacity-75`}>
                  資産IRR
                </div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${equityGrade.textColor} mb-1`}
                >
                  {paybackPeriod}年
                </div>
                <div
                  className={`text-sm ${equityGrade.textColor} opacity-90 font-medium`}
                >
                  投資回収期間
                </div>
                <div className={`text-xs ${equityGrade.textColor} opacity-75`}>
                  売却除く
                </div>
              </div>
            </div>
          </div>

          {/* NPV詳細情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-muted/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">自己資金NPV</span>
                <HelpTooltip content="自己資金投資による現在価値での利益。正の値なら投資価値があります。" />
              </div>
              <div className="text-xl font-bold">
                {formatCurrency(result.npvEquity)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                基準利回り: {formatPercent(discountEquity)}
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-muted/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">物件NPV</span>
                <HelpTooltip content="物件そのものの投資価値。借入を考慮しない純粋な物件力を示します。" />
              </div>
              <div className="text-xl font-bold">
                {formatCurrency(result.npvAsset)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                基準利回り: {formatPercent(discountAsset)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 詳細データ（折りたたみ形式） */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">詳細分析データ</CardTitle>
          <CardDescription>
            キャッシュフロー、売却情報、その他の分析データ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 年次キャッシュフロー */}
          <div>
            <h4 className="text-sm font-medium mb-3">年次キャッシュフロー</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>年度</TableHead>
                  <TableHead className="text-right">資産CF</TableHead>
                  <TableHead className="text-right">エクイティCF</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.cfAsset.map((assetCf, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: 年次データなので順序は変わらない
                  <TableRow key={`cf-${index}`}>
                    <TableCell className="font-medium">
                      {index === 0 ? '初期' : `${index}年目`}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(assetCf)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(result.cfEquity[index])}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* 売却・残債情報 */}
          <div>
            <h4 className="text-sm font-medium mb-3">売却・残債情報</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 border rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">
                  売却純額
                </div>
                <div className="text-sm font-mono font-semibold">
                  {formatCurrency(result.salePriceNet)}
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">
                  売却時残債
                </div>
                <div className="text-sm font-mono font-semibold">
                  {formatCurrency(result.remainingDebtAtExit)}
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">
                  暗黙Cap（検算用）
                </div>
                <div className="text-sm font-mono font-semibold">
                  {result.implicitCap
                    ? formatPercent(result.implicitCap)
                    : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 注意事項 */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          この分析結果は概算値です。実際の投資判断には専門家にご相談ください。
          市場環境の変化、法制度の変更等により実際の収益は変動する可能性があります。
          {warnings.length > 0 && (
            <span className="block mt-2 font-medium">
              上記の警告を確認し、必要に応じてパラメータを調整してください。
            </span>
          )}
        </AlertDescription>
      </Alert>
    </div>
  )
}

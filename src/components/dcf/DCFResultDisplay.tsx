import { useAtomValue } from 'jotai'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  XCircle,
} from 'lucide-react'
import { discountAssetAtom, discountEquityAtom } from '@/atoms/dcf-input-atoms'
import { dcfResultAtom } from '@/atoms/dcf-output-atoms'
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

// 投資判断のヘルパー関数
const getInvestmentGrade = (npv: number, irr: number, discountRate: number) => {
  if (npv > 0 && irr > discountRate + 0.01) {
    return {
      grade: 'excellent',
      variant: 'default' as const,
      label: '良い投資',
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      icon: CheckCircle,
      description: 'NPVが正でIRRが基準を大きく上回っています',
    }
  } else if (npv >= 0 && irr >= discountRate) {
    return {
      grade: 'good',
      variant: 'default' as const,
      label: '投資可',
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
      icon: CheckCircle,
      description: 'NPVが正でIRRが基準を上回っています',
    }
  } else if (npv >= -1000000 && irr >= discountRate - 0.01) {
    return {
      grade: 'caution',
      variant: 'secondary' as const,
      label: '要検討',
      bgColor: 'bg-yellow-500',
      textColor: 'text-white',
      icon: Clock,
      description: 'NPVまたはIRRが基準を下回っています',
    }
  } else {
    return {
      grade: 'poor',
      variant: 'destructive' as const,
      label: '推奨しない',
      bgColor: 'bg-red-500',
      textColor: 'text-white',
      icon: XCircle,
      description: 'NPVが負でIRRが基準を大きく下回っています',
    }
  }
}

// 投資回収期間の計算
const calculatePaybackPeriod = (cfEquity: number[]): number => {
  const initialInvestment = Math.abs(cfEquity[0])
  let cumulativeCF = 0

  for (let t = 1; t < cfEquity.length - 1; t++) {
    // 売却年は除く
    cumulativeCF += cfEquity[t]
    if (cumulativeCF >= initialInvestment) {
      return t
    }
  }

  return cfEquity.length - 1 // 売却時まで回収できない場合
}

const formatCurrency = (value: number) => {
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''

  if (absValue >= 100_000_000) {
    // 1億円以上は億円単位で表示
    return `${sign}${(absValue / 100_000_000).toFixed(1)}億円`
  } else if (absValue >= 10_000) {
    // 1万円以上は万円単位で表示
    return `${sign}${(absValue / 10_000).toFixed(0)}万円`
  } else {
    // 1万円未満はそのまま表示
    return `${sign}${absValue.toLocaleString()}円`
  }
}

const formatPercent = (value: number) => {
  return `${(value * 100).toFixed(2)}%`
}

// ヘルプテキスト用ヘルパーコンポーネントは ui/help-tooltip.tsx に移動

export function DCFResultDisplay() {
  const result = useAtomValue(dcfResultAtom)
  const discountAsset = useAtomValue(discountAssetAtom)
  const discountEquity = useAtomValue(discountEquityAtom)

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
        </AlertDescription>
      </Alert>
    </div>
  )
}

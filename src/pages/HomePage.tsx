import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function HomePage() {
  return (
    <div className="text-center">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-blue-700 sm:text-6xl">
          不動産投資DCF分析
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Discounted Cash
          Flow（DCF）法を用いた不動産投資の収益性分析ツールです。
          購入価格、賃料、運営費用、借入条件などのパラメータを入力することで、
          NPV（正味現在価値）やIRR（内部収益率）を計算し、投資判断をサポートします。
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link to="/dcf-analysis">DCF分析を開始</Link>
          </Button>
        </div>
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-foreground">主な機能</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="text-lg text-blue-700">
                  価格パス方式
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  物件価格の将来変動を考慮した売却価格の予測
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="text-lg text-blue-700">
                  元利均等返済
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  借入金の元利均等返済スケジュールに基づくキャッシュフロー計算
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="text-lg text-blue-700">
                  包括的指標
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  NPV、IRR、暗黙のキャップレートなど多角的な収益性評価
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

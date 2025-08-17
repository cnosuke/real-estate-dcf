import { DCFInputForm } from '@/components/dcf/DCFInputForm'
import { DCFResultDisplay } from '@/components/dcf/DCFResultDisplay'

export function DCFAnalysisPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">DCF分析</h1>
        <p className="mt-2 text-muted-foreground">
          不動産投資の収益性を詳細に分析します
        </p>
      </div>

      {/* 新しいレイアウト：入力フォーム → 結果表示 */}
      <div className="space-y-8">
        {/* 入力フォーム */}
        <DCFInputForm />

        {/* 投資分析結果表示（大きく目立つ） */}
        <DCFResultDisplay />
      </div>
    </div>
  )
}

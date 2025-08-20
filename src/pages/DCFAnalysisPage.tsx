import { DCFInputForm } from '@/components/dcf/DCFInputForm'
import { DCFResultDisplay } from '@/components/dcf/DCFResultDisplay'

export function DCFAnalysisPage() {
  return (
    <div className="container mx-auto px-4 py-3">
      <div className="mb-3">
        <h1 className="text-xl font-bold text-foreground">DCF分析</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          不動産投資の収益性を詳細に分析します
        </p>
      </div>

      {/* 新しいレイアウト：入力フォーム → 結果表示 */}
      <div className="space-y-3">
        {/* 入力フォーム */}
        <DCFInputForm />

        {/* 投資分析結果表示（大きく目立つ） */}
        <DCFResultDisplay />
      </div>
    </div>
  )
}

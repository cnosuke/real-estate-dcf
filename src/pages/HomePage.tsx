import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export function HomePage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold tracking-tight text-blue-700 sm:text-4xl mb-4">
          不動産投資DCF分析
        </h1>
        <p className="text-base text-muted-foreground mb-8">
          Discounted Cash Flow（DCF）法を用いた不動産投資の収益性分析ツール
        </p>
        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
          <Link to="/dcf-analysis">DCF分析を開始</Link>
        </Button>
      </div>
    </div>
  )
}

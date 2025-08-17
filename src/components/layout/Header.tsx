import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="border-b bg-blue-50/50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-xl font-bold text-blue-700">
            不動産DCF分析
          </Link>
        </div>
        <nav className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link to="/">ホーム</Link>
          </Button>
          <Button
            variant="default"
            asChild
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Link to="/dcf-analysis">DCF分析</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}

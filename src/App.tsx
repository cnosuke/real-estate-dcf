import { Provider } from 'jotai'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Layout } from '@/components/layout/Layout'
import { DCFAnalysisPage } from '@/pages/DCFAnalysisPage'
import { HomePage } from '@/pages/HomePage'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import '@/styles/globals.css'

export function App() {
  return (
    <ErrorBoundary>
      <Provider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="dcf-analysis" element={<DCFAnalysisPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  )
}

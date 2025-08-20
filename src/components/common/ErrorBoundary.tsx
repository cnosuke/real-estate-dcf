import { AlertTriangle, RefreshCw } from 'lucide-react'
import React, { Component, type ReactNode } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DCFError, DCFErrorType, getErrorMessage, logError } from '@/lib/errors'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })

    // Log the error
    if (error instanceof DCFError) {
      logError(error, 'ErrorBoundary')
    } else {
      console.error('Uncaught error in ErrorBoundary:', error, errorInfo)
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error } = this.state
      const isDCFError = error instanceof DCFError
      const errorMessage = isDCFError
        ? (error as DCFError).message ||
          getErrorMessage((error as DCFError).type)
        : 'アプリケーションでエラーが発生しました'

      const isUserError =
        isDCFError &&
        [
          DCFErrorType.INVALID_INPUT,
          DCFErrorType.BUSINESS_RULE_VIOLATION,
        ].includes((error as DCFError).type)

      return (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {isUserError ? '入力エラー' : 'システムエラー'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>

            {isDCFError && (error as DCFError).field && (
              <div className="text-sm text-muted-foreground">
                <strong>関連フィールド:</strong> {(error as DCFError).field}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={this.handleRetry}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                再試行
              </Button>

              {!isUserError && (
                <Button
                  onClick={() => window.location.reload()}
                  variant="secondary"
                  size="sm"
                >
                  ページをリロード
                </Button>
              )}
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium">
                  開発者向け詳細情報
                </summary>
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                  {error?.stack}
                  {'\n\nComponent Stack:\n'}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

/**
 * Higher-order component for wrapping components with error boundary (internal use only)
 */
function _withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void,
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

/**
 * Hook for handling errors in functional components (internal use only)
 */
function _useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const handleError = React.useCallback((error: Error) => {
    if (error instanceof DCFError) {
      logError(error, 'useErrorHandler')
    }
    setError(error)
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  // Throw error to be caught by Error Boundary
  if (error) {
    throw error
  }

  return { handleError, clearError }
}

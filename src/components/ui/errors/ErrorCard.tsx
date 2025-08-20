import { ChevronDown, Info, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import type { DCFError } from '@/lib/errors/types'
import { getErrorSuggestion, getErrorUIConfig } from './config'
import { formatValue, getFieldDisplayName } from './field-mappings'

interface ErrorCardProps {
  error: DCFError
  onDismiss?: () => void
  compact?: boolean
  showDetails?: boolean
  isExpanded?: boolean
  onToggleExpanded?: () => void
}

export function ErrorCard({
  error,
  onDismiss,
  compact = false,
  showDetails = false,
  isExpanded = false,
  onToggleExpanded,
}: ErrorCardProps) {
  const config = getErrorUIConfig(error.type)
  const message = error.getUserMessage()
  const suggestion = getErrorSuggestion(error.type, error.context?.field)

  if (compact) {
    return (
      <Alert variant={config.variant} className="my-2">
        <config.icon className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{message}</span>
          {onDismiss && (
            <Button
              onClick={onDismiss}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-transparent"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className={`border-${config.borderColor} bg-${config.bgColor}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <config.icon className={`h-5 w-5 text-${config.textColor}`} />
            <span className={`text-${config.textColor}`}>{config.title}</span>
            <Badge variant={config.badgeVariant}>{config.badgeText}</Badge>
          </div>
          <div className="flex items-center gap-2">
            {showDetails && onToggleExpanded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpanded}
                className="h-auto p-1"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              </Button>
            )}
            {onDismiss && (
              <Button
                onClick={onDismiss}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <Alert variant={config.variant}>
          <AlertDescription>{message}</AlertDescription>
        </Alert>

        {error.context?.field && (
          <div className="text-sm">
            <strong>関連項目:</strong>{' '}
            {getFieldDisplayName(error.context.field)}
          </div>
        )}

        {error.context?.value !== undefined && (
          <div className="text-sm">
            <strong>入力値:</strong> {formatValue(error.context.value)}
          </div>
        )}

        {isExpanded && showDetails && (
          <Collapsible open={isExpanded}>
            <CollapsibleContent className="space-y-3">
              <details className="text-sm">
                <summary className="cursor-pointer font-medium mb-2">
                  詳細情報
                </summary>
                <div className="bg-muted p-3 rounded text-xs">
                  <pre>{JSON.stringify(error.getDebugInfo(), null, 2)}</pre>
                </div>
              </details>
            </CollapsibleContent>
          </Collapsible>
        )}

        {suggestion && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <strong>対処方法:</strong>
                <p className="mt-1">{suggestion}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

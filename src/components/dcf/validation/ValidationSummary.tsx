import React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, XCircle, Info } from 'lucide-react'
import { useDCFForm } from '../providers/DCFFormProvider'
import { useValidationDisplay } from '../providers/ValidationDisplayProvider'
import type { DCFError } from '@/lib/error-utils'

export function ValidationSummary() {
  const { errors, warnings, hasErrors, hasWarnings } = useDCFForm()
  const { 
    showValidationSummary, 
    showWarnings, 
    errorSeverityFilter,
    errorDisplayFormat 
  } = useValidationDisplay()

  if (!showValidationSummary || (!hasErrors && !hasWarnings)) {
    return null
  }

  // フィルタリングされたエラー・警告
  const filteredErrors = errorSeverityFilter === 'warning' ? [] : errors
  const filteredWarnings = (errorSeverityFilter === 'error' || !showWarnings) ? [] : warnings

  if (filteredErrors.length === 0 && filteredWarnings.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">入力チェック</h3>
      
      {filteredErrors.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            エラー
            <Badge variant="destructive">{filteredErrors.length}</Badge>
          </AlertTitle>
          <AlertDescription>
            <ValidationErrorList 
              errors={filteredErrors} 
              format={errorDisplayFormat}
            />
          </AlertDescription>
        </Alert>
      )}

      {filteredWarnings.length > 0 && (
        <Alert variant="default">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            警告
            <Badge variant="outline">{filteredWarnings.length}</Badge>
          </AlertTitle>
          <AlertDescription>
            <ValidationErrorList 
              errors={filteredWarnings} 
              format={errorDisplayFormat}
            />
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

interface ValidationErrorListProps {
  errors: DCFError[]
  format: 'compact' | 'detailed'
}

function ValidationErrorList({ errors, format }: ValidationErrorListProps) {
  if (format === 'compact') {
    return (
      <ul className="text-sm space-y-1">
        {errors.map((error, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="w-1 h-1 rounded-full bg-current mt-2 flex-shrink-0" />
            <span>{error.getUserMessage()}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="space-y-2">
      {errors.map((error, index) => (
        <div key={index} className="text-sm border-l-2 border-current pl-3">
          <div className="font-medium">{error.getUserMessage()}</div>
          {error.context?.field && (
            <div className="text-xs text-muted-foreground">
              フィールド: {error.context.field}
            </div>
          )}
          {error.context?.value !== undefined && (
            <div className="text-xs text-muted-foreground">
              値: {String(error.context.value)}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
import React from 'react'
import { CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DCFError } from '@/lib/errors/types'
import { ErrorList } from './ErrorList'

export interface ErrorDisplayProps {
  errors?: DCFError[]
  warnings?: DCFError[]
  onDismissError?: (index: number) => void
  onDismissWarning?: (index: number) => void
  compact?: boolean
  showDetails?: boolean
  title?: string
  emptyMessage?: string
}

export function ErrorDisplay({ 
  errors = [],
  warnings = [],
  onDismissError,
  onDismissWarning,
  compact = false,
  showDetails = true,
  title,
  emptyMessage = '入力値と計算結果に特に問題は検出されませんでした。ただし、投資判断は複数の観点から慎重に行ってください。'
}: ErrorDisplayProps) {
  
  // エラーも警告もない場合
  if (errors.length === 0 && warnings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            {title || 'チェック結果：問題なし'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <ErrorList
      errors={errors}
      warnings={warnings}
      onDismissError={onDismissError}
      onDismissWarning={onDismissWarning}
      compact={compact}
      showDetails={showDetails}
    />
  )
}
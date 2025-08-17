import React from 'react'
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DCFError, DCFErrorType, generateErrorMessage } from '@/lib/error-utils'

export interface ErrorDisplayProps {
  error: DCFError
  onDismiss?: () => void
  compact?: boolean
  showDetails?: boolean
}

export function ErrorDisplay({ 
  error, 
  onDismiss, 
  compact = false, 
  showDetails = false 
}: ErrorDisplayProps) {
  const errorConfig = getErrorConfig(error.type)
  const message = generateErrorMessage(error)

  if (compact) {
    return (
      <Alert variant={errorConfig.variant} className="my-2">
        <errorConfig.icon className="h-4 w-4" />
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
    <Card className={`border-${errorConfig.borderColor} bg-${errorConfig.bgColor}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <errorConfig.icon className={`h-5 w-5 text-${errorConfig.textColor}`} />
            <span className={`text-${errorConfig.textColor}`}>
              {errorConfig.title}
            </span>
            <Badge variant={errorConfig.badgeVariant}>
              {errorConfig.badgeText}
            </Badge>
          </div>
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
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Alert variant={errorConfig.variant}>
          <AlertDescription>
            {message}
          </AlertDescription>
        </Alert>

        {error.field && (
          <div className="text-sm">
            <strong>関連項目:</strong> {getFieldDisplayName(error.field)}
          </div>
        )}

        {error.value !== undefined && (
          <div className="text-sm">
            <strong>入力値:</strong> {formatValue(error.value)}
          </div>
        )}

        {showDetails && error.debugInfo && (
          <details className="text-sm">
            <summary className="cursor-pointer font-medium mb-2">
              詳細情報
            </summary>
            <div className="bg-muted p-3 rounded text-xs">
              <pre>{JSON.stringify(error.debugInfo, null, 2)}</pre>
            </div>
          </details>
        )}

        {getErrorSuggestion(error) && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <strong>対処方法:</strong>
                <p className="mt-1">{getErrorSuggestion(error)}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Multiple errors display component
 */
export interface ErrorListProps {
  errors: DCFError[]
  warnings?: DCFError[]
  onDismissError?: (index: number) => void
  onDismissWarning?: (index: number) => void
  compact?: boolean
}

export function ErrorList({ 
  errors, 
  warnings = [], 
  onDismissError, 
  onDismissWarning,
  compact = true 
}: ErrorListProps) {
  if (errors.length === 0 && warnings.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {errors.map((error, index) => (
        <ErrorDisplay
          key={`error-${index}`}
          error={error}
          onDismiss={onDismissError ? () => onDismissError(index) : undefined}
          compact={compact}
        />
      ))}
      
      {warnings.map((warning, index) => (
        <ErrorDisplay
          key={`warning-${index}`}
          error={warning}
          onDismiss={onDismissWarning ? () => onDismissWarning(index) : undefined}
          compact={compact}
        />
      ))}
    </div>
  )
}

// Helper functions

function getErrorConfig(type: DCFErrorType) {
  switch (type) {
    case DCFErrorType.INVALID_INPUT:
      return {
        icon: AlertTriangle,
        variant: 'destructive' as const,
        title: '入力エラー',
        badgeText: 'エラー',
        badgeVariant: 'destructive' as const,
        borderColor: 'destructive',
        bgColor: 'destructive/5',
        textColor: 'destructive'
      }
    
    case DCFErrorType.BUSINESS_RULE_VIOLATION:
      return {
        icon: AlertCircle,
        variant: 'destructive' as const,
        title: 'ビジネスルール違反',
        badgeText: '警告',
        badgeVariant: 'secondary' as const,
        borderColor: 'orange-500',
        bgColor: 'orange-50',
        textColor: 'orange-700'
      }
    
    case DCFErrorType.IRR_CALCULATION_FAILED:
      return {
        icon: AlertTriangle,
        variant: 'destructive' as const,
        title: 'IRR計算エラー',
        badgeText: 'エラー',
        badgeVariant: 'destructive' as const,
        borderColor: 'destructive',
        bgColor: 'destructive/5',
        textColor: 'destructive'
      }
    
    case DCFErrorType.NUMERICAL_INSTABILITY:
      return {
        icon: AlertTriangle,
        variant: 'destructive' as const,
        title: '数値計算エラー',
        badgeText: 'エラー',
        badgeVariant: 'destructive' as const,
        borderColor: 'destructive',
        bgColor: 'destructive/5',
        textColor: 'destructive'
      }
    
    case DCFErrorType.UNREALISTIC_RESULT:
      return {
        icon: AlertCircle,
        variant: 'default' as const,
        title: '計算結果の警告',
        badgeText: '注意',
        badgeVariant: 'secondary' as const,
        borderColor: 'yellow-500',
        bgColor: 'yellow-50',
        textColor: 'yellow-700'
      }
    
    case DCFErrorType.MARKET_INCONSISTENCY:
      return {
        icon: Info,
        variant: 'default' as const,
        title: '市場整合性の警告',
        badgeText: '情報',
        badgeVariant: 'outline' as const,
        borderColor: 'blue-500',
        bgColor: 'blue-50',
        textColor: 'blue-700'
      }
    
    default:
      return {
        icon: AlertTriangle,
        variant: 'destructive' as const,
        title: 'エラー',
        badgeText: 'エラー',
        badgeVariant: 'destructive' as const,
        borderColor: 'destructive',
        bgColor: 'destructive/5',
        textColor: 'destructive'
      }
  }
}

function getFieldDisplayName(field: string): string {
  const fieldNames: Record<string, string> = {
    p0: '物件価格',
    i0: '初期費用',
    rentMonthly0: '月額家賃',
    monthlyOpex0: '月額運営費用',
    vacancy: '空室率',
    inflation: 'インフレ率',
    rentDecay: '家賃下落率',
    priceDecay: '物件価格下落率',
    taxAnnualFixed: '年間固定資産税',
    exitCostRate: '売却コスト率',
    years: '保有年数',
    discountAsset: '資産割引率',
    discountEquity: 'エクイティ割引率',
    loanAmount: '借入額',
    loanRate: '借入金利',
    loanTerm: '返済期間',
    prepayPenaltyRate: '期限前償還手数料率',
    irrAsset: '資産IRR',
    irrEquity: 'エクイティIRR',
    npvAsset: '資産NPV',
    npvEquity: 'エクイティNPV',
    implicitCap: '暗黙Cap率',
    cashFlows: 'キャッシュフロー',
    noi: 'NOI',
    salePrice: '売却価格'
  }
  
  return fieldNames[field] || field
}

function formatValue(value: unknown): string {
  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return value.toLocaleString()
    }
    return value.toFixed(4)
  }
  
  if (Array.isArray(value)) {
    return `配列 (${value.length}要素)`
  }
  
  return String(value)
}

function getErrorSuggestion(error: DCFError): string | null {
  switch (error.type) {
    case DCFErrorType.INVALID_INPUT:
      return '入力値を確認し、有効な数値を入力してください。'
    
    case DCFErrorType.BUSINESS_RULE_VIOLATION:
      if (error.field === 'loanAmount') {
        return '借入額を物件価格以下に調整してください。'
      }
      if (error.field === 'loanTerm') {
        return '返済期間を保有期間より長くするか、保有期間を延長することを検討してください。'
      }
      return '入力パラメータの組み合わせを見直してください。'
    
    case DCFErrorType.IRR_CALCULATION_FAILED:
      return 'キャッシュフローが適切でない可能性があります。初期投資額や収益の設定を見直してください。'
    
    case DCFErrorType.NUMERICAL_INSTABILITY:
      return 'パラメータの値が極端すぎる可能性があります。より現実的な値に調整してください。'
    
    case DCFErrorType.UNREALISTIC_RESULT:
      return '計算結果が非現実的です。入力パラメータを再確認してください。'
    
    case DCFErrorType.MARKET_INCONSISTENCY:
      return '市場の一般的な水準と比較して検討してください。'
    
    default:
      return null
  }
}
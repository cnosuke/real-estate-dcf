import { AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { DCFErrorType } from '@/lib/errors/types'

/**
 * エラータイプ別のUI設定（内部使用のみ）
 */
interface ErrorUIConfig {
  icon: React.ComponentType<{ className?: string }>
  variant: 'default' | 'destructive'
  title: string
  badgeText: string
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline'
  borderColor: string
  bgColor: string
  textColor: string
}

/**
 * エラータイプ別のUI設定マップ（内部使用のみ）
 */
const ERROR_UI_CONFIG: Record<DCFErrorType, ErrorUIConfig> = {
  [DCFErrorType.INVALID_INPUT]: {
    icon: AlertTriangle,
    variant: 'destructive',
    title: '入力エラー',
    badgeText: 'エラー',
    badgeVariant: 'destructive',
    borderColor: 'destructive',
    bgColor: 'destructive/5',
    textColor: 'destructive',
  },

  [DCFErrorType.BUSINESS_RULE_VIOLATION]: {
    icon: AlertCircle,
    variant: 'destructive',
    title: 'ビジネスルール違反',
    badgeText: '警告',
    badgeVariant: 'secondary',
    borderColor: 'orange-500',
    bgColor: 'orange-50',
    textColor: 'orange-700',
  },

  [DCFErrorType.IRR_CALCULATION_FAILED]: {
    icon: AlertTriangle,
    variant: 'destructive',
    title: 'IRR計算エラー',
    badgeText: 'エラー',
    badgeVariant: 'destructive',
    borderColor: 'destructive',
    bgColor: 'destructive/5',
    textColor: 'destructive',
  },

  [DCFErrorType.NUMERICAL_INSTABILITY]: {
    icon: AlertTriangle,
    variant: 'destructive',
    title: '数値計算エラー',
    badgeText: 'エラー',
    badgeVariant: 'destructive',
    borderColor: 'destructive',
    bgColor: 'destructive/5',
    textColor: 'destructive',
  },

  [DCFErrorType.UNREALISTIC_RESULT]: {
    icon: AlertCircle,
    variant: 'default',
    title: '計算結果の警告',
    badgeText: '注意',
    badgeVariant: 'secondary',
    borderColor: 'yellow-500',
    bgColor: 'yellow-50',
    textColor: 'yellow-700',
  },

  [DCFErrorType.MARKET_INCONSISTENCY]: {
    icon: Info,
    variant: 'default',
    title: '市場整合性の警告',
    badgeText: '情報',
    badgeVariant: 'outline',
    borderColor: 'blue-500',
    bgColor: 'blue-50',
    textColor: 'blue-700',
  },
}

/**
 * エラータイプ別のUI設定を取得
 */
export function getErrorUIConfig(type: DCFErrorType): ErrorUIConfig {
  return (
    ERROR_UI_CONFIG[type] || {
      icon: AlertTriangle,
      variant: 'destructive',
      title: 'エラー',
      badgeText: 'エラー',
      badgeVariant: 'destructive',
      borderColor: 'destructive',
      bgColor: 'destructive/5',
      textColor: 'destructive',
    }
  )
}

/**
 * エラーに対する対処方法の提案
 */
export function getErrorSuggestion(
  type: DCFErrorType,
  field?: string,
): string | null {
  switch (type) {
    case DCFErrorType.INVALID_INPUT:
      return '入力値を確認し、有効な数値を入力してください。'

    case DCFErrorType.BUSINESS_RULE_VIOLATION:
      if (field === 'loanAmount') {
        return '借入額を物件価格以下に調整してください。'
      }
      if (field === 'loanTerm') {
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

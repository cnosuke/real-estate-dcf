import React, { createContext, useContext, ReactNode, useState } from 'react'
import type { DCFError } from '@/lib/error-utils'

interface ValidationDisplayContextValue {
  // 表示状態
  showValidationSummary: boolean
  setShowValidationSummary: (show: boolean) => void
  
  // エラー表示設定
  showFieldErrors: boolean
  setShowFieldErrors: (show: boolean) => void
  
  // 警告表示設定
  showWarnings: boolean
  setShowWarnings: (show: boolean) => void
  
  // エラーの重要度フィルタリング
  errorSeverityFilter: 'all' | 'error' | 'warning'
  setErrorSeverityFilter: (filter: 'all' | 'error' | 'warning') => void
  
  // エラー表示フォーマット
  errorDisplayFormat: 'compact' | 'detailed'
  setErrorDisplayFormat: (format: 'compact' | 'detailed') => void
}

const ValidationDisplayContext = createContext<ValidationDisplayContextValue | null>(null)

interface ValidationDisplayProviderProps {
  children: ReactNode
  defaultShowSummary?: boolean
  defaultShowFieldErrors?: boolean
  defaultShowWarnings?: boolean
}

export function ValidationDisplayProvider({ 
  children, 
  defaultShowSummary = true,
  defaultShowFieldErrors = true,
  defaultShowWarnings = true
}: ValidationDisplayProviderProps) {
  const [showValidationSummary, setShowValidationSummary] = useState(defaultShowSummary)
  const [showFieldErrors, setShowFieldErrors] = useState(defaultShowFieldErrors)
  const [showWarnings, setShowWarnings] = useState(defaultShowWarnings)
  const [errorSeverityFilter, setErrorSeverityFilter] = useState<'all' | 'error' | 'warning'>('all')
  const [errorDisplayFormat, setErrorDisplayFormat] = useState<'compact' | 'detailed'>('compact')

  const contextValue: ValidationDisplayContextValue = {
    showValidationSummary,
    setShowValidationSummary,
    showFieldErrors,
    setShowFieldErrors,
    showWarnings,
    setShowWarnings,
    errorSeverityFilter,
    setErrorSeverityFilter,
    errorDisplayFormat,
    setErrorDisplayFormat
  }

  return (
    <ValidationDisplayContext.Provider value={contextValue}>
      {children}
    </ValidationDisplayContext.Provider>
  )
}

export function useValidationDisplay(): ValidationDisplayContextValue {
  const context = useContext(ValidationDisplayContext)
  if (!context) {
    throw new Error('useValidationDisplay must be used within a ValidationDisplayProvider')
  }
  return context
}
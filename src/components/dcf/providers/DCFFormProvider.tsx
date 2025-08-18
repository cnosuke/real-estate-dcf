import React, { createContext, useContext, ReactNode } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { 
  dcfInputAtom, 
  updateDCFInputAtom
} from '@/atoms/calculation/dcf-input'
import {
  inputErrorsAtom,
  inputWarningsAtom,
  hasInputErrorsAtom,
  hasInputWarningsAtom
} from '@/atoms/ui/validation'
import {
  executeDCFCalculationAtom,
  isCalculatingAtom,
  autoCalculateDCFAtom
} from '@/atoms/calculation/dcf-output'
import type { Input } from '@/types/dcf'
import type { DCFError } from '@/lib/error-utils'

interface DCFFormContextValue {
  // 入力値管理
  input: Input
  updateInput: (updates: Partial<Input>) => void
  
  // バリデーション状態
  errors: DCFError[]
  warnings: DCFError[]
  hasErrors: boolean
  hasWarnings: boolean
  
  // 計算処理
  executeCalculation: () => void
  isCalculating: boolean
  
  // フィールド固有のメソッド
  getFieldError: (fieldName: string) => DCFError | undefined
  hasFieldError: (fieldName: string) => boolean
}

const DCFFormContext = createContext<DCFFormContextValue | null>(null)

interface DCFFormProviderProps {
  children: ReactNode
  autoCalculate?: boolean
}

export function DCFFormProvider({ children, autoCalculate = true }: DCFFormProviderProps) {
  const input = useAtomValue(dcfInputAtom)
  const updateInput = useSetAtom(updateDCFInputAtom)
  const errors = useAtomValue(inputErrorsAtom)
  const warnings = useAtomValue(inputWarningsAtom)
  const hasErrors = useAtomValue(hasInputErrorsAtom)
  const hasWarnings = useAtomValue(hasInputWarningsAtom)
  const executeCalculation = useSetAtom(executeDCFCalculationAtom)
  const isCalculating = useAtomValue(isCalculatingAtom)
  // 自動計算の設定 - 入力が変更された時に自動実行
  React.useEffect(() => {
    if (autoCalculate && !hasErrors) {
      executeCalculation()
    }
  }, [input, hasErrors, autoCalculate, executeCalculation])

  const getFieldError = React.useCallback((fieldName: string): DCFError | undefined => {
    return errors.find(error => error.context?.field === fieldName)
  }, [errors])

  const hasFieldError = React.useCallback((fieldName: string): boolean => {
    return getFieldError(fieldName) !== undefined
  }, [getFieldError])

  const contextValue: DCFFormContextValue = {
    input,
    updateInput,
    errors,
    warnings,
    hasErrors,
    hasWarnings,
    executeCalculation,
    isCalculating,
    getFieldError,
    hasFieldError
  }

  return (
    <DCFFormContext.Provider value={contextValue}>
      {children}
    </DCFFormContext.Provider>
  )
}

export function useDCFForm(): DCFFormContextValue {
  const context = useContext(DCFFormContext)
  if (!context) {
    throw new Error('useDCFForm must be used within a DCFFormProvider')
  }
  return context
}
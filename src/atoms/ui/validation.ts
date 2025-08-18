import { atom } from 'jotai'
import { DCFValidator } from '@/lib/dcf/dcf-validator'
import { dcfInputAtom } from '../calculation/dcf-input'
import type { DCFError } from '@/lib/error-utils'

// バリデーション結果のキャッシュ
export const inputValidationAtom = atom((get) => {
  const input = get(dcfInputAtom)
  return DCFValidator.validateInput(input)
})

export const businessRulesValidationAtom = atom((get) => {
  const input = get(dcfInputAtom)
  const inputValidation = get(inputValidationAtom)
  
  if (!inputValidation.isValid) {
    return { isValid: true, errors: [], warnings: [] }
  }
  
  return DCFValidator.validateBusinessRules(input)
})

// バリデーション結果の便利なselector
export const inputErrorsAtom = atom((get) => {
  const inputValidation = get(inputValidationAtom)
  const businessValidation = get(businessRulesValidationAtom)
  
  return [...inputValidation.errors, ...businessValidation.errors]
})

export const inputWarningsAtom = atom((get) => {
  const businessValidation = get(businessRulesValidationAtom)
  return businessValidation.warnings
})

export const hasInputErrorsAtom = atom((get) => {
  const errors = get(inputErrorsAtom)
  return errors.length > 0
})

export const hasInputWarningsAtom = atom((get) => {
  const warnings = get(inputWarningsAtom)
  return warnings.length > 0
})

// フィールド別のエラー取得
export const getFieldErrorAtom = atom((get) => (fieldName: string): DCFError | undefined => {
  const errors = get(inputErrorsAtom)
  return errors.find(error => error.context?.field === fieldName)
})

// フィールド別の警告取得
export const getFieldWarningAtom = atom((get) => (fieldName: string): DCFError | undefined => {
  const warnings = get(inputWarningsAtom)
  return warnings.find(warning => warning.context?.field === fieldName)
})

// 複数フィールドのエラー状態（フォーム全体の状態管理）
export const fieldErrorsMapAtom = atom((get) => {
  const errors = get(inputErrorsAtom)
  const errorMap = new Map<string, DCFError>()
  
  errors.forEach(error => {
    if (error.context?.field) {
      errorMap.set(error.context.field, error)
    }
  })
  
  return errorMap
})

export const fieldWarningsMapAtom = atom((get) => {
  const warnings = get(inputWarningsAtom)
  const warningMap = new Map<string, DCFError>()
  
  warnings.forEach(warning => {
    if (warning.context?.field) {
      warningMap.set(warning.context.field, warning)
    }
  })
  
  return warningMap
})

// バリデーション状態サマリー
export const validationSummaryAtom = atom((get) => {
  const inputErrors = get(inputErrorsAtom)
  const inputWarnings = get(inputWarningsAtom)
  const inputValidation = get(inputValidationAtom)
  const businessValidation = get(businessRulesValidationAtom)
  
  return {
    isValid: inputErrors.length === 0,
    errorCount: inputErrors.length,
    warningCount: inputWarnings.length,
    hasInputErrors: !inputValidation.isValid,
    hasBusinessRuleErrors: !businessValidation.isValid,
    canCalculate: inputErrors.length === 0
  }
})
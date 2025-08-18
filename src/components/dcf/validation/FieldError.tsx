import React from 'react'
import { AlertCircle } from 'lucide-react'
import { useDCFForm } from '../providers/DCFFormProvider'
import { useValidationDisplay } from '../providers/ValidationDisplayProvider'

interface FieldErrorProps {
  fieldName: string
  className?: string
}

export function FieldError({ fieldName, className }: FieldErrorProps) {
  const { getFieldError, hasFieldError } = useDCFForm()
  const { showFieldErrors } = useValidationDisplay()

  if (!showFieldErrors || !hasFieldError(fieldName)) {
    return null
  }

  const error = getFieldError(fieldName)
  if (!error) return null

  return (
    <div className={`flex items-center gap-1 text-sm text-destructive ${className || ''}`}>
      <AlertCircle className="h-3 w-3" />
      <span>{error.getUserMessage()}</span>
    </div>
  )
}

// 便利なHOC（Higher Order Component）
interface WithFieldErrorProps {
  fieldName: string
  children: React.ReactNode
}

export function WithFieldError({ fieldName, children }: WithFieldErrorProps) {
  const { hasFieldError } = useDCFForm()
  const hasError = hasFieldError(fieldName)

  return (
    <div className="space-y-1">
      <div className={hasError ? 'border-destructive' : ''}>
        {children}
      </div>
      <FieldError fieldName={fieldName} />
    </div>
  )
}
import React from 'react'
import { AlertCircle } from 'lucide-react'
import { DCFError } from '@/lib/errors/types'

interface FieldErrorProps {
  error?: DCFError
  className?: string
  show?: boolean
}

export function FieldError({ error, className, show = true }: FieldErrorProps) {
  if (!show || !error) {
    return null
  }

  return (
    <div className={`flex items-center gap-1 text-sm text-destructive ${className || ''}`}>
      <AlertCircle className="h-3 w-3" />
      <span>{error.getUserMessage()}</span>
    </div>
  )
}

interface WithFieldErrorProps {
  error?: DCFError
  children: React.ReactNode
  showError?: boolean
}

export function WithFieldError({ error, children, showError = true }: WithFieldErrorProps) {
  const hasError = !!error

  return (
    <div className="space-y-1">
      <div className={hasError ? 'border-destructive' : ''}>
        {children}
      </div>
      <FieldError error={error} show={showError} />
    </div>
  )
}
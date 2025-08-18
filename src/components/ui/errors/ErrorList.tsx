import React from 'react'
import type { DCFError } from '@/lib/errors/types'
import { ErrorCard } from './ErrorCard'

interface ErrorListProps {
  errors: DCFError[]
  warnings?: DCFError[]
  onDismissError?: (index: number) => void
  onDismissWarning?: (index: number) => void
  compact?: boolean
  showDetails?: boolean
}

export function ErrorList({
  errors,
  warnings = [],
  onDismissError,
  onDismissWarning,
  compact = true,
  showDetails = false,
}: ErrorListProps) {
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(
    new Set(),
  )

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  if (errors.length === 0 && warnings.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {errors.map((error, index) => {
        const key = `error-${error.type}-${error.context?.field || 'global'}-${index}`
        return (
          <ErrorCard
            key={key}
            error={error}
            onDismiss={onDismissError ? () => onDismissError(index) : undefined}
            compact={compact}
            showDetails={showDetails}
            isExpanded={expandedItems.has(key)}
            onToggleExpanded={() => toggleExpanded(key)}
          />
        )
      })}

      {warnings.map((warning, index) => {
        const key = `warning-${warning.type}-${warning.context?.field || 'global'}-${index}`
        return (
          <ErrorCard
            key={key}
            error={warning}
            onDismiss={
              onDismissWarning ? () => onDismissWarning(index) : undefined
            }
            compact={compact}
            showDetails={showDetails}
            isExpanded={expandedItems.has(key)}
            onToggleExpanded={() => toggleExpanded(key)}
          />
        )
      })}
    </div>
  )
}

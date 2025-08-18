import React from 'react'
import { DCFError } from '@/lib/errors/types'
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
  showDetails = false
}: ErrorListProps) {
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set())

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
      {errors.map((error, index) => (
        <ErrorCard
          key={`error-${index}`}
          error={error}
          onDismiss={onDismissError ? () => onDismissError(index) : undefined}
          compact={compact}
          showDetails={showDetails}
          isExpanded={expandedItems.has(`error-${index}`)}
          onToggleExpanded={() => toggleExpanded(`error-${index}`)}
        />
      ))}
      
      {warnings.map((warning, index) => (
        <ErrorCard
          key={`warning-${index}`}
          error={warning}
          onDismiss={onDismissWarning ? () => onDismissWarning(index) : undefined}
          compact={compact}
          showDetails={showDetails}
          isExpanded={expandedItems.has(`warning-${index}`)}
          onToggleExpanded={() => toggleExpanded(`warning-${index}`)}
        />
      ))}
    </div>
  )
}
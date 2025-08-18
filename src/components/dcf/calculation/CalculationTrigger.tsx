import React from 'react'
import { Button } from '@/components/ui/button'
import { Calculator, Loader2 } from 'lucide-react'
import { useDCFForm } from '../providers/DCFFormProvider'

interface CalculationTriggerProps {
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  children?: React.ReactNode
}

export function CalculationTrigger({ 
  variant = 'default', 
  size = 'default',
  className,
  children 
}: CalculationTriggerProps) {
  const { executeCalculation, isCalculating, hasErrors } = useDCFForm()

  return (
    <Button
      variant={variant}
      size={size}
      onClick={executeCalculation}
      disabled={isCalculating || hasErrors}
      className={className}
    >
      {isCalculating ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Calculator className="mr-2 h-4 w-4" />
      )}
      {children || (isCalculating ? '計算中...' : 'DCF計算実行')}
    </Button>
  )
}
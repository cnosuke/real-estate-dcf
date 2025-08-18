import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { DCFInputFormHeader } from './DCFInputFormHeader'
import { WarningDisplay } from './warnings/WarningDisplay'
import { PropertyBasicSection } from './sections/PropertyBasicSection'
import { MarketRiskSection } from './sections/MarketRiskSection'
import { LoanSection } from './sections/LoanSection'
import { HoldingSaleSection } from './sections/HoldingSaleSection'
import { AdvancedSettingsSection } from './sections/AdvancedSettingsSection'
import { DCFFormProvider } from './providers/DCFFormProvider'
import { ValidationDisplayProvider } from './providers/ValidationDisplayProvider'
import { useDCFForm } from './providers/DCFFormProvider'

export function DCFInputForm() {
  return (
    <DCFFormProvider autoCalculate={true}>
      <ValidationDisplayProvider>
        <DCFInputFormContent />
      </ValidationDisplayProvider>
    </DCFFormProvider>
  )
}

function DCFInputFormContent() {
  const { errors, warnings } = useDCFForm()

  return (
    <Card>
      <DCFInputFormHeader />
      <CardContent className="space-y-8">
        {/* 警告・エラー表示 */}
        <WarningDisplay 
          warnings={warnings}
          errors={errors}
          showDetails={true}
        />
        <Separator />


        {/* 入力セクション */}
        <PropertyBasicSection />
        <MarketRiskSection />
        <LoanSection />
        <HoldingSaleSection />
        <AdvancedSettingsSection />
      </CardContent>
    </Card>
  )
}
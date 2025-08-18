import { Card, CardContent } from '@/components/ui/card'
import { DCFInputFormHeader } from './DCFInputFormHeader'
import { DCFFormProvider } from './providers/DCFFormProvider'
import { ValidationDisplayProvider } from './providers/ValidationDisplayProvider'
import { AdvancedSettingsSection } from './sections/AdvancedSettingsSection'
import { HoldingSaleSection } from './sections/HoldingSaleSection'
import { LoanSection } from './sections/LoanSection'
import { MarketRiskSection } from './sections/MarketRiskSection'
import { PropertyBasicSection } from './sections/PropertyBasicSection'

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
  return (
    <Card>
      <DCFInputFormHeader />
      <CardContent className="space-y-8">
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

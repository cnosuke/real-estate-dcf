import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { DCFInputFormHeader } from './DCFInputFormHeader'
import { AdvancedSettingsSection } from './sections/AdvancedSettingsSection'
import { HoldingSaleSection } from './sections/HoldingSaleSection'
import { LoanSection } from './sections/LoanSection'
import { MarketRiskSection } from './sections/MarketRiskSection'
import { PropertyBasicSection } from './sections/PropertyBasicSection'

export function DCFInputForm() {
  return (
    <Card>
      <DCFInputFormHeader />
      <CardContent className="space-y-8">
        <PropertyBasicSection />

        <Separator />

        <HoldingSaleSection />

        <Separator />

        <MarketRiskSection />

        <Separator />

        <LoanSection />

        <Separator />

        <AdvancedSettingsSection />
      </CardContent>
    </Card>
  )
}

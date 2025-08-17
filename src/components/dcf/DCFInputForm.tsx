import { useAtomValue } from 'jotai'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { DCFInputFormHeader } from './DCFInputFormHeader'
import { AdvancedSettingsSection } from './sections/AdvancedSettingsSection'
import { HoldingSaleSection } from './sections/HoldingSaleSection'
import { LoanSection } from './sections/LoanSection'
import { MarketRiskSection } from './sections/MarketRiskSection'
import { PropertyBasicSection } from './sections/PropertyBasicSection'
import { ErrorList } from '@/components/common/ErrorDisplay'
import { dcfInputAtom } from '@/atoms/dcf-input-atoms'
import { validateBusinessRules, DCFError, DCFErrorType } from '@/lib/error-utils'
import { validateInput } from '@/lib/type-guards'

export function DCFInputForm() {
  const input = useAtomValue(dcfInputAtom)
  
  // Validate input and business rules
  const inputValidation = validateInput(input)
  const businessValidation = inputValidation.isValid 
    ? validateBusinessRules(inputValidation.value!) 
    : { isValid: true, errors: [], warnings: [] }
  
  const inputErrors = inputValidation.isValid ? [] : inputValidation.errors.map(e => {
    // Convert validation errors to DCF errors for display
    const dcfError = new DCFError(
      DCFErrorType.INVALID_INPUT,
      e.message,
      e.field,
      e.value
    )
    return dcfError
  })
  
  const businessErrors = businessValidation.errors
  const businessWarnings = businessValidation.warnings
  
  const allErrors = [...inputErrors, ...businessErrors]
  const hasValidationIssues = allErrors.length > 0 || businessWarnings.length > 0
  
  return (
    <Card>
      <DCFInputFormHeader />
      <CardContent className="space-y-8">
        {/* Show validation issues at the top */}
        {hasValidationIssues && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">入力チェック</h3>
            <ErrorList 
              errors={allErrors}
              warnings={businessWarnings}
              compact={true}
            />
          </div>
        )}
        
        {hasValidationIssues && <Separator />}

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
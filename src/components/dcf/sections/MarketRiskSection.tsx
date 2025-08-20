import { useAtomValue, useSetAtom } from 'jotai'
import { ChevronDown } from 'lucide-react'
import { marketRiskSectionExpandedAtom, toggleSectionAtom } from '@/atoms/ui'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { getSectionHelpText } from '@/lib/help-texts'
import { useDCFForm } from '../providers/DCFFormProvider'
import { InputField } from '../shared/InputField'

export function MarketRiskSection() {
  const { input } = useDCFForm()
  const isExpanded = useAtomValue(marketRiskSectionExpandedAtom)
  const toggleSection = useSetAtom(toggleSectionAtom)

  const sectionHelp = getSectionHelpText('marketRisk')

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={() => toggleSection('marketRisk')}
    >
      <Card className="shadow-sm">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-orange-50 py-2 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
            <CardTitle className="flex items-center justify-between text-sm text-orange-800">
              <div className="flex items-center gap-2">
                {sectionHelp.title}
                <HelpTooltip
                  title={sectionHelp.title}
                  content={`${sectionHelp.description}\n\n${sectionHelp.detail}`}
                />
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </CardTitle>
            <CardDescription className="text-xs">{sectionHelp.description}</CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-2 py-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              <InputField
                fieldName="vacancy"
                label="空室率"
                value={input.vacancy}
                onChange={(_value) => {}}
                type="percentage"
                step={0.01}
              />
              <InputField
                fieldName="inflation"
                label="インフレ率"
                value={input.inflation}
                onChange={(_value) => {}}
                type="percentage"
                step={0.001}
              />
              <InputField
                fieldName="rentDecay"
                label="家賃逓減率"
                value={input.rentDecay}
                onChange={(_value) => {}}
                type="percentage"
                step={0.001}
              />
              <InputField
                fieldName="priceDecay"
                label="価格逓減率"
                value={input.priceDecay}
                onChange={(_value) => {}}
                type="percentage"
                step={0.001}
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

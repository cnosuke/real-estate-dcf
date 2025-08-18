import { useAtomValue, useSetAtom } from 'jotai'
import { ChevronDown } from 'lucide-react'
import React from 'react'
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
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50">
            <CardTitle className="flex items-center justify-between">
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
            <CardDescription>{sectionHelp.description}</CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                fieldName="vacancy"
                label="空室率"
                value={input.vacancy}
                onChange={(value) => {}}
                type="percentage"
                step={0.01}
              />
              <InputField
                fieldName="inflation"
                label="インフレ率"
                value={input.inflation}
                onChange={(value) => {}}
                type="percentage"
                step={0.001}
              />
              <InputField
                fieldName="rentDecay"
                label="家賃逓減率"
                value={input.rentDecay}
                onChange={(value) => {}}
                type="percentage"
                step={0.001}
              />
              <InputField
                fieldName="priceDecay"
                label="価格逓減率"
                value={input.priceDecay}
                onChange={(value) => {}}
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

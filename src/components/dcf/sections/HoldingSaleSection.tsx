import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { InputField } from '../shared/InputField'
import { useDCFForm } from '../providers/DCFFormProvider'
import { useAtomValue, useSetAtom } from 'jotai'
import { holdingSaleSectionExpandedAtom, toggleSectionAtom } from '@/atoms/ui'
import { getSectionHelpText } from '@/lib/help-texts'
import { HelpTooltip } from '@/components/ui/help-tooltip'

export function HoldingSaleSection() {
  const { input } = useDCFForm()
  const isExpanded = useAtomValue(holdingSaleSectionExpandedAtom)
  const toggleSection = useSetAtom(toggleSectionAtom)
  
  const sectionHelp = getSectionHelpText('holdingSale')

  return (
    <Collapsible open={isExpanded} onOpenChange={() => toggleSection('holdingSale')}>
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
              <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </CardTitle>
            <CardDescription>{sectionHelp.description}</CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                fieldName="years"
                label="保有年数"
                value={input.years}
                onChange={(value) => {}}
                step={1}
                min={1}
                unit="年"
              />
              <InputField
                fieldName="exitCostRate"
                label="売却コスト率"
                value={input.exitCostRate}
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

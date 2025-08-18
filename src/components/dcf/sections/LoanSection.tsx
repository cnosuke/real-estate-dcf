import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { InputField } from '../shared/InputField'
import { useDCFForm } from '../providers/DCFFormProvider'
import { useAtomValue, useSetAtom } from 'jotai'
import { loanSectionExpandedAtom, toggleSectionAtom } from '@/atoms/ui'
import { getSectionHelpText } from '@/lib/help-texts'
import { HelpTooltip } from '@/components/ui/help-tooltip'

export function LoanSection() {
  const { input } = useDCFForm()
  const isExpanded = useAtomValue(loanSectionExpandedAtom)
  const toggleSection = useSetAtom(toggleSectionAtom)
  
  const sectionHelp = getSectionHelpText('loan')

  return (
    <Collapsible open={isExpanded} onOpenChange={() => toggleSection('loan')}>
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
                fieldName="loanAmount"
                label="借入額"
                value={input.loanAmount}
                onChange={() => {}}
                step={1000000}
                unit="円"
              />
              <InputField
                fieldName="loanRate"
                label="借入金利"
                value={input.loanRate}
                onChange={() => {}}
                type="percentage"
                step={0.001}
              />
              <InputField
                fieldName="loanTerm"
                label="返済年数"
                value={input.loanTerm}
                onChange={() => {}}
                step={1}
                min={1}
                unit="年"
              />
              <InputField
                fieldName="prepayPenaltyRate"
                label="繰上償還ペナルティ率"
                value={input.prepayPenaltyRate}
                onChange={() => {}}
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

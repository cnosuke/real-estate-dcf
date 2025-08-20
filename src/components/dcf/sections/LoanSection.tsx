import { useAtomValue, useSetAtom } from 'jotai'
import { ChevronDown } from 'lucide-react'
import { loanSectionExpandedAtom, toggleSectionAtom } from '@/atoms/ui'
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

export function LoanSection() {
  const { input } = useDCFForm()
  const isExpanded = useAtomValue(loanSectionExpandedAtom)
  const toggleSection = useSetAtom(toggleSectionAtom)

  const sectionHelp = getSectionHelpText('loan')

  return (
    <Collapsible open={isExpanded} onOpenChange={() => toggleSection('loan')}>
      <Card className="shadow-sm">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-green-50 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
            <CardTitle className="flex items-center justify-between text-sm text-green-800">
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
                value={input.prepayPenaltyRate ?? 0}
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

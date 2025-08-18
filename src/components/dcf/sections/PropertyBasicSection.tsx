import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { InputField } from '../shared/InputField'
import { useDCFForm } from '../providers/DCFFormProvider'
import { useAtomValue, useSetAtom } from 'jotai'
import { propertyBasicSectionExpandedAtom, toggleSectionAtom } from '@/atoms/ui'
import { getSectionHelpText } from '@/lib/help-texts'
import { HelpTooltip } from '@/components/ui/help-tooltip'

export function PropertyBasicSection() {
  const { input } = useDCFForm()
  const isExpanded = useAtomValue(propertyBasicSectionExpandedAtom)
  const toggleSection = useSetAtom(toggleSectionAtom)
  
  const sectionHelp = getSectionHelpText('propertyBasic')

  return (
    <Collapsible open={isExpanded} onOpenChange={() => toggleSection('propertyBasic')}>
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
                fieldName="p0"
                label="物件価格"
                value={input.p0}
                onChange={(value) => {}} // 内部でupdateInputが呼ばれる
                step={1000000}
                unit="円"
              />
              <InputField
                fieldName="i0"
                label="初期諸費用"
                value={input.i0}
                onChange={(value) => {}}
                step={100000}
                unit="円"
              />
              <InputField
                fieldName="rentMonthly0"
                label="月額家賃"
                value={input.rentMonthly0}
                onChange={(value) => {}}
                step={10000}
                unit="円"
              />
              <InputField
                fieldName="monthlyOpex0"
                label="月額運営費"
                value={input.monthlyOpex0}
                onChange={(value) => {}}
                step={5000}
                unit="円"
              />
              <InputField
                fieldName="taxAnnualFixed"
                label="年間固定資産税"
                value={input.taxAnnualFixed}
                onChange={(value) => {}}
                step={10000}
                unit="円"
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

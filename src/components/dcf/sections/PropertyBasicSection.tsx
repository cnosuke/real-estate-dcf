import { useAtomValue, useSetAtom } from 'jotai'
import { ChevronDown } from 'lucide-react'
import { propertyBasicSectionExpandedAtom, toggleSectionAtom } from '@/atoms/ui'
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

export function PropertyBasicSection() {
  const { input } = useDCFForm()
  const isExpanded = useAtomValue(propertyBasicSectionExpandedAtom)
  const toggleSection = useSetAtom(toggleSectionAtom)

  const sectionHelp = getSectionHelpText('propertyBasic')

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={() => toggleSection('propertyBasic')}
    >
      <Card className="shadow-sm">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-blue-50 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
            <CardTitle className="flex items-center justify-between text-sm text-blue-800">
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
                fieldName="p0"
                label="物件価格"
                value={input.p0}
                onChange={(_value) => {}} // 内部でupdateInputが呼ばれる
                step={1000000}
                unit="円"
              />
              <InputField
                fieldName="i0"
                label="初期諸費用"
                value={input.i0}
                onChange={(_value) => {}}
                step={100000}
                unit="円"
              />
              <InputField
                fieldName="rentMonthly0"
                label="月額家賃"
                value={input.rentMonthly0}
                onChange={(_value) => {}}
                step={10000}
                unit="円"
              />
              <InputField
                fieldName="monthlyOpex0"
                label="月額運営費"
                value={input.monthlyOpex0}
                onChange={(_value) => {}}
                step={5000}
                unit="円"
              />
              <InputField
                fieldName="taxAnnualFixed"
                label="年間固定資産税"
                value={input.taxAnnualFixed}
                onChange={(_value) => {}}
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

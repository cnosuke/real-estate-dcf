import { useAtomValue, useSetAtom } from 'jotai'
import { ChevronDown } from 'lucide-react'
import {
  advancedSettingsSectionExpandedAtom,
  toggleSectionAtom,
} from '@/atoms/ui'
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

export function AdvancedSettingsSection() {
  const { input } = useDCFForm()
  const isExpanded = useAtomValue(advancedSettingsSectionExpandedAtom)
  const toggleSection = useSetAtom(toggleSectionAtom)

  const sectionHelp = getSectionHelpText('advanced')

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={() => toggleSection('advancedSettings')}
    >
      <Card className='shadow-sm'>
        <CollapsibleTrigger asChild>
          <CardHeader className='cursor-pointer hover:bg-indigo-50 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100'>
            <CardTitle className='flex items-center justify-between text-sm text-indigo-800'>
              <div className='flex items-center gap-2'>
                {sectionHelp.title}
                <HelpTooltip
                  title={sectionHelp.title}
                  content={`${sectionHelp.description}\n\n${sectionHelp.detail}`}
                />
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </CardTitle>
            <CardDescription className='text-xs'>
              {sectionHelp.description}
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className='space-y-2 py-3'>
            <div className='bg-gradient-to-br from-indigo-50 to-blue-100 p-3 rounded-lg border border-indigo-200'>
              <div className='mb-3'>
                <h4 className='text-sm font-medium text-indigo-800'>
                  比較基準利回り設定
                </h4>
                <p className='text-xs text-indigo-700 mt-1 leading-relaxed'>
                  「この利回りを上回れば良い投資」という基準を設定します。
                  実際の投資利回り（IRR）がこの基準を上回っているかを判定に使用します。
                </p>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2'>
                <InputField
                  fieldName='discountAsset'
                  label='資産基準利回り'
                  value={input.discountAsset}
                  onChange={(_value) => {}}
                  type='percentage'
                  step={1}
                />
                <InputField
                  fieldName='discountEquity'
                  label='自己資金基準利回り'
                  value={input.discountEquity}
                  onChange={(_value) => {}}
                  type='percentage'
                  step={1}
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

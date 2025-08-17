import { useAtom } from 'jotai'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { discountAssetAtom, discountEquityAtom } from '@/atoms/dcf-input-atoms'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { formatPercent, InputField } from '../shared/InputField'

export function AdvancedSettingsSection() {
  const [isOpen, setIsOpen] = useState(false)
  const [discountAsset, setDiscountAsset] = useAtom(discountAssetAtom)
  const [discountEquity, setDiscountEquity] = useAtom(discountEquityAtom)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-0 h-auto hover:bg-transparent"
        >
          <div className="text-left">
            <h3 className="text-lg font-medium">詳細設定</h3>
            <p className="text-sm text-muted-foreground mt-1">
              比較基準利回りやその他の上級者向けパラメータ
            </p>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 mt-4">
        <div className="bg-blue-50/30 p-4 rounded-lg border">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-blue-900">
              比較基準利回り設定
            </h4>
            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
              「この利回りを上回れば良い投資」という基準を設定します。
              実際の投資利回り（IRR）がこの基準を上回っているかを判定に使用します。
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="資産基準利回り"
              value={discountAsset}
              onChange={setDiscountAsset}
              step="0.001"
              helpText="物件全体（借入なし）の基準利回りです。似たような物件の表利回り、国債利回り+リスクプレミアム、投資用ローン金利などを参考に設定します。住宅系では4-7%が目安です。"
              formatDisplay={`現在: ${formatPercent(discountAsset)}`}
            />
            <InputField
              label="自己資金基準利回り"
              value={discountEquity}
              onChange={setDiscountEquity}
              step="0.001"
              helpText="自己資金投資の基準利回りです。ローンを使うとリスクが高まるため、資産基準利回りより高めに設定します。株式投資や他の投資と比較して「最低でもこれくらいは欲しい」という利回りを設定してください。"
              formatDisplay={`現在: ${formatPercent(discountEquity)}`}
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

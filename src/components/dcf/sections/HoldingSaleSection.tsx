import { useAtom } from 'jotai'
import { exitCostRateAtom, yearsAtom } from '@/atoms/dcf-input-atoms'
import { formatPercent, InputField } from '../shared/InputField'

export function HoldingSaleSection() {
  const [years, setYears] = useAtom(yearsAtom)
  const [exitCostRate, setExitCostRate] = useAtom(exitCostRateAtom)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">保有・売却条件</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="保有年数"
          value={years}
          onChange={setYears}
          step="1"
          min="1"
          helpText="不動産を保有する期間です。この期間経過後に物件を売却することを前提として、NPV・IRRを計算します。一般的には5-10年で設定することが多いです。"
          formatDisplay={`現在: ${years}年`}
        />
        <InputField
          label="売却コスト率"
          value={exitCostRate}
          onChange={setExitCostRate}
          step="0.001"
          helpText="物件売却時に発生する費用の割合です。仲介手数料（3%+6万円）、登記費用、印紙税等が含まれます。売却価格に対して4-6%程度が一般的です。"
          formatDisplay={`現在: ${formatPercent(exitCostRate)}`}
        />
      </div>
    </div>
  )
}

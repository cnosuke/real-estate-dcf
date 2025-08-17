import { useAtom } from 'jotai'
import {
  inflationAtom,
  priceDecayAtom,
  rentDecayAtom,
  vacancyAtom,
} from '@/atoms/dcf-input-atoms'
import { formatPercent, InputField } from '../shared/InputField'

export function MarketRiskSection() {
  const [vacancy, setVacancy] = useAtom(vacancyAtom)
  const [inflation, setInflation] = useAtom(inflationAtom)
  const [rentDecay, setRentDecay] = useAtom(rentDecayAtom)
  const [priceDecay, setPriceDecay] = useAtom(priceDecayAtom)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">市場・リスク前提</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="空室率"
          value={vacancy}
          onChange={setVacancy}
          step="0.01"
          helpText="賃貸期間中の平均空室率です。入居者退去による空室期間や、賃料減額リスクを考慮します。住宅の場合5-10%、商業用不動産では10-15%程度が一般的です。0.05は5%を意味します。"
          formatDisplay={`現在: ${formatPercent(vacancy)}`}
        />
        <InputField
          label="インフレ率"
          value={inflation}
          onChange={setInflation}
          step="0.001"
          helpText="物価上昇率です。運営費用（修繕積立金等）が毎年この率で上昇することを想定します。日本では1-2%程度で設定することが多いです。0.02は2%を意味します。"
          formatDisplay={`現在: ${formatPercent(inflation)}`}
        />
        <InputField
          label="家賃逓減率"
          value={rentDecay}
          onChange={setRentDecay}
          step="0.001"
          helpText="建物の経年劣化による賃料下落率です。毎年この率で家賃が下落することを想定します。住宅では年1-2%程度が一般的です。立地や物件グレードにより大きく変動します。"
          formatDisplay={`現在: ${formatPercent(rentDecay)}`}
        />
        <InputField
          label="価格逓減率"
          value={priceDecay}
          onChange={setPriceDecay}
          step="0.001"
          helpText="建物の減価償却による物件価値の下落率です。売却価格の算定に使用されます。RC造では年1-2%、木造では年3-5%程度が目安となります。立地要因も考慮してください。"
          formatDisplay={`現在: ${formatPercent(priceDecay)}`}
        />
      </div>
    </div>
  )
}

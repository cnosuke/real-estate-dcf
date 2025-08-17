import { useAtom } from 'jotai'
import {
  i0Atom,
  monthlyOpex0Atom,
  p0Atom,
  rentMonthly0Atom,
  taxAnnualFixedAtom,
} from '@/atoms/dcf-input-atoms'
import { formatNumber, InputField } from '../shared/InputField'

export function PropertyBasicSection() {
  const [p0, setP0] = useAtom(p0Atom)
  const [i0, setI0] = useAtom(i0Atom)
  const [rentMonthly0, setRentMonthly0] = useAtom(rentMonthly0Atom)
  const [monthlyOpex0, setMonthlyOpex0] = useAtom(monthlyOpex0Atom)
  const [taxAnnualFixed, setTaxAnnualFixed] = useAtom(taxAnnualFixedAtom)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">物件基本情報</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="物件価格"
          value={p0}
          onChange={setP0}
          step="1000000"
          helpText="不動産の取得価格です。消費税・取得税等は含みません。土地・建物の合計価格を入力してください。"
          formatDisplay={`現在: ${formatNumber(p0)}円`}
        />
        <InputField
          label="初期諸費用"
          value={i0}
          onChange={setI0}
          step="100000"
          helpText="物件取得時に発生する諸費用です。登記費用、仲介手数料、司法書士報酬、印紙税、不動産取得税等が含まれます。物件価格の3-8%程度が目安です。"
          formatDisplay={`現在: ${formatNumber(i0)}円`}
        />
        <InputField
          label="初期月額家賃"
          value={rentMonthly0}
          onChange={setRentMonthly0}
          step="10000"
          helpText="賃貸開始時点での月額家賃収入です。共益費・管理費収入も含む総収入額を入力してください。年間収入を12で割った値になります。"
          formatDisplay={`現在: ${formatNumber(rentMonthly0)}円/月`}
        />
        <InputField
          label="月次経費"
          value={monthlyOpex0}
          onChange={setMonthlyOpex0}
          step="5000"
          helpText="毎月発生する運営費用です。修繕積立金、管理費、管理委託料等が含まれます。固定資産税は年額で別途入力するため、ここには含めません。"
          formatDisplay={`現在: ${formatNumber(monthlyOpex0)}円/月`}
        />
        <InputField
          label="固定資産税（年額）"
          value={taxAnnualFixed}
          onChange={setTaxAnnualFixed}
          step="10000"
          helpText="毎年課税される固定資産税と都市計画税の合計額です。市町村から送付される納税通知書の年税額を入力してください。築年数による軽減措置も反映済みの金額を使用します。"
          formatDisplay={`現在: ${formatNumber(taxAnnualFixed)}円/年`}
        />
      </div>
    </div>
  )
}

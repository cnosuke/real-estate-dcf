import { useAtom } from 'jotai'
import {
  loanAmountAtom,
  loanRateAtom,
  loanTermAtom,
} from '@/atoms/dcf-input-atoms'
import { formatNumber, formatPercent, InputField } from '../shared/InputField'

export function LoanSection() {
  const [loanAmount, setLoanAmount] = useAtom(loanAmountAtom)
  const [loanRate, setLoanRate] = useAtom(loanRateAtom)
  const [loanTerm, setLoanTerm] = useAtom(loanTermAtom)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">借入条件</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="借入額"
          value={loanAmount}
          onChange={setLoanAmount}
          step="1000000"
          helpText="金融機関からの借入額です。物件価格の70-90%程度が一般的です。頭金は（物件価格-借入額）となります。借入額が多いほどレバレッジ効果が高まりますが、リスクも増加します。"
          formatDisplay={`現在: ${formatNumber(loanAmount)}円`}
        />
        <InputField
          label="借入金利"
          value={loanRate}
          onChange={setLoanRate}
          step="0.001"
          helpText="住宅ローンまたは不動産投資ローンの年利です。変動金利・固定金利により異なります。投資用ローンは住宅ローンより1-2%高い傾向があります。0.025は2.5%を意味します。"
          formatDisplay={`現在: ${formatPercent(loanRate)}`}
        />
        <InputField
          label="返済年数"
          value={loanTerm}
          onChange={setLoanTerm}
          step="1"
          min="1"
          helpText="借入金の返済期間です。期間が長いほど月々の返済額は減りますが、総支払利息は増加します。住宅では35年、投資用では20-35年が一般的です。"
          formatDisplay={`現在: ${loanTerm}年`}
        />
      </div>
    </div>
  )
}

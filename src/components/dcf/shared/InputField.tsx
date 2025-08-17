import { HelpTooltip } from '@/components/ui/help-tooltip'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// 数値フォーマット用ヘルパー
export const formatNumber = (value: number) => {
  return new Intl.NumberFormat('ja-JP').format(value)
}

export const formatPercent = (value: number) => {
  return `${(value * 100).toFixed(2)}%`
}

interface InputFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  step?: string
  min?: string
  helpText?: string
  formatDisplay?: string
}

export function InputField({
  label,
  value,
  onChange,
  step = '1',
  min = '0',
  helpText,
  formatDisplay,
}: InputFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={label}>{label}</Label>
        {helpText && <HelpTooltip content={helpText} />}
      </div>
      <Input
        id={label}
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        step={step}
        min={min}
      />
      {formatDisplay && (
        <p className="text-sm text-muted-foreground">{formatDisplay}</p>
      )}
    </div>
  )
}

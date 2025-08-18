import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { WithFieldError } from '../validation/FieldError'
import { useDCFForm } from '../providers/DCFFormProvider'
import { getInputHelpText, type InputHelpTextKey } from '@/lib/help-texts'
import type { Input as DCFInput } from '@/types/dcf'

// 数値フォーマット用ヘルパー
export const formatNumber = (value: number) => {
  return new Intl.NumberFormat('ja-JP').format(value)
}

export const formatPercent = (value: number) => {
  return `${(value * 100).toFixed(2)}%`
}

interface InputFieldProps {
  fieldName: string
  label: string
  value: number
  onChange: (value: number) => void
  type?: 'number' | 'percentage'
  step?: number
  min?: number
  max?: number
  helpText?: string  // カスタムヘルプテキスト（オプション）
  placeholder?: string
  className?: string
  showHelp?: boolean  // ヘルプ表示の制御（デフォルト: true）
  unit?: string  // 単位表示（例: "円", "年", "％"）
  showFormattedValue?: boolean  // フォーマット済み値を表示するか（デフォルト: true）
}

export function InputField({
  fieldName,
  label,
  value,
  onChange,
  type = 'number',
  step,
  min,
  max,
  helpText,
  placeholder,
  className,
  showHelp = true,
  unit,
  showFormattedValue = true
}: InputFieldProps) {
  const { updateInput } = useDCFForm()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseValue(e.target.value)
    onChange(newValue)
    
    // 親のDCF入力も更新
    updateInput({ [fieldName]: newValue } as Partial<DCFInput>)
  }

  const formatValue = (val: number) => {
    if (type === 'percentage') {
      return (val * 100).toString()
    }
    return val.toString()
  }

  const parseValue = (inputVal: string) => {
    const parsed = parseFloat(inputVal) || 0
    if (type === 'percentage') {
      return parsed / 100
    }
    return parsed
  }

  // ヘルプテキストの取得（カスタムまたは自動取得）
  const getDisplayHelpText = () => {
    if (!showHelp) return null
    
    // カスタムヘルプテキストが提供されている場合はそれを使用
    if (helpText) {
      return { title: label, content: helpText }
    }
    
    // 自動取得を試行
    const autoHelpText = getInputHelpText(fieldName as InputHelpTextKey)
    return autoHelpText
  }

  const displayHelpText = getDisplayHelpText()

  // フォーマット済み値を表示する関数
  const getFormattedDisplay = () => {
    if (!showFormattedValue || value === 0) return null
    
    if (type === 'percentage') {
      return `${(value * 100).toFixed(2)}%`
    }
    
    const formattedNumber = new Intl.NumberFormat('ja-JP').format(value)
    const displayUnit = unit || (fieldName.includes('Rate') || fieldName.includes('Decay') ? '%' : '円')
    
    return `${formattedNumber}${displayUnit}`
  }

  const formattedDisplay = getFormattedDisplay()

  return (
    <WithFieldError fieldName={fieldName}>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={fieldName}>{label}</Label>
          {displayHelpText && (
            <HelpTooltip 
              title={displayHelpText.title}
              content={displayHelpText.content}
            />
          )}
        </div>
        <div className="space-y-1">
          <Input
            id={fieldName}
            type="number"
            value={formatValue(value)}
            onChange={handleChange}
            step={step}
            min={min}
            max={max}
            placeholder={placeholder}
            className={className}
          />
          {formattedDisplay && (
            <div className="text-xs text-muted-foreground/70 font-mono">
              {formattedDisplay}
            </div>
          )}
        </div>
        {type === 'percentage' && (
          <span className="text-xs text-muted-foreground">（%で入力）</span>
        )}
      </div>
    </WithFieldError>
  )
}

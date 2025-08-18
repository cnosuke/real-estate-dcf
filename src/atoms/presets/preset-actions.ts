import { atom } from 'jotai'
import type { Input } from '@/types/dcf'
import { updateDCFInputAtom } from '../calculation/dcf-input'
import { 
  presetConfigsAtom, 
  customPresetsAtom, 
  selectedPresetIdAtom,
  allPresetsAtom,
  PRESET_CONFIGS 
} from './preset-data'
import type { PresetConfig, PresetType, LocationPreset, PropertyTypePreset } from './preset-data'

// プリセット適用atom
export const applyPresetAtom = atom(
  null,
  (get, set, presetId: string) => {
    const allPresets = get(allPresetsAtom)
    const preset = allPresets.find(p => p.id === presetId)
    
    if (preset && preset.input) {
      set(updateDCFInputAtom, preset.input)
      set(selectedPresetIdAtom, presetId)
    }
  }
)

// カスタムプリセット追加atom
export const addCustomPresetAtom = atom(
  null,
  (get, set, preset: Omit<PresetConfig, 'id' | 'category'>) => {
    const customPresets = get(customPresetsAtom)
    const newPreset: PresetConfig = {
      ...preset,
      id: `custom-${Date.now()}`,
      category: 'custom'
    }
    
    set(customPresetsAtom, [...customPresets, newPreset])
    return newPreset
  }
)

// プリセット削除atom（カスタムのみ）
export const removeCustomPresetAtom = atom(
  null,
  (get, set, presetId: string) => {
    const customPresets = get(customPresetsAtom)
    const filtered = customPresets.filter(p => p.id !== presetId)
    set(customPresetsAtom, filtered)
    
    // 削除したプリセットが選択されていた場合はクリア
    const selectedId = get(selectedPresetIdAtom)
    if (selectedId === presetId) {
      set(selectedPresetIdAtom, null)
    }
  }
)

// カスタムプリセット更新atom
export const updateCustomPresetAtom = atom(
  null,
  (get, set, presetId: string, updates: Partial<PresetConfig>) => {
    const customPresets = get(customPresetsAtom)
    const updatedPresets = customPresets.map(preset => 
      preset.id === presetId 
        ? { ...preset, ...updates, id: presetId, category: 'custom' as const }
        : preset
    )
    set(customPresetsAtom, updatedPresets)
  }
)

// 現在の入力値からカスタムプリセットを作成
export const createPresetFromCurrentInputAtom = atom(
  null,
  (get, set, name: string, description: string = '') => {
    // dcfInputAtomを直接importして現在の値を取得
    const { dcfInputAtom } = require('../calculation/dcf-input')
    const currentInput = get(dcfInputAtom) as Input
    
    const newPreset: PresetConfig = {
      id: `custom-${Date.now()}`,
      name,
      description,
      input: currentInput,
      category: 'custom'
    }
    
    const customPresets = get(customPresetsAtom)
    set(customPresetsAtom, [...customPresets, newPreset])
    
    return newPreset
  }
)

// 後方互換性のためのatom
export const currentPresetAtom = selectedPresetIdAtom

// 後方互換性: 既存のPresetType用のapplyPresetAtom
export const applyLegacyPresetAtom = atom(
  null,
  (get, set, presetType: PresetType) => {
    const config = PRESET_CONFIGS[presetType]
    if (!config) return

    // 既存のconfig形式をInput形式に変換
    const input = {
      p0: config.p0,
      i0: config.i0,
      rentMonthly0: config.rentMonthly0,
      monthlyOpex0: config.monthlyOpex0,
      taxAnnualFixed: config.taxAnnualFixed,
      loanAmount: config.loanAmount,
      loanRate: config.loanRate,
      loanTerm: config.loanTerm,
      vacancy: config.vacancy,
      inflation: config.inflation,
      rentDecay: config.rentDecay,
      priceDecay: config.priceDecay,
      discountAsset: config.discountAsset,
      discountEquity: config.discountEquity,
      exitCostRate: config.exitCostRate,
      years: config.years
    }
    
    set(updateDCFInputAtom, input)
    set(selectedPresetIdAtom, presetType)
  }
)

// Location-based preset helper
export const applyLocationPresetAtom = atom(
  null,
  (get, set, location: LocationPreset) => {
    const basePresets: Record<LocationPreset, PresetType> = {
      urban: 'urban-mansion',
      suburban: 'suburban-house',
      rural: 'rural-commercial'
    }
    
    const preset = basePresets[location]
    set(applyLegacyPresetAtom, preset)
  }
)

// Property type preset helper
export const applyPropertyTypePresetAtom = atom(
  null,
  (get, set, propertyType: PropertyTypePreset) => {
    const basePresets: Record<PropertyTypePreset, PresetType> = {
      mansion: 'urban-mansion',
      house: 'suburban-house',
      commercial: 'office-building'
    }
    
    const preset = basePresets[propertyType]
    set(applyLegacyPresetAtom, preset)
  }
)

// プリセット検証
export const isCurrentPresetValidAtom = atom((get) => {
  const selectedId = get(selectedPresetIdAtom)
  if (!selectedId) return true
  
  const allPresets = get(allPresetsAtom)
  const preset = allPresets.find(p => p.id === selectedId)
  
  if (!preset) return false
  
  // 現在の値とプリセットの値を比較
  // 簡単な実装として、選択されたプリセットがあれば有効とする
  return true
})

// プリセットカテゴリ別適用
export const applyPresetByCategoryAtom = atom(
  null,
  (get, set, category: PresetConfig['category'], presetId: string) => {
    const allPresets = get(allPresetsAtom)
    const preset = allPresets.find(p => p.id === presetId && p.category === category)
    
    if (preset) {
      set(applyPresetAtom, preset.id)
    }
  }
)
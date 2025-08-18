import { atom } from 'jotai'
import type { Input } from '@/types/dcf'

export interface PresetConfig {
  id: string
  name: string
  description: string
  input: Partial<Input>
  category: 'location' | 'propertyType' | 'strategy' | 'custom'
}

export const presetConfigsAtom = atom<PresetConfig[]>([
  {
    id: 'urban-mansion',
    name: '都心部マンション',
    description: '東京都心部の投資用ワンルーム・1LDKマンション',
    category: 'propertyType',
    input: {
      p0: 45_000_000,
      i0: 1_800_000,
      rentMonthly0: 160_000,
      monthlyOpex0: 25_000,
      taxAnnualFixed: 180_000,
      loanAmount: 31_500_000, // LTV 70%
      loanRate: 0.025,
      loanTerm: 25,
      vacancy: 0.03,
      inflation: 0.02,
      rentDecay: 0.008,
      priceDecay: 0.003,
      discountAsset: 0.05,
      discountEquity: 0.08,
      exitCostRate: 0.035,
      years: 10
    }
  },
  {
    id: 'suburban-house',
    name: '郊外一戸建て',
    description: '郊外の賃貸用一戸建て住宅（ファミリー向け）',
    category: 'propertyType',
    input: {
      p0: 35_000_000,
      i0: 1_200_000,
      rentMonthly0: 120_000,
      monthlyOpex0: 20_000,
      taxAnnualFixed: 140_000,
      loanAmount: 24_500_000, // LTV 70%
      loanRate: 0.028,
      loanTerm: 30,
      vacancy: 0.08,
      inflation: 0.018,
      rentDecay: 0.015,
      priceDecay: 0.008,
      discountAsset: 0.065,
      discountEquity: 0.095,
      exitCostRate: 0.04,
      years: 12
    }
  },
  {
    id: 'rural-commercial',
    name: '地方商業用不動産',
    description: '地方都市の小規模オフィス・店舗物件',
    category: 'propertyType',
    input: {
      p0: 25_000_000,
      i0: 1_000_000,
      rentMonthly0: 100_000,
      monthlyOpex0: 18_000,
      taxAnnualFixed: 120_000,
      loanAmount: 17_500_000, // LTV 70%
      loanRate: 0.032,
      loanTerm: 20,
      vacancy: 0.12,
      inflation: 0.015,
      rentDecay: 0.02,
      priceDecay: 0.012,
      discountAsset: 0.08,
      discountEquity: 0.12,
      exitCostRate: 0.045,
      years: 8
    }
  },
  {
    id: 'luxury-mansion',
    name: '高級マンション',
    description: '港区・渋谷区等の高級賃貸マンション',
    category: 'propertyType',
    input: {
      p0: 80_000_000,
      i0: 2_800_000,
      rentMonthly0: 280_000,
      monthlyOpex0: 45_000,
      taxAnnualFixed: 320_000,
      loanAmount: 56_000_000, // LTV 70%
      loanRate: 0.022,
      loanTerm: 25,
      vacancy: 0.02,
      inflation: 0.02,
      rentDecay: 0.005,
      priceDecay: 0.002,
      discountAsset: 0.045,
      discountEquity: 0.075,
      exitCostRate: 0.03,
      years: 10
    }
  },
  {
    id: 'student-housing',
    name: '学生向け住宅',
    description: '大学周辺の学生向けワンルーム・シェアハウス',
    category: 'strategy',
    input: {
      p0: 30_000_000,
      i0: 1_100_000,
      rentMonthly0: 110_000,
      monthlyOpex0: 22_000,
      taxAnnualFixed: 110_000,
      loanAmount: 21_000_000, // LTV 70%
      loanRate: 0.03,
      loanTerm: 25,
      vacancy: 0.1,
      inflation: 0.02,
      rentDecay: 0.012,
      priceDecay: 0.01,
      discountAsset: 0.07,
      discountEquity: 0.11,
      exitCostRate: 0.04,
      years: 8
    }
  },
  {
    id: 'office-building',
    name: 'オフィスビル',
    description: 'ビジネス街の中小規模オフィスビル',
    category: 'propertyType',
    input: {
      p0: 120_000_000,
      i0: 4_200_000,
      rentMonthly0: 450_000,
      monthlyOpex0: 80_000,
      taxAnnualFixed: 480_000,
      loanAmount: 84_000_000, // LTV 70%
      loanRate: 0.025,
      loanTerm: 20,
      vacancy: 0.15,
      inflation: 0.02,
      rentDecay: 0.018,
      priceDecay: 0.015,
      discountAsset: 0.075,
      discountEquity: 0.13,
      exitCostRate: 0.035,
      years: 7
    }
  },
  // 地域別プリセット
  {
    id: 'tokyo-residential',
    name: '東京住宅',
    description: '東京都内の住宅投資用設定',
    category: 'location',
    input: {
      vacancy: 0.05,
      inflation: 0.01,
      rentDecay: 0.01,
      priceDecay: 0.005,
      discountAsset: 0.06,
      discountEquity: 0.10
    }
  },
  {
    id: 'osaka-residential',
    name: '大阪住宅',
    description: '大阪府内の住宅投資用設定',
    category: 'location',
    input: {
      vacancy: 0.07,
      inflation: 0.01,
      rentDecay: 0.015,
      priceDecay: 0.008,
      discountAsset: 0.065,
      discountEquity: 0.11
    }
  },
  {
    id: 'nagoya-residential',
    name: '名古屋住宅',
    description: '名古屋市内の住宅投資用設定',
    category: 'location',
    input: {
      vacancy: 0.06,
      inflation: 0.01,
      rentDecay: 0.012,
      priceDecay: 0.007,
      discountAsset: 0.062,
      discountEquity: 0.105
    }
  }
])

export const selectedPresetIdAtom = atom<string | null>(null)
export const customPresetsAtom = atom<PresetConfig[]>([])

// プリセットカテゴリ別の取得
export const locationPresetsAtom = atom((get) => {
  const presets = get(presetConfigsAtom)
  return presets.filter(preset => preset.category === 'location')
})

export const propertyTypePresetsAtom = atom((get) => {
  const presets = get(presetConfigsAtom)
  return presets.filter(preset => preset.category === 'propertyType')
})

export const strategyPresetsAtom = atom((get) => {
  const presets = get(presetConfigsAtom)
  return presets.filter(preset => preset.category === 'strategy')
})

// 全プリセット取得（ビルトイン + カスタム）
export const allPresetsAtom = atom((get) => {
  const builtInPresets = get(presetConfigsAtom)
  const customPresets = get(customPresetsAtom)
  return [...builtInPresets, ...customPresets]
})

// 後方互換性のため
export const PRESET_CONFIGS = {
  'urban-mansion': {
    name: '都心部マンション',
    description: '東京都心部の投資用ワンルーム・1LDKマンション',
    p0: 45_000_000,
    i0: 1_800_000,
    rentMonthly0: 160_000,
    monthlyOpex0: 25_000,
    taxAnnualFixed: 180_000,
    loanAmount: 31_500_000,
    loanRate: 0.025,
    loanTerm: 25,
    vacancy: 0.03,
    inflation: 0.02,
    rentDecay: 0.008,
    priceDecay: 0.003,
    discountAsset: 0.05,
    discountEquity: 0.08,
    exitCostRate: 0.035,
    years: 10
  },
  'suburban-house': {
    name: '郊外一戸建て',
    description: '郊外の賃貸用一戸建て住宅（ファミリー向け）',
    p0: 35_000_000,
    i0: 1_200_000,
    rentMonthly0: 120_000,
    monthlyOpex0: 20_000,
    taxAnnualFixed: 140_000,
    loanAmount: 24_500_000,
    loanRate: 0.028,
    loanTerm: 30,
    vacancy: 0.08,
    inflation: 0.018,
    rentDecay: 0.015,
    priceDecay: 0.008,
    discountAsset: 0.065,
    discountEquity: 0.095,
    exitCostRate: 0.04,
    years: 12
  },
  'rural-commercial': {
    name: '地方商業用不動産',
    description: '地方都市の小規模オフィス・店舗物件',
    p0: 25_000_000,
    i0: 1_000_000,
    rentMonthly0: 100_000,
    monthlyOpex0: 18_000,
    taxAnnualFixed: 120_000,
    loanAmount: 17_500_000,
    loanRate: 0.032,
    loanTerm: 20,
    vacancy: 0.12,
    inflation: 0.015,
    rentDecay: 0.02,
    priceDecay: 0.012,
    discountAsset: 0.08,
    discountEquity: 0.12,
    exitCostRate: 0.045,
    years: 8
  },
  'luxury-mansion': {
    name: '高級マンション',
    description: '港区・渋谷区等の高級賃貸マンション',
    p0: 80_000_000,
    i0: 2_800_000,
    rentMonthly0: 280_000,
    monthlyOpex0: 45_000,
    taxAnnualFixed: 320_000,
    loanAmount: 56_000_000,
    loanRate: 0.022,
    loanTerm: 25,
    vacancy: 0.02,
    inflation: 0.02,
    rentDecay: 0.005,
    priceDecay: 0.002,
    discountAsset: 0.045,
    discountEquity: 0.075,
    exitCostRate: 0.03,
    years: 10
  },
  'student-housing': {
    name: '学生向け住宅',
    description: '大学周辺の学生向けワンルーム・シェアハウス',
    p0: 30_000_000,
    i0: 1_100_000,
    rentMonthly0: 110_000,
    monthlyOpex0: 22_000,
    taxAnnualFixed: 110_000,
    loanAmount: 21_000_000,
    loanRate: 0.03,
    loanTerm: 25,
    vacancy: 0.1,
    inflation: 0.02,
    rentDecay: 0.012,
    priceDecay: 0.01,
    discountAsset: 0.07,
    discountEquity: 0.11,
    exitCostRate: 0.04,
    years: 8
  },
  'office-building': {
    name: 'オフィスビル',
    description: 'ビジネス街の中小規模オフィスビル',
    p0: 120_000_000,
    i0: 4_200_000,
    rentMonthly0: 450_000,
    monthlyOpex0: 80_000,
    taxAnnualFixed: 480_000,
    loanAmount: 84_000_000,
    loanRate: 0.025,
    loanTerm: 20,
    vacancy: 0.15,
    inflation: 0.02,
    rentDecay: 0.018,
    priceDecay: 0.015,
    discountAsset: 0.075,
    discountEquity: 0.13,
    exitCostRate: 0.035,
    years: 7
  }
} as const

export type PresetType = keyof typeof PRESET_CONFIGS
export type LocationPreset = 'urban' | 'suburban' | 'rural'
export type PropertyTypePreset = 'mansion' | 'house' | 'commercial'
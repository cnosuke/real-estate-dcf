/**
 * @deprecated This file is being migrated to the new atom structure.
 * Please use atoms from '@/atoms/presets' instead.
 * This file will be removed in a future version.
 */
import { atom } from 'jotai'
import { 
  p0Atom, i0Atom, rentMonthly0Atom, monthlyOpex0Atom, taxAnnualFixedAtom 
} from './property-atoms'
import { 
  vacancyAtom, inflationAtom, rentDecayAtom, priceDecayAtom,
  discountAssetAtom, discountEquityAtom 
} from './market-risk-atoms'
import { 
  loanAmountAtom, loanRateAtom, loanTermAtom 
} from './loan-atoms'
import { 
  exitCostRateAtom, yearsAtom 
} from './analysis-atoms'

// Preset types
export type PresetType = 'urban-mansion' | 'suburban-house' | 'rural-commercial' | 
                        'luxury-mansion' | 'student-housing' | 'office-building'

export type LocationPreset = 'urban' | 'suburban' | 'rural'
export type PropertyTypePreset = 'mansion' | 'house' | 'commercial'

// Preset configurations
export const PRESET_CONFIGS = {
  'urban-mansion': {
    name: '都心部マンション',
    description: '東京都心部の投資用ワンルーム・1LDKマンション',
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
  },
  'suburban-house': {
    name: '郊外一戸建て',
    description: '郊外の賃貸用一戸建て住宅（ファミリー向け）',
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
  },
  'rural-commercial': {
    name: '地方商業用不動産',
    description: '地方都市の小規模オフィス・店舗物件',
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
  },
  'luxury-mansion': {
    name: '高級マンション',
    description: '港区・渋谷区等の高級賃貸マンション',
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
  },
  'student-housing': {
    name: '学生向け住宅',
    description: '大学周辺の学生向けワンルーム・シェアハウス',
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
  },
  'office-building': {
    name: 'オフィスビル',
    description: 'ビジネス街の中小規模オフィスビル',
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
} as const

// Current preset atom
export const currentPresetAtom = atom<PresetType | null>(null)

// Preset application action
export const applyPresetAtom = atom(
  null,
  (get, set, presetType: PresetType) => {
    const config = PRESET_CONFIGS[presetType]
    if (!config) return

    // Apply all preset values
    set(p0Atom, config.p0)
    set(i0Atom, config.i0)
    set(rentMonthly0Atom, config.rentMonthly0)
    set(monthlyOpex0Atom, config.monthlyOpex0)
    set(taxAnnualFixedAtom, config.taxAnnualFixed)
    
    set(loanAmountAtom, config.loanAmount)
    set(loanRateAtom, config.loanRate)
    set(loanTermAtom, config.loanTerm)
    
    set(vacancyAtom, config.vacancy)
    set(inflationAtom, config.inflation)
    set(rentDecayAtom, config.rentDecay)
    set(priceDecayAtom, config.priceDecay)
    set(discountAssetAtom, config.discountAsset)
    set(discountEquityAtom, config.discountEquity)
    
    set(exitCostRateAtom, config.exitCostRate)
    set(yearsAtom, config.years)
    
    // Update current preset
    set(currentPresetAtom, presetType)
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
    set(applyPresetAtom, preset)
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
    set(applyPresetAtom, preset)
  }
)

// Preset validation
export const isCurrentPresetValidAtom = atom((get) => {
  const currentPreset = get(currentPresetAtom)
  if (!currentPreset) return true
  
  const config = PRESET_CONFIGS[currentPreset]
  
  // Check if current values match preset
  return (
    get(p0Atom) === config.p0 &&
    get(i0Atom) === config.i0 &&
    get(rentMonthly0Atom) === config.rentMonthly0 &&
    get(loanAmountAtom) === config.loanAmount &&
    get(loanRateAtom) === config.loanRate
    // Add more checks as needed
  )
})
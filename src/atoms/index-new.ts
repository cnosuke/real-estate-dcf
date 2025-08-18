// 計算系エクスポート（メイン機能）
export {
  // 入力値管理
  dcfInputAtom,
  updateDCFInputAtom,
  // 個別入力atom（後方互換性のため）
  p0Atom,
  i0Atom,
  rentMonthly0Atom,
  monthlyOpex0Atom,
  vacancyAtom,
  inflationAtom,
  rentDecayAtom,
  priceDecayAtom,
  taxAnnualFixedAtom,
  exitCostRateAtom,
  yearsAtom,
  discountAssetAtom,
  discountEquityAtom,
  loanAmountAtom,
  loanRateAtom,
  loanTermAtom,
  prepayPenaltyRateAtom,
  // 計算結果管理
  dcfResultAtom,
  executeDCFCalculationAtom,
  autoCalculateDCFAtom,
  dcfCalculationStateAtom,
  dcfCalculationErrorAtom,
  isCalculatingAtom,
  hasCalculationErrorAtom,
  calculationSuccessAtom,
  // 後方互換性のatom
  currentDCFErrorAtom,
  dcfResultStateAtom,
  // 導出値
  purchasePriceWithCostsAtom,
  monthlyPaymentAtom,
  ltvAtom,
  totalInterestAtom,
  effectiveVacancyRateAtom,
  riskAdjustedInflationAtom,
  equityMultipleAtom,
  cashOnCashReturnAtom,
  totalReturnAtom,
  annualizedReturnAtom,
  breakEvenYearsAtom,
  investmentMetricsAtom
} from './calculation'

// UI系エクスポート（必要最小限）
export {
  // バリデーション状態
  inputErrorsAtom,
  inputWarningsAtom,
  hasInputErrorsAtom,
  hasInputWarningsAtom,
  getFieldErrorAtom,
  getFieldWarningAtom,
  fieldErrorsMapAtom,
  fieldWarningsMapAtom,
  validationSummaryAtom,
  // フォーム状態（よく使用されるもののみ）
  isFormEditingAtom,
  setFormEditingAtom,
  toggleSectionAtom,
  // セクション展開状態
  propertyBasicSectionExpandedAtom,
  marketRiskSectionExpandedAtom,
  loanSectionExpandedAtom,
  holdingSaleSectionExpandedAtom,
  advancedSettingsSectionExpandedAtom,
  allSectionsExpandedAtom,
  toggleAllSectionsAtom,
  // 表示設定（よく使用されるもののみ）
  numberFormatTypeAtom,
  showDebugInfoAtom,
  displaySettingsAtom,
  updateDisplaySettingsAtom
} from './ui'

// プリセット系エクスポート
export {
  applyPresetAtom,
  selectedPresetIdAtom,
  presetConfigsAtom,
  allPresetsAtom,
  addCustomPresetAtom,
  removeCustomPresetAtom,
  createPresetFromCurrentInputAtom,
  // 後方互換性
  currentPresetAtom,
  applyLegacyPresetAtom as applyPresetAtom_Legacy,
  applyLocationPresetAtom,
  applyPropertyTypePresetAtom,
  isCurrentPresetValidAtom,
  PRESET_CONFIGS
} from './presets'

// 型エクスポート
export type { PresetConfig } from './presets/preset-data'
export { DCFCalculationState } from './calculation/dcf-output'
export { NumberFormatType } from './ui/display'

// 後方互換性のための型再エクスポート
export type { 
  PresetType, 
  LocationPreset, 
  PropertyTypePreset 
} from './presets/preset-data'
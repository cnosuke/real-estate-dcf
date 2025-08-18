// プリセットデータ管理
export {
  // データatom
  presetConfigsAtom,
  selectedPresetIdAtom,
  customPresetsAtom,
  allPresetsAtom,
  // カテゴリ別
  locationPresetsAtom,
  propertyTypePresetsAtom,
  strategyPresetsAtom,
  // 後方互換性
  PRESET_CONFIGS,
  // 型定義
  type PresetConfig,
  type PresetType,
  type LocationPreset,
  type PropertyTypePreset
} from './preset-data'

// プリセット適用アクション
export {
  // 基本操作
  applyPresetAtom,
  addCustomPresetAtom,
  removeCustomPresetAtom,
  updateCustomPresetAtom,
  createPresetFromCurrentInputAtom,
  // 後方互換性
  currentPresetAtom,
  applyLegacyPresetAtom,
  applyLocationPresetAtom,
  applyPropertyTypePresetAtom,
  // 検証・カテゴリ操作
  isCurrentPresetValidAtom,
  applyPresetByCategoryAtom
} from './preset-actions'
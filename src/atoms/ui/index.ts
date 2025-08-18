// フォーム状態管理
export {
  // セクション展開状態
  propertyBasicSectionExpandedAtom,
  marketRiskSectionExpandedAtom,
  loanSectionExpandedAtom,
  holdingSaleSectionExpandedAtom,
  advancedSettingsSectionExpandedAtom,
  // フォーム編集状態
  isFormEditingAtom,
  lastModifiedFieldAtom,
  // フォーム操作アクション
  toggleSectionAtom,
  setFormEditingAtom,
  allSectionsExpandedAtom,
  toggleAllSectionsAtom
} from './form-state'

// バリデーション状態管理
export {
  // バリデーション結果
  inputValidationAtom,
  businessRulesValidationAtom,
  // エラー・警告
  inputErrorsAtom,
  inputWarningsAtom,
  hasInputErrorsAtom,
  hasInputWarningsAtom,
  // フィールド別取得
  getFieldErrorAtom,
  getFieldWarningAtom,
  fieldErrorsMapAtom,
  fieldWarningsMapAtom,
  // サマリー
  validationSummaryAtom
} from './validation'

// 表示設定管理
export {
  // 数値フォーマット
  NumberFormatType,
  numberFormatTypeAtom,
  showPercentageAsDecimalAtom,
  showDebugInfoAtom,
  // 結果表示
  showCashFlowDetailsAtom,
  showCalculationStepsAtom,
  showWarningsAtom,
  // テーブル表示
  compactTableViewAtom,
  highlightImportantValuesAtom,
  // グラフ表示
  showGraphsAtom,
  graphTypeAtom,
  // テーマ
  darkModeAtom,
  colorSchemeAtom,
  // アクション
  updateDisplaySettingsAtom,
  resetDisplaySettingsAtom,
  displaySettingsAtom
} from './display'
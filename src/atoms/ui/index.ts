// フォーム状態管理
export {
  advancedSettingsSectionExpandedAtom,
  holdingSaleSectionExpandedAtom,
  loanSectionExpandedAtom,
  marketRiskSectionExpandedAtom,
  // セクション展開状態（実際に使用されているもののみ）
  propertyBasicSectionExpandedAtom,
  // フォーム操作アクション
  toggleSectionAtom,
} from './form-state'

// バリデーション状態管理
export {
  hasInputErrorsAtom,
  hasInputWarningsAtom,
  // エラー・警告（実際に使用されているもののみ）
  inputErrorsAtom,
  inputWarningsAtom,
} from './validation'

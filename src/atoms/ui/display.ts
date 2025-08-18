import { atom } from 'jotai'

// 数値フォーマット設定
export enum NumberFormatType {
  DEFAULT = 'default',
  COMPACT = 'compact',
  FULL = 'full'
}

export const numberFormatTypeAtom = atom<NumberFormatType>(NumberFormatType.DEFAULT)
export const showPercentageAsDecimalAtom = atom(false)
export const showDebugInfoAtom = atom(false)

// 結果表示設定
export const showCashFlowDetailsAtom = atom(false)
export const showCalculationStepsAtom = atom(false)
export const showWarningsAtom = atom(true)

// テーブル表示設定
export const compactTableViewAtom = atom(false)
export const highlightImportantValuesAtom = atom(true)

// グラフ表示設定
export const showGraphsAtom = atom(true)
export const graphTypeAtom = atom<'bar' | 'line' | 'area'>('bar')

// テーマ設定
export const darkModeAtom = atom(false)
export const colorSchemeAtom = atom<'blue' | 'green' | 'purple' | 'gray'>('blue')

// 表示設定の更新アクション
export const updateDisplaySettingsAtom = atom(
  null,
  (get, set, settings: {
    numberFormat?: NumberFormatType
    showPercentageAsDecimal?: boolean
    showDebugInfo?: boolean
    showCashFlowDetails?: boolean
    showCalculationSteps?: boolean
    showWarnings?: boolean
    compactTableView?: boolean
    highlightImportantValues?: boolean
    showGraphs?: boolean
    graphType?: 'bar' | 'line' | 'area'
    darkMode?: boolean
    colorScheme?: 'blue' | 'green' | 'purple' | 'gray'
  }) => {
    if (settings.numberFormat !== undefined) {
      set(numberFormatTypeAtom, settings.numberFormat)
    }
    if (settings.showPercentageAsDecimal !== undefined) {
      set(showPercentageAsDecimalAtom, settings.showPercentageAsDecimal)
    }
    if (settings.showDebugInfo !== undefined) {
      set(showDebugInfoAtom, settings.showDebugInfo)
    }
    if (settings.showCashFlowDetails !== undefined) {
      set(showCashFlowDetailsAtom, settings.showCashFlowDetails)
    }
    if (settings.showCalculationSteps !== undefined) {
      set(showCalculationStepsAtom, settings.showCalculationSteps)
    }
    if (settings.showWarnings !== undefined) {
      set(showWarningsAtom, settings.showWarnings)
    }
    if (settings.compactTableView !== undefined) {
      set(compactTableViewAtom, settings.compactTableView)
    }
    if (settings.highlightImportantValues !== undefined) {
      set(highlightImportantValuesAtom, settings.highlightImportantValues)
    }
    if (settings.showGraphs !== undefined) {
      set(showGraphsAtom, settings.showGraphs)
    }
    if (settings.graphType !== undefined) {
      set(graphTypeAtom, settings.graphType)
    }
    if (settings.darkMode !== undefined) {
      set(darkModeAtom, settings.darkMode)
    }
    if (settings.colorScheme !== undefined) {
      set(colorSchemeAtom, settings.colorScheme)
    }
  }
)

// 表示設定の一括リセット
export const resetDisplaySettingsAtom = atom(
  null,
  (get, set) => {
    set(numberFormatTypeAtom, NumberFormatType.DEFAULT)
    set(showPercentageAsDecimalAtom, false)
    set(showDebugInfoAtom, false)
    set(showCashFlowDetailsAtom, false)
    set(showCalculationStepsAtom, false)
    set(showWarningsAtom, true)
    set(compactTableViewAtom, false)
    set(highlightImportantValuesAtom, true)
    set(showGraphsAtom, true)
    set(graphTypeAtom, 'bar')
    set(darkModeAtom, false)
    set(colorSchemeAtom, 'blue')
  }
)

// 表示設定の統合オブジェクト
export const displaySettingsAtom = atom((get) => ({
  numberFormat: get(numberFormatTypeAtom),
  showPercentageAsDecimal: get(showPercentageAsDecimalAtom),
  showDebugInfo: get(showDebugInfoAtom),
  showCashFlowDetails: get(showCashFlowDetailsAtom),
  showCalculationSteps: get(showCalculationStepsAtom),
  showWarnings: get(showWarningsAtom),
  compactTableView: get(compactTableViewAtom),
  highlightImportantValues: get(highlightImportantValuesAtom),
  showGraphs: get(showGraphsAtom),
  graphType: get(graphTypeAtom),
  darkMode: get(darkModeAtom),
  colorScheme: get(colorSchemeAtom)
}))
import { atom } from 'jotai'

// セクション展開状態
export const propertyBasicSectionExpandedAtom = atom(true)
export const marketRiskSectionExpandedAtom = atom(true)
export const loanSectionExpandedAtom = atom(true)
export const holdingSaleSectionExpandedAtom = atom(true)
export const advancedSettingsSectionExpandedAtom = atom(false)

// フォーム編集状態
export const isFormEditingAtom = atom(false)
export const lastModifiedFieldAtom = atom<string | null>(null)

// フォーム操作アクション
export const toggleSectionAtom = atom(
  null,
  (get, set, sectionName: string) => {
    switch (sectionName) {
      case 'propertyBasic':
        set(propertyBasicSectionExpandedAtom, !get(propertyBasicSectionExpandedAtom))
        break
      case 'marketRisk':
        set(marketRiskSectionExpandedAtom, !get(marketRiskSectionExpandedAtom))
        break
      case 'loan':
        set(loanSectionExpandedAtom, !get(loanSectionExpandedAtom))
        break
      case 'holdingSale':
        set(holdingSaleSectionExpandedAtom, !get(holdingSaleSectionExpandedAtom))
        break
      case 'advancedSettings':
        set(advancedSettingsSectionExpandedAtom, !get(advancedSettingsSectionExpandedAtom))
        break
    }
  }
)

export const setFormEditingAtom = atom(
  null,
  (get, set, editing: boolean, fieldName?: string) => {
    set(isFormEditingAtom, editing)
    if (editing && fieldName) {
      set(lastModifiedFieldAtom, fieldName)
    } else if (!editing) {
      set(lastModifiedFieldAtom, null)
    }
  }
)

// セクション展開状態の一括管理
export const allSectionsExpandedAtom = atom((get) => {
  return (
    get(propertyBasicSectionExpandedAtom) &&
    get(marketRiskSectionExpandedAtom) &&
    get(loanSectionExpandedAtom) &&
    get(holdingSaleSectionExpandedAtom) &&
    get(advancedSettingsSectionExpandedAtom)
  )
})

export const toggleAllSectionsAtom = atom(
  null,
  (get, set) => {
    const allExpanded = get(allSectionsExpandedAtom)
    const newState = !allExpanded
    
    set(propertyBasicSectionExpandedAtom, newState)
    set(marketRiskSectionExpandedAtom, newState)
    set(loanSectionExpandedAtom, newState)
    set(holdingSaleSectionExpandedAtom, newState)
    set(advancedSettingsSectionExpandedAtom, newState)
  }
)
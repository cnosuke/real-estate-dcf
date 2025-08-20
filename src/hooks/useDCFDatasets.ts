import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { dcfInputAtom, updateDCFInputAtom } from '@/atoms/calculation/dcf-input'
import {
  deleteAllDatasets,
  deleteDataset,
  exportAllDatasetsAsJson,
  exportDatasetAsJson,
  getDatasets,
  hasDatasetWithName,
  type ImportOptions,
  type ImportPreview,
  type ImportResult,
  importDatasetsFromJson,
  previewImportData,
  saveDataset,
} from '@/lib/dcf/dataset-storage'
import type { DCFDataset, Input } from '@/types/dcf'

export function useDCFDatasets() {
  const [datasets, setDatasets] = useState<DCFDataset[]>([])

  // Use unified input atom
  const currentInput = useAtomValue(dcfInputAtom)
  const updateInput = useSetAtom(updateDCFInputAtom)

  const refreshDatasets = useCallback(() => {
    setDatasets(getDatasets())
  }, [])

  useEffect(() => {
    refreshDatasets()
  }, [refreshDatasets])

  const getCurrentInput = (): Input => currentInput

  const saveCurrentDataset = (name: string): DCFDataset => {
    const input = getCurrentInput()
    const savedDataset = saveDataset(name, input)
    refreshDatasets()
    return savedDataset
  }

  const loadDataset = (dataset: DCFDataset) => {
    updateInput(dataset.input)
  }

  const removeDataset = (id: string): boolean => {
    const success = deleteDataset(id)
    if (success) {
      refreshDatasets()
    }
    return success
  }

  const removeAllDatasets = (): boolean => {
    const success = deleteAllDatasets()
    if (success) {
      refreshDatasets()
    }
    return success
  }

  const checkNameExists = (name: string, excludeId?: string): boolean => {
    return hasDatasetWithName(name, excludeId)
  }

  const exportDatasetAsJsonString = (id: string): string => {
    return exportDatasetAsJson(id)
  }

  const exportAllDatasetsAsJsonString = (): string => {
    return exportAllDatasetsAsJson()
  }

  const copyDatasetToClipboard = async (id: string): Promise<boolean> => {
    try {
      const jsonString = exportDatasetAsJson(id)
      await navigator.clipboard.writeText(jsonString)
      return true
    } catch {
      return false
    }
  }

  const copyAllDatasetsToClipboard = async (): Promise<boolean> => {
    try {
      const jsonString = exportAllDatasetsAsJson()
      await navigator.clipboard.writeText(jsonString)
      return true
    } catch {
      return false
    }
  }

  const importDatasetsFromJsonString = (
    jsonString: string,
    options?: ImportOptions,
  ): ImportResult => {
    const result = importDatasetsFromJson(jsonString, options)
    if (result.imported > 0) {
      refreshDatasets()
    }
    return result
  }

  const importDatasetsFromFile = async (file: File): Promise<ImportResult> => {
    try {
      const text = await file.text()
      return importDatasetsFromJsonString(text)
    } catch (error) {
      return {
        success: false,
        imported: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        duplicates: [],
      }
    }
  }

  const previewImportDataFromString = (jsonString: string): ImportPreview => {
    return previewImportData(jsonString)
  }

  const previewImportDataFromFile = async (
    file: File,
  ): Promise<ImportPreview> => {
    try {
      const text = await file.text()
      return previewImportData(text)
    } catch (error) {
      return {
        isValid: false,
        count: 0,
        structure: 'invalid',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        duplicateNames: [],
      }
    }
  }

  return {
    datasets,
    saveCurrentDataset,
    loadDataset,
    removeDataset,
    removeAllDatasets,
    checkNameExists,
    refreshDatasets,
    exportDatasetAsJson: exportDatasetAsJsonString,
    exportAllDatasetsAsJson: exportAllDatasetsAsJsonString,
    copyDatasetToClipboard,
    copyAllDatasetsToClipboard,
    importDatasetsFromJson: importDatasetsFromJsonString,
    importDatasetsFromFile,
    previewImportData: previewImportDataFromString,
    previewImportDataFromFile,
  }
}

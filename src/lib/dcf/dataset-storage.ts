import type { DCFDataset, Input } from '@/types/dcf'
import { validateInput } from '@/lib/type-guards'

// Storage keys for new architecture
const STORAGE_KEYS = {
  datasets: 'dcf-datasets', // Legacy key for migration
  datasetPrefix: 'dcf-dataset-', // Individual dataset key prefix
  metadata: 'dcf-datasets-meta', // Metadata about all datasets
  version: 'dcf-storage-version', // Storage format version
} as const

const CURRENT_STORAGE_VERSION = 1

interface DatasetMetadata {
  version: number
  datasetIds: string[]
  lastModified: string
  totalCount: number
}

interface VersionedDataset {
  id: string
  name: string
  createdAt: string
  input: Input
  version: number
  metadata?: Record<string, unknown>
}

interface StorageInfo {
  storageVersion: number
  totalDatasets: number
  totalSizeEstimate: number
  lastModified: string
  isLegacyMigrated: boolean
}

// Initialize storage system and perform migration if needed
function initializeStorage(): void {
  const currentVersion = getStorageVersion()
  
  if (currentVersion === 0) {
    // First time or legacy data - perform migration
    migrateFromLegacy()
    setStorageVersion(CURRENT_STORAGE_VERSION)
  }
}

function getStorageVersion(): number {
  try {
    const version = localStorage.getItem(STORAGE_KEYS.version)
    return version ? parseInt(version, 10) : 0
  } catch {
    return 0
  }
}

function setStorageVersion(version: number): void {
  localStorage.setItem(STORAGE_KEYS.version, version.toString())
}

function getMetadata(): DatasetMetadata {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.metadata)
    if (!stored) {
      return {
        version: CURRENT_STORAGE_VERSION,
        datasetIds: [],
        lastModified: new Date().toISOString(),
        totalCount: 0,
      }
    }
    
    const metadata = JSON.parse(stored)
    if (
      metadata &&
      typeof metadata === 'object' &&
      Array.isArray(metadata.datasetIds) &&
      typeof metadata.version === 'number' &&
      typeof metadata.lastModified === 'string' &&
      typeof metadata.totalCount === 'number'
    ) {
      return metadata
    }
  } catch {
    // Fall through to return default
  }
  
  return {
    version: CURRENT_STORAGE_VERSION,
    datasetIds: [],
    lastModified: new Date().toISOString(),
    totalCount: 0,
  }
}

function updateMetadata(datasetIds: string[]): void {
  const metadata: DatasetMetadata = {
    version: CURRENT_STORAGE_VERSION,
    datasetIds,
    lastModified: new Date().toISOString(),
    totalCount: datasetIds.length,
  }
  
  localStorage.setItem(STORAGE_KEYS.metadata, JSON.stringify(metadata))
}

function getDatasetKey(id: string): string {
  return `${STORAGE_KEYS.datasetPrefix}${id}`
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function saveDataset(name: string, input: Input): DCFDataset {
  initializeStorage()
  
  // Validate input before saving
  const validation = validateInput(input)
  if (!validation.isValid) {
    const errorMessages = validation.errors.map(e => `${e.field}: ${e.message}`).join(', ')
    throw new Error(`Invalid input for dataset "${name}": ${errorMessages}`)
  }

  const metadata = getMetadata()
  const existingDatasets = getDatasets()
  const existingDataset = existingDatasets.find(d => d.name === name)
  
  const dataset: VersionedDataset = {
    id: existingDataset?.id || generateId(),
    name,
    createdAt: new Date().toISOString(),
    input: validation.value!,
    version: CURRENT_STORAGE_VERSION,
  }

  try {
    // Save individual dataset
    localStorage.setItem(getDatasetKey(dataset.id), JSON.stringify(dataset))
    
    // Update metadata
    const newDatasetIds = existingDataset 
      ? metadata.datasetIds 
      : [...metadata.datasetIds, dataset.id]
    updateMetadata(newDatasetIds)
    
    return {
      id: dataset.id,
      name: dataset.name,
      createdAt: dataset.createdAt,
      input: dataset.input,
    }
  } catch (error) {
    throw new Error(`Failed to save dataset "${name}": ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function getDatasets(): DCFDataset[] {
  initializeStorage()
  
  const metadata = getMetadata()
  const validDatasets: DCFDataset[] = []
  const invalidDatasetIds: string[] = []
  
  for (const datasetId of metadata.datasetIds) {
    try {
      const stored = localStorage.getItem(getDatasetKey(datasetId))
      if (!stored) {
        invalidDatasetIds.push(datasetId)
        continue
      }
      
      const dataset = JSON.parse(stored) as VersionedDataset
      if (
        dataset &&
        typeof dataset === 'object' &&
        typeof dataset.id === 'string' &&
        typeof dataset.name === 'string' &&
        typeof dataset.createdAt === 'string' &&
        dataset.input
      ) {
        const validation = validateInput(dataset.input)
        if (validation.isValid) {
          validDatasets.push({
            id: dataset.id,
            name: dataset.name,
            createdAt: dataset.createdAt,
            input: validation.value!,
          })
        } else {
          invalidDatasetIds.push(datasetId)
        }
      } else {
        invalidDatasetIds.push(datasetId)
      }
    } catch {
      invalidDatasetIds.push(datasetId)
    }
  }
  
  // Clean up invalid datasets from metadata
  if (invalidDatasetIds.length > 0) {
    const validIds = metadata.datasetIds.filter(id => !invalidDatasetIds.includes(id))
    updateMetadata(validIds)
    
    // Remove invalid dataset storage entries
    for (const invalidId of invalidDatasetIds) {
      try {
        localStorage.removeItem(getDatasetKey(invalidId))
      } catch {
        // Ignore errors during cleanup
      }
    }
  }

  return validDatasets.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getDataset(id: string): DCFDataset | null {
  initializeStorage()
  
  try {
    const stored = localStorage.getItem(getDatasetKey(id))
    if (!stored) return null
    
    const dataset = JSON.parse(stored) as VersionedDataset
    if (
      dataset &&
      typeof dataset === 'object' &&
      typeof dataset.id === 'string' &&
      typeof dataset.name === 'string' &&
      typeof dataset.createdAt === 'string' &&
      dataset.input
    ) {
      const validation = validateInput(dataset.input)
      if (validation.isValid) {
        return {
          id: dataset.id,
          name: dataset.name,
          createdAt: dataset.createdAt,
          input: validation.value!,
        }
      }
    }
  } catch {
    // Fall through to return null
  }
  
  return null
}

export function deleteDataset(id: string): boolean {
  initializeStorage()
  
  try {
    const metadata = getMetadata()
    const index = metadata.datasetIds.indexOf(id)
    
    if (index === -1) {
      return false // Dataset not found
    }
    
    // Remove from storage
    localStorage.removeItem(getDatasetKey(id))
    
    // Update metadata
    const newDatasetIds = metadata.datasetIds.filter(datasetId => datasetId !== id)
    updateMetadata(newDatasetIds)
    
    return true
  } catch {
    return false
  }
}

export function deleteAllDatasets(): boolean {
  initializeStorage()
  
  try {
    const metadata = getMetadata()
    
    // Remove all individual dataset entries
    for (const datasetId of metadata.datasetIds) {
      try {
        localStorage.removeItem(getDatasetKey(datasetId))
      } catch {
        // Continue even if individual deletion fails
      }
    }
    
    // Clear metadata
    updateMetadata([])
    
    return true
  } catch {
    return false
  }
}

export function exportDatasetAsJson(id: string): string {
  const dataset = getDataset(id)
  if (!dataset) {
    throw new Error(`Dataset with id "${id}" not found`)
  }
  
  return JSON.stringify(dataset, null, 2)
}

export function exportAllDatasetsAsJson(): string {
  const datasets = getDatasets()
  const exportData = {
    version: CURRENT_STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    datasets,
  }
  
  return JSON.stringify(exportData, null, 2)
}

export function migrateFromLegacy(): boolean {
  try {
    const legacyData = localStorage.getItem(STORAGE_KEYS.datasets)
    if (!legacyData) {
      return true // No legacy data to migrate
    }
    
    const legacyDatasets = JSON.parse(legacyData)
    if (!Array.isArray(legacyDatasets)) {
      return true // Invalid legacy data
    }
    
    const migratedIds: string[] = []
    
    for (const legacyDataset of legacyDatasets) {
      if (
        legacyDataset &&
        typeof legacyDataset === 'object' &&
        typeof legacyDataset.id === 'string' &&
        typeof legacyDataset.name === 'string' &&
        typeof legacyDataset.createdAt === 'string' &&
        legacyDataset.input
      ) {
        const validation = validateInput(legacyDataset.input)
        if (validation.isValid) {
          const versionedDataset: VersionedDataset = {
            id: legacyDataset.id,
            name: legacyDataset.name,
            createdAt: legacyDataset.createdAt,
            input: validation.value!,
            version: CURRENT_STORAGE_VERSION,
            metadata: {
              migratedFrom: 'legacy',
              migratedAt: new Date().toISOString(),
            },
          }
          
          try {
            localStorage.setItem(getDatasetKey(versionedDataset.id), JSON.stringify(versionedDataset))
            migratedIds.push(versionedDataset.id)
          } catch {
            // Continue with other datasets even if one fails
          }
        }
      }
    }
    
    // Update metadata with migrated datasets
    updateMetadata(migratedIds)
    
    // Remove legacy storage key
    localStorage.removeItem(STORAGE_KEYS.datasets)
    
    return true
  } catch {
    return false
  }
}

export function getStorageInfo(): StorageInfo {
  initializeStorage()
  
  const metadata = getMetadata()
  let totalSizeEstimate = 0
  
  // Estimate total storage size
  try {
    for (const datasetId of metadata.datasetIds) {
      const stored = localStorage.getItem(getDatasetKey(datasetId))
      if (stored) {
        totalSizeEstimate += stored.length * 2 // UTF-16 encoding approximation
      }
    }
    
    const metadataSize = localStorage.getItem(STORAGE_KEYS.metadata)?.length || 0
    totalSizeEstimate += metadataSize * 2
  } catch {
    // Ignore size calculation errors
  }
  
  const legacyData = localStorage.getItem(STORAGE_KEYS.datasets)
  
  return {
    storageVersion: getStorageVersion(),
    totalDatasets: metadata.totalCount,
    totalSizeEstimate,
    lastModified: metadata.lastModified,
    isLegacyMigrated: !legacyData,
  }
}

export function hasDatasetWithName(name: string, excludeId?: string): boolean {
  const datasets = getDatasets()
  return datasets.some((d) => d.name === name && d.id !== excludeId)
}

// Import functionality types
export interface ImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: string[]
  duplicates: string[]
}

export interface ImportOptions {
  overwriteExisting?: boolean
  autoRename?: boolean
}

type JsonStructure = 'single' | 'multiple' | 'array' | 'invalid'

// Detect JSON structure automatically
export function detectJsonStructure(jsonData: unknown): JsonStructure {
  if (!jsonData || typeof jsonData !== 'object') {
    return 'invalid'
  }

  if (Array.isArray(jsonData)) {
    // Check if it's an array of datasets
    if (jsonData.length === 0) {
      return 'array'
    }
    
    const firstItem = jsonData[0]
    if (isDatasetLike(firstItem)) {
      return 'array'
    }
    return 'invalid'
  }

  const obj = jsonData as Record<string, unknown>

  // Check for multiple datasets format (export format)
  if (obj.datasets && Array.isArray(obj.datasets) && typeof obj.version === 'number') {
    return 'multiple'
  }

  // Check for single dataset format
  if (isDatasetLike(obj)) {
    return 'single'
  }

  return 'invalid'
}

function isDatasetLike(obj: unknown): boolean {
  if (!obj || typeof obj !== 'object') {
    return false
  }

  const dataset = obj as Record<string, unknown>
  return (
    typeof dataset.id === 'string' &&
    typeof dataset.name === 'string' &&
    typeof dataset.createdAt === 'string' &&
    dataset.input &&
    typeof dataset.input === 'object'
  )
}

// Validate dataset structure
export function validateDatasetStructure(data: unknown): { isValid: boolean, errors: string[] } {
  const errors: string[] = []

  if (!data || typeof data !== 'object') {
    errors.push('データが無効です')
    return { isValid: false, errors }
  }

  const dataset = data as Record<string, unknown>

  if (typeof dataset.id !== 'string' || !dataset.id.trim()) {
    errors.push('IDが必要です')
  }

  if (typeof dataset.name !== 'string' || !dataset.name.trim()) {
    errors.push('名前が必要です')
  }

  if (typeof dataset.createdAt !== 'string') {
    errors.push('作成日時が必要です')
  }

  if (!dataset.input || typeof dataset.input !== 'object') {
    errors.push('入力データが必要です')
  } else {
    const validation = validateInput(dataset.input)
    if (!validation.isValid) {
      errors.push(`入力データが無効です: ${validation.errors.map(e => e.message).join(', ')}`)
    }
  }

  return { isValid: errors.length === 0, errors }
}

function generateUniqueName(baseName: string, existingNames: string[]): string {
  let counter = 1
  let newName = baseName

  while (existingNames.includes(newName)) {
    newName = `${baseName} (${counter})`
    counter++
  }

  return newName
}

// Import single dataset
export function importSingleDataset(data: unknown, options: ImportOptions = {}): ImportResult {
  const result: ImportResult = {
    success: false,
    imported: 0,
    skipped: 0,
    errors: [],
    duplicates: []
  }

  try {
    const validation = validateDatasetStructure(data)
    if (!validation.isValid) {
      result.errors.push(...validation.errors)
      return result
    }

    const dataset = data as DCFDataset
    const existingDatasets = getDatasets()
    const existingNames = existingDatasets.map(d => d.name)
    const existingDataset = existingDatasets.find(d => d.name === dataset.name)

    if (existingDataset) {
      result.duplicates.push(dataset.name)

      if (options.overwriteExisting) {
        // Overwrite existing dataset
        const savedDataset = saveDataset(dataset.name, dataset.input)
        result.imported = 1
        result.success = true
      } else if (options.autoRename) {
        // Auto-rename to avoid conflict
        const uniqueName = generateUniqueName(dataset.name, existingNames)
        const savedDataset = saveDataset(uniqueName, dataset.input)
        result.imported = 1
        result.success = true
      } else {
        // Skip duplicate
        result.skipped = 1
        result.success = true
      }
    } else {
      // No conflict, save directly
      const savedDataset = saveDataset(dataset.name, dataset.input)
      result.imported = 1
      result.success = true
    }
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Unknown error')
  }

  return result
}

// Import multiple datasets
export function importMultipleDatasets(data: unknown, options: ImportOptions = {}): ImportResult {
  const result: ImportResult = {
    success: true,
    imported: 0,
    skipped: 0,
    errors: [],
    duplicates: []
  }

  try {
    const structure = detectJsonStructure(data)
    let datasets: unknown[] = []

    switch (structure) {
      case 'multiple':
        const exportData = data as { datasets: unknown[] }
        datasets = exportData.datasets
        break
      
      case 'array':
        datasets = data as unknown[]
        break
      
      case 'single':
        datasets = [data]
        break
      
      default:
        result.errors.push('無効なJSON構造です')
        result.success = false
        return result
    }

    for (const dataset of datasets) {
      const singleResult = importSingleDataset(dataset, options)
      
      result.imported += singleResult.imported
      result.skipped += singleResult.skipped
      result.errors.push(...singleResult.errors)
      result.duplicates.push(...singleResult.duplicates)

      if (!singleResult.success && singleResult.errors.length > 0) {
        result.success = false
      }
    }
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Unknown error')
    result.success = false
  }

  return result
}

// Main import function
export function importDatasetsFromJson(jsonString: string, options: ImportOptions = {}): ImportResult {
  const result: ImportResult = {
    success: false,
    imported: 0,
    skipped: 0,
    errors: [],
    duplicates: []
  }

  try {
    if (!jsonString.trim()) {
      result.errors.push('JSONデータが空です')
      return result
    }

    const jsonData = JSON.parse(jsonString)
    return importMultipleDatasets(jsonData, options)
  } catch (error) {
    if (error instanceof SyntaxError) {
      result.errors.push('無効なJSON形式です')
    } else {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error')
    }
    return result
  }
}

// Preview function for import data
export interface ImportPreview {
  isValid: boolean
  count: number
  structure: JsonStructure
  errors: string[]
  duplicateNames: string[]
}

export function previewImportData(jsonString: string): ImportPreview {
  const preview: ImportPreview = {
    isValid: false,
    count: 0,
    structure: 'invalid',
    errors: [],
    duplicateNames: []
  }

  try {
    if (!jsonString.trim()) {
      preview.errors.push('JSONデータが空です')
      return preview
    }

    const jsonData = JSON.parse(jsonString)
    const structure = detectJsonStructure(jsonData)
    preview.structure = structure

    let datasets: unknown[] = []

    switch (structure) {
      case 'multiple':
        const exportData = jsonData as { datasets: unknown[] }
        datasets = exportData.datasets
        break
      
      case 'array':
        datasets = jsonData as unknown[]
        break
      
      case 'single':
        datasets = [jsonData]
        break
      
      default:
        preview.errors.push('無効なJSON構造です')
        return preview
    }

    const existingDatasets = getDatasets()
    const existingNames = existingDatasets.map(d => d.name)
    
    let validCount = 0
    for (const dataset of datasets) {
      const validation = validateDatasetStructure(dataset)
      if (validation.isValid) {
        validCount++
        const datasetObj = dataset as DCFDataset
        if (existingNames.includes(datasetObj.name)) {
          preview.duplicateNames.push(datasetObj.name)
        }
      } else {
        preview.errors.push(...validation.errors)
      }
    }

    preview.count = validCount
    preview.isValid = validCount > 0 && preview.errors.length === 0
  } catch (error) {
    if (error instanceof SyntaxError) {
      preview.errors.push('無効なJSON形式です')
    } else {
      preview.errors.push(error instanceof Error ? error.message : 'Unknown error')
    }
  }

  return preview
}
import type { DCFDataset, Input } from '@/types/dcf'
import { validateInput } from '@/lib/type-guards'

const STORAGE_KEY = 'dcf-datasets'

export function saveDataset(name: string, input: Input): DCFDataset {
  // Validate input before saving
  const validation = validateInput(input)
  if (!validation.isValid) {
    const errorMessages = validation.errors.map(e => `${e.field}: ${e.message}`).join(', ')
    throw new Error(`Invalid input for dataset "${name}": ${errorMessages}`)
  }

  const datasets = getDatasets()
  const existingIndex = datasets.findIndex((d) => d.name === name)

  const dataset: DCFDataset = {
    id: existingIndex >= 0 ? datasets[existingIndex].id : generateId(),
    name,
    createdAt: new Date().toISOString(),
    input: validation.value!,
  }

  if (existingIndex >= 0) {
    datasets[existingIndex] = dataset
  } else {
    datasets.push(dataset)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(datasets))
  return dataset
}

export function getDatasets(): DCFDataset[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const rawDatasets = JSON.parse(stored)
    if (!Array.isArray(rawDatasets)) return []

    // Filter out datasets with invalid input data
    const validDatasets: DCFDataset[] = []
    for (const dataset of rawDatasets) {
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
            ...dataset,
            input: validation.value!
          })
        }
      }
    }

    return validDatasets.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  } catch {
    return []
  }
}

export function getDataset(id: string): DCFDataset | null {
  const datasets = getDatasets()
  return datasets.find((d) => d.id === id) || null
}

export function deleteDataset(id: string): boolean {
  const datasets = getDatasets()
  const filteredDatasets = datasets.filter((d) => d.id !== id)

  if (filteredDatasets.length === datasets.length) {
    return false // Dataset not found
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredDatasets))
  return true
}

export function hasDatasetWithName(name: string, excludeId?: string): boolean {
  const datasets = getDatasets()
  return datasets.some((d) => d.name === name && d.id !== excludeId)
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

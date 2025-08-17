import type { DCFDataset, Input } from '@/types/dcf'

const STORAGE_KEY = 'dcf-datasets'

export function saveDataset(name: string, input: Input): DCFDataset {
  const datasets = getDatasets()
  const existingIndex = datasets.findIndex((d) => d.name === name)

  const dataset: DCFDataset = {
    id: existingIndex >= 0 ? datasets[existingIndex].id : generateId(),
    name,
    createdAt: new Date().toISOString(),
    input,
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

    const datasets: DCFDataset[] = JSON.parse(stored)
    return datasets.sort(
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

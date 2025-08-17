import { atom } from 'jotai'
import { runDCF } from '@/lib/dcf'
import type { Result } from '@/types/dcf'
import { DCFError, logError, DCFErrorType } from '@/lib/error-utils'
import { dcfInputAtom } from './dcf-input-atoms'

// Result state container
type DCFResultState = {
  result: Result | null
  error: DCFError | null
  isCalculating: boolean
}

// Combined result and error atom
export const dcfResultStateAtom = atom<DCFResultState>((get) => {
  try {
    const input = get(dcfInputAtom)
    const result = runDCF(input)
    
    return {
      result,
      error: null,
      isCalculating: false
    }
  } catch (error) {
    let dcfError: DCFError
    
    if (error instanceof DCFError) {
      dcfError = error
    } else {
      // Handle unexpected errors
      dcfError = new DCFError(
        DCFErrorType.NUMERICAL_INSTABILITY,
        `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
        undefined,
        undefined,
        { originalError: error }
      )
    }
    
    logError(dcfError, 'dcfResultAtom')
    
    return {
      result: null,
      error: dcfError,
      isCalculating: false
    }
  }
})

// Legacy result atom for backward compatibility
export const dcfResultAtom = atom<Result | null>((get) => {
  const state = get(dcfResultStateAtom)
  return state.result
})

// Error atom for accessing current error
export const currentDCFErrorAtom = atom<DCFError | null>((get) => {
  const state = get(dcfResultStateAtom)
  return state.error
})

// Derived atom for checking if calculation has errors
export const hasCalculationErrorAtom = atom((get) => {
  const error = get(currentDCFErrorAtom)
  return error !== null
})
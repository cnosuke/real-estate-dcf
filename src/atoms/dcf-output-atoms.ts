import { atom } from 'jotai'
import { runDCF } from '@/lib/dcf'
import type { Result } from '@/types/dcf'
import { dcfInputAtom } from './dcf-input-atoms'

export const dcfResultAtom = atom<Result>((get) => {
  const input = get(dcfInputAtom)
  return runDCF(input)
})

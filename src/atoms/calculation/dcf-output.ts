import { atom } from 'jotai'
import { runDCF } from '@/lib/dcf/dcf-calculator'
import { DCFValidator } from '@/lib/validation'
import { DCFError, DCFErrorFactory } from '@/lib/errors'
import type { Result } from '@/types/dcf'
import { dcfInputAtom } from './dcf-input'

// DCF計算状態管理
export enum DCFCalculationState {
  IDLE = 'idle',
  CALCULATING = 'calculating',
  SUCCESS = 'success',
  ERROR = 'error',
}

// DCF計算結果atom（非同期計算対応）
export const dcfResultAtom = atom<Result | null>(null)
const dcfCalculationStateAtom = atom<DCFCalculationState>(
  DCFCalculationState.IDLE,
)
const dcfCalculationErrorAtom = atom<DCFError | null>(null)

// DCF計算実行atom（副作用あり）
export const executeDCFCalculationAtom = atom(null, async (get, set) => {
  const input = get(dcfInputAtom)

  set(dcfCalculationStateAtom, DCFCalculationState.CALCULATING)
  set(dcfCalculationErrorAtom, null)
  set(dcfResultAtom, null)

  try {
    // バリデーション実行
    const validation = DCFValidator.validateComplete(input)
    if (!validation.isValid) {
      const firstError = validation.errors[0]
      set(dcfCalculationErrorAtom, firstError)
      set(dcfCalculationStateAtom, DCFCalculationState.ERROR)
      return
    }

    // DCF計算実行（重い処理）
    const result = await new Promise<Result>((resolve, reject) => {
      // 非同期化でUIブロッキングを防ぐ
      setTimeout(() => {
        try {
          const calcResult = runDCF(input)
          resolve(calcResult)
        } catch (error) {
          reject(error)
        }
      }, 0)
    })

    set(dcfResultAtom, result)
    set(dcfCalculationStateAtom, DCFCalculationState.SUCCESS)

    // 警告があれば表示用に設定
    if (result.warnings && result.warnings.length > 0) {
      // 最初の警告をエラー表示に設定（警告レベル）
      set(dcfCalculationErrorAtom, result.warnings[0] as DCFError)
    }
  } catch (error) {
    console.error('DCF calculation failed:', error)
    const dcfError =
      error instanceof DCFError
        ? error
        : DCFErrorFactory.createCalculationError('dcf_execution', {
            originalError: error,
          })

    set(dcfCalculationErrorAtom, dcfError)
    set(dcfCalculationStateAtom, DCFCalculationState.ERROR)
  }
})

// 自動計算atom（入力変更時に自動実行）
export const autoCalculateDCFAtom = atom(
  (get) => {
    const input = get(dcfInputAtom)
    const state = get(dcfCalculationStateAtom)

    // 入力が変更されたら自動で計算実行をトリガー
    if (state !== DCFCalculationState.CALCULATING) {
      // 次のレンダリングサイクルで実行
      return { shouldCalculate: true, input }
    }
    return { shouldCalculate: false, input }
  },
  (get, set) => {
    const auto = get(autoCalculateDCFAtom)
    if (auto.shouldCalculate) {
      set(executeDCFCalculationAtom)
    }
  },
)

// 計算状態の便利なselector
export const isCalculatingAtom = atom(
  (get) => get(dcfCalculationStateAtom) === DCFCalculationState.CALCULATING,
)

export const hasCalculationErrorAtom = atom(
  (get) => get(dcfCalculationStateAtom) === DCFCalculationState.ERROR,
)

const calculationSuccessAtom = atom(
  (get) => get(dcfCalculationStateAtom) === DCFCalculationState.SUCCESS,
)

// 後方互換性のためのatom（既存のコードとの互換性維持）
export const currentDCFErrorAtom = atom<DCFError | null>((get) => {
  return get(dcfCalculationErrorAtom)
})

// 既存の結果状態atom（後方互換性のため）
const dcfResultStateAtom = atom((get) => {
  const result = get(dcfResultAtom)
  const error = get(dcfCalculationErrorAtom)
  const isCalculating = get(isCalculatingAtom)

  return {
    result,
    error,
    isCalculating,
  }
})

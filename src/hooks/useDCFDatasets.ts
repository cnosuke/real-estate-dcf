import { useAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import {
  discountAssetAtom,
  discountEquityAtom,
  exitCostRateAtom,
  i0Atom,
  inflationAtom,
  loanAmountAtom,
  loanRateAtom,
  loanTermAtom,
  monthlyOpex0Atom,
  p0Atom,
  prepayPenaltyRateAtom,
  priceDecayAtom,
  rentDecayAtom,
  rentMonthly0Atom,
  taxAnnualFixedAtom,
  vacancyAtom,
  yearsAtom,
} from '@/atoms/dcf-input-atoms'
import {
  deleteDataset,
  getDatasets,
  hasDatasetWithName,
  saveDataset,
} from '@/lib/dcf/dataset-storage'
import type { DCFDataset, Input } from '@/types/dcf'

export function useDCFDatasets() {
  const [datasets, setDatasets] = useState<DCFDataset[]>([])

  // Get all atom setters for loading data
  const [, setP0] = useAtom(p0Atom)
  const [, setI0] = useAtom(i0Atom)
  const [, setRentMonthly0] = useAtom(rentMonthly0Atom)
  const [, setMonthlyOpex0] = useAtom(monthlyOpex0Atom)
  const [, setVacancy] = useAtom(vacancyAtom)
  const [, setInflation] = useAtom(inflationAtom)
  const [, setRentDecay] = useAtom(rentDecayAtom)
  const [, setPriceDecay] = useAtom(priceDecayAtom)
  const [, setTaxAnnualFixed] = useAtom(taxAnnualFixedAtom)
  const [, setExitCostRate] = useAtom(exitCostRateAtom)
  const [, setYears] = useAtom(yearsAtom)
  const [, setDiscountAsset] = useAtom(discountAssetAtom)
  const [, setDiscountEquity] = useAtom(discountEquityAtom)
  const [, setLoanAmount] = useAtom(loanAmountAtom)
  const [, setLoanRate] = useAtom(loanRateAtom)
  const [, setLoanTerm] = useAtom(loanTermAtom)
  const [, setPrepayPenaltyRate] = useAtom(prepayPenaltyRateAtom)

  // Get current input values from atoms
  const [p0] = useAtom(p0Atom)
  const [i0] = useAtom(i0Atom)
  const [rentMonthly0] = useAtom(rentMonthly0Atom)
  const [monthlyOpex0] = useAtom(monthlyOpex0Atom)
  const [vacancy] = useAtom(vacancyAtom)
  const [inflation] = useAtom(inflationAtom)
  const [rentDecay] = useAtom(rentDecayAtom)
  const [priceDecay] = useAtom(priceDecayAtom)
  const [taxAnnualFixed] = useAtom(taxAnnualFixedAtom)
  const [exitCostRate] = useAtom(exitCostRateAtom)
  const [years] = useAtom(yearsAtom)
  const [discountAsset] = useAtom(discountAssetAtom)
  const [discountEquity] = useAtom(discountEquityAtom)
  const [loanAmount] = useAtom(loanAmountAtom)
  const [loanRate] = useAtom(loanRateAtom)
  const [loanTerm] = useAtom(loanTermAtom)
  const [prepayPenaltyRate] = useAtom(prepayPenaltyRateAtom)

  const refreshDatasets = useCallback(() => {
    setDatasets(getDatasets())
  }, [])

  useEffect(() => {
    refreshDatasets()
  }, [refreshDatasets])

  const getCurrentInput = (): Input => ({
    p0,
    i0,
    rentMonthly0,
    monthlyOpex0,
    vacancy,
    inflation,
    rentDecay,
    priceDecay,
    taxAnnualFixed,
    exitCostRate,
    years,
    discountAsset,
    discountEquity,
    loanAmount,
    loanRate,
    loanTerm,
    prepayPenaltyRate,
  })

  const saveCurrentDataset = (name: string): DCFDataset => {
    const input = getCurrentInput()
    const savedDataset = saveDataset(name, input)
    refreshDatasets()
    return savedDataset
  }

  const loadDataset = (dataset: DCFDataset) => {
    const { input } = dataset

    setP0(input.p0)
    setI0(input.i0)
    setRentMonthly0(input.rentMonthly0)
    setMonthlyOpex0(input.monthlyOpex0)
    setVacancy(input.vacancy)
    setInflation(input.inflation)
    setRentDecay(input.rentDecay)
    setPriceDecay(input.priceDecay)
    setTaxAnnualFixed(input.taxAnnualFixed)
    setExitCostRate(input.exitCostRate)
    setYears(input.years)
    setDiscountAsset(input.discountAsset)
    setDiscountEquity(input.discountEquity)
    setLoanAmount(input.loanAmount)
    setLoanRate(input.loanRate)
    setLoanTerm(input.loanTerm)
    setPrepayPenaltyRate(input.prepayPenaltyRate || 0)
  }

  const removeDataset = (id: string): boolean => {
    const success = deleteDataset(id)
    if (success) {
      refreshDatasets()
    }
    return success
  }

  const checkNameExists = (name: string, excludeId?: string): boolean => {
    return hasDatasetWithName(name, excludeId)
  }

  return {
    datasets,
    saveCurrentDataset,
    loadDataset,
    removeDataset,
    checkNameExists,
    refreshDatasets,
  }
}

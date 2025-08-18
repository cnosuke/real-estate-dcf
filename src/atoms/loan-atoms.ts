/**
 * @deprecated This file is being migrated to the new atom structure.
 * Please use atoms from '@/atoms/calculation' instead.
 * This file will be removed in a future version.
 */
import { atom } from 'jotai'

// Loan parameters - realistic investment loan conditions
export const loanAmountAtom = atom(31_500_000) // Loan amount (70% LTV, standard for investment)
export const loanRateAtom = atom(0.025) // Loan rate (current investment loan rates)
export const loanTermAtom = atom(25) // Loan term (standard for investment properties)
export const prepayPenaltyRateAtom = atom(0.0) // Prepayment penalty rate (minimal for most loans)

// Loan calculation atoms
export const monthlyPaymentAtom = atom((get) => {
  const principal = get(loanAmountAtom)
  const annualRate = get(loanRateAtom)
  const termYears = get(loanTermAtom)
  
  if (principal === 0 || annualRate === 0) return 0
  
  const monthlyRate = annualRate / 12
  const totalPayments = termYears * 12
  
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
         (Math.pow(1 + monthlyRate, totalPayments) - 1)
})

export const totalInterestAtom = atom((get) => {
  const monthlyPayment = get(monthlyPaymentAtom)
  const principal = get(loanAmountAtom)
  const termYears = get(loanTermAtom)
  
  return (monthlyPayment * termYears * 12) - principal
})
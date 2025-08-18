/**
 * @deprecated This file is being migrated to the new atom structure.
 * Please use atoms from '@/atoms/calculation' instead.
 * This file will be removed in a future version.
 */
import { atom } from 'jotai'

// Property basic information atoms - realistic market values
export const p0Atom = atom(45_000_000) // Property purchase price (typical urban investment property)
export const i0Atom = atom(1_800_000) // Initial costs (4% of property price - realistic for Japan)
export const rentMonthly0Atom = atom(160_000) // Initial monthly rent (target yield ~4.3%)
export const monthlyOpex0Atom = atom(25_000) // Monthly operating expenses (realistic management costs)
export const taxAnnualFixedAtom = atom(180_000) // Fixed property tax (realistic for 45M property)

// Property-related derived atoms
export const purchasePriceWithCostsAtom = atom((get) => 
  get(p0Atom) + get(i0Atom)
)
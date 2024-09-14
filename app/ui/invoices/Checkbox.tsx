'use client'

import { checkFilteredInvoices } from "@/app/lib/actions"
import { useState } from "react"

export function Checkbox ({ query, hasUnchecked }: { query: string, hasUnchecked: boolean }) {
  const [checked, setChecked] = useState(!hasUnchecked)

  const handleCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    setChecked(isChecked)
    checkFilteredInvoices(isChecked, query)
  }

  return (
    <div>
    <input
      type="checkbox"
      id="check-all"
      className="hidden"
      onChange={handleCheckAll}
      checked={checked}
    />
    <label
      htmlFor="check-all"
      className={checked
          ? "bg-red-600 rounded p-2 text-gray-200"
          : "bg-green-600 rounded p-2 text-gray-200"
      }
    >
      {checked ? 'Uncheck' : 'Check All'}
    </label>
  </div>
  )
}
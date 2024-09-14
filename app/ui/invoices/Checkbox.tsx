'use client'

import { checkFilteredInvoices } from "@/app/lib/actions"
import { useEffect, useState } from "react"

export function Checkbox ({ query, allChecked }: { query: string, allChecked: boolean }) {
  const [checked, setChecked] = useState(allChecked)
  
  useEffect (() => setChecked(allChecked), [allChecked])

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
'use client'

import { checkAllDBInvoices } from "@/app/lib/actions"
import { useState } from "react"

export function Checkbox ({
  //handleCheckAll
}: {
  //handleCheckAll: (checked: boolean) => void
}) {
  const [checked, setChecked] = useState(false)

  const handleCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    setChecked(isChecked)
    checkAllDBInvoices(isChecked)
    console.log('all:', isChecked)
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
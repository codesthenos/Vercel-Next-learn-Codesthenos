'use client'

import type { InvoicesTable } from "@/app/lib/definitions"
import { useState } from "react"

export function IndividualCheckbox ({
  handleIndividualCheck,
  invoice
}: {
  handleIndividualCheck: ({ checked, id }: { checked: boolean, id: string }) => void,
  invoice: InvoicesTable
}) {
  const [individualChecked, setIndividualChecked] = useState(false)

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    setIndividualChecked(isChecked)
    handleIndividualCheck({ checked: isChecked, id: invoice.id})
    console.log('individual:', isChecked)
  }
  console.log(invoice.checked)

  return (
    <div>
      <input
        type="checkbox"
        id={invoice.id}
        className="hidden"
        onChange={handleCheck}
        checked={individualChecked}
      />
      <label
        htmlFor={invoice.id}
        className={invoice.checked
            ? "bg-red-600 rounded p-2 text-gray-200"
            : "bg-green-600 rounded p-2 text-gray-200"
        }
      >
        {invoice.checked ? 'Uncheck' : 'Check'}
      </label>
    </div>
  )
}
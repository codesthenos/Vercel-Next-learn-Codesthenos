'use client'

import { checkInvoiceById } from "@/app/lib/actions"
import { useState } from "react"

export function IndividualCheckbox ({ id, checked }: { id: string, checked?: boolean }) {
  const [individualChecked, setIndividualChecked] = useState(false)

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    setIndividualChecked(isChecked)
    checkInvoiceById(isChecked, id)
    console.log('individual:', isChecked)
  }

  return (
    <div>
      <input
        type="checkbox"
        id={id}
        className="hidden"
        onChange={handleCheck}
        checked={checked && individualChecked}
      />
      <label
        htmlFor={id}
        className={checked && individualChecked
            ? "bg-red-600 rounded p-2 text-gray-200"
            : "bg-green-600 rounded p-2 text-gray-200"
        }
      >
        {checked && individualChecked ? 'Uncheck' : 'Check'}
      </label>
    </div>
  )
}
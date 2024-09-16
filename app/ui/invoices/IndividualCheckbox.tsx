'use client'

import { checkInvoiceById } from "@/app/lib/actions"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

export default function IndividualCheckbox ({ id, checked, query, currentPage }: { id: string, checked: boolean, query: string, currentPage: number }) {
  const [individualChecked, setIndividualChecked] = useState(checked)

  useEffect(() => { setIndividualChecked(checked)}, [checked])

  const { replace } = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const handleCheck = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    setIndividualChecked(isChecked)
    await checkInvoiceById(isChecked, id)

    const params = new URLSearchParams(searchParams)
    params.set('page', `${currentPage}`)
    params.set('search', query)

    replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div>
      <input
        type="checkbox"
        id={id}
        className="hidden"
        onChange={handleCheck}
        checked={individualChecked}
        //disabled={state.status === 'pending'}
      />
      <label
        htmlFor={id}
        className={
          individualChecked
            ? "bg-red-600 rounded p-2 text-gray-200"
            : "bg-green-600 rounded p-2 text-gray-200"
        }
      >
        {individualChecked ? 'Uncheck' : 'Check'}
      </label>
    </div>
  )
}
'use client'

import { checkFilteredInvoices } from "@/app/lib/actions"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function Checkbox ({ query, allChecked, currentPage }: { query: string, allChecked: boolean, currentPage: number }) {
  const [checked, setChecked] = useState(allChecked)
  
  useEffect (() => setChecked(allChecked), [allChecked])
  
  const { replace } = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const handleCheckAll = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    setChecked(isChecked)
    await checkFilteredInvoices(isChecked, query)

    const params = new URLSearchParams(searchParams)
    params.set('page', `${currentPage}`)
    params.set('search', query)

    replace(`${pathname}?${params.toString()}`)
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
      {checked ? 'Uncheck All' : 'Check All'}
    </label>
  </div>
  )
}
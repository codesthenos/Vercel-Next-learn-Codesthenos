'use client'

import { checkInvoiceById } from "@/app/lib/actions"
import { useEffect, useState/*, useActionState*/ } from "react"

export function IndividualCheckbox ({ id, checked }: { id: string, checked: boolean }) {
  const [individualChecked, setIndividualChecked] = useState(checked)

  //const initialState: { status: string, message: string | null } = { status: 'idle', message: null }
  
  //const checkInvId = checkInvoiceById.bind(null, checked, id)
  
  //const [state, dispatchCheckInvoice] = useActionState(checkInvId, initialState)

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    setIndividualChecked(isChecked)
    checkInvoiceById(isChecked, id)
  }

  useEffect(() => { setIndividualChecked(checked)}, [checked])

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
'use server'

import { z } from 'zod'
import { customers } from './placeholder-data'

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string()
})

const CreateInvoice = FormSchema.omit({ id: true, date: true })

export async function createInvoice(formData:FormData) {
  // raw data not validated
  const rawFormData = {
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status')
  }
  console.log(rawFormData)
  console.log(typeof rawFormData.customerId)
  console.log(typeof rawFormData.amount)
  console.log(typeof rawFormData.status)

  // validated data with zod
  const validatedData = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status')
  })
  const {customerId, amount, status } = validatedData

  console.log(validatedData)
  console.log(typeof customerId)
  console.log(typeof amount)
  console.log(typeof status)
}
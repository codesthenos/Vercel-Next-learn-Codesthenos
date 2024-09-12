'use server'

import { z } from 'zod'
import { sql } from '@vercel/postgres'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Create Schema and function to add to the database
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

  // tenemos customerId y status, vamos a transformar amount a centimos y sacar el date
  const amountInCents = amount * 100
  const date = new Date().toISOString().split('T')[0]

  // insertamos en la base de datos el objeto compuesto de los datos obtenidos

  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `

  // esto es para limpiar las cookies al volver a invoices y asegurarnos hacer el fetch para traer la creada
  revalidatePath('/dashboard/invoices')
  // esto es para redireccionar
  redirect('/dashboard/invoices')
}

// Update Schema and function to update the invoice in the database

const UpdateInvoice = FormSchema.omit({ id: true, date: true })

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status')
  })
  const amountInCents = amount * 100

  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `

  revalidatePath('/dashboard/invoices')
  redirect('/dashboard/invoices')
}

export async function deleteInvoice (id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`

  revalidatePath('/dashboard/invoices')
}
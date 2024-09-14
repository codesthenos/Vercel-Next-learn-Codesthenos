'use server'

import { z } from 'zod'
import { sql } from '@vercel/postgres'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type State = {
  errors?: {
    customerId?: string[]
    amount?: string[]
    status?: string[]
  }
  message?: string | null
}

// Create Schema and function to add to the database
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer'
  }),
  amount: z.coerce.number().gt(0, {
    message: 'Please enter an amount greater than $0.'
  }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status'
  }),
  date: z.string()
})

const CreateInvoice = FormSchema.omit({ id: true, date: true })

export async function createInvoice(prevState: State, formData:FormData) {
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
  const validatedData = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status')
  })

  // check if form validation fails
  if (!validatedData.success) {
    return {
      errors: validatedData.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice'
    }
  }

  const {customerId, amount, status } = validatedData.data

  console.log(validatedData.data)

  // tenemos customerId y status, vamos a transformar amount a centimos y sacar el date
  const amountInCents = amount * 100
  const date = new Date().toISOString().split('T')[0]

  // insertamos en la base de datos el objeto compuesto de los datos obtenidos

  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `
  } catch (error) {
    return { message: 'Database Error: Failed to Create Invoice.' }
  }

  // esto es para limpiar las cookies al volver a invoices y asegurarnos hacer el fetch para traer la creada
  revalidatePath('/dashboard/invoices')
  // esto es para redireccionar
  redirect('/dashboard/invoices')
}

// Update Schema and function to update the invoice in the database

const UpdateInvoice = FormSchema.omit({ id: true, date: true })

export async function updateInvoice(id: string, prevState: State, formData: FormData) {
  const validatedData = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status')
  })

  if (!validatedData.success) {
    return {
      errors: validatedData.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice'
    }
  }

  const {customerId, amount, status } = validatedData.data

  const amountInCents = amount * 100

  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
    `
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.'}
  }

  revalidatePath('/dashboard/invoices')
  redirect('/dashboard/invoices')
}

export async function deleteInvoice (id: string) {
  // throw new Error('Failed to Delete Invoice')
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`

    revalidatePath('/dashboard/invoices')

    return { message: 'Deleted Invoice.' }
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' }
  }
}

export async function checkFilteredInvoices (checked: boolean, query: string) {
  try {
    await sql`
    UPDATE invoices
    SET checked = ${checked}
    FROM customers
    WHERE invoices.customer_id = customers.id
      AND (
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      )`
  } catch (error) {
    return { message: 'Database Error: Failed to Check Invoices'}
  }
  revalidatePath('/dashboard/invoices')
}

export async function checkInvoiceById (checked: boolean, id: string) {
  try {
    await sql`
    UPDATE invoices
    SET checked = ${checked}
    WHERE id = ${id}
    `
  } catch (error) {
    return { message: 'Database Error: Failed to Check Invoices'}
  }
  revalidatePath('/dashboard/invoices')
}
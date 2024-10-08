'use server'

import { z } from 'zod'
import { sql } from '@vercel/postgres'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { InvoicesTable } from '@/app/lib/definitions'
import { getHtml } from '@/app/lib/utils'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

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
  revalidatePath('/dashboard/invoice')
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

export async function downloadJSON (id: string) {
  try {
    const newData = await sql<InvoicesTable>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        invoices.checked,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE invoices.id = ${id};
    `

    const fileContent = JSON.stringify(newData.rows, null, 2)

    return { fileContent }
  } catch (error) {
    return { error: 'Error downloading the file' } 
  }
}

export async function downloadCheckedJSON (query: string) {
  try {
    const newData = await sql<InvoicesTable>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        invoices.checked,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        (customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`})
        AND invoices.checked = true
      ORDER BY invoices.date DESC;
    `
    const fileContent = JSON.stringify(newData.rows, null, 2)

    return { fileContent }
  } catch (error) {
    return { error: 'Error downloading files' }
  }
}

export async function downloadCSV (id: string) {
  try {
    const newData = await sql<InvoicesTable>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        invoices.checked,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE invoices.id = ${id};
    `

    const headers = ['Date', 'Status', 'Amount', 'Customer Name', 'Customer Email', 'Invoice Id']

    const csvRows = [
      headers.join(','),
      ...newData.rows.map(row => [
        row.date.toString().split(' ').slice(0, 4).join('/'),
        row.status,
        `${row.amount / 100}$`,
        row.name,
        row.email,
        row.id
      ].join(','))
    ]

    const fileContent = csvRows.join('\n')

    return { fileContent }
  } catch (error) {
    return { error: 'Error downloading the file\n' + error } 
  }
}

export async function downloadCheckedCSV (query: string) {
  try {
    const newData = await sql<InvoicesTable>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        invoices.checked,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        (customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`})
        AND invoices.checked = true
      ORDER BY invoices.date DESC;
    `

    const headers = ['Date', 'Status', 'Amount', 'Customer Name', 'Customer Email', 'Invoice Id']

    const csvRows = [
      headers.join(','),
      ...newData.rows.map(row => [
        row.date.toString().split(' ').slice(0, 4).join('/'),
        row.status,
        `${row.amount / 100}$`,
        row.name,
        row.email,
        row.id
      ].join(','))
    ]

    const fileContent = csvRows.join('\n')

    return { fileContent }
  } catch (error) {
    return { error: 'Error downloading files' }
  }
}

export async function downloadTXT (id: string) {
  try {
    const newData = await sql<{
      id: string;
      name: string;
      email: string;
      date: string;
      amount: number;
      status: "pending" | "paid";
  }>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE invoices.id = ${id};
    `

    const txt = newData.rows.map(row => {
      return `
          Date:  ${row.date.toString().split(' ').slice(0, 4).join('/')}
      
        Status:  ${row.status}
      
        Amount:  ${row.amount / 100}$
      
 Customer Name:  ${row.name}
      
Customer Email:  ${row.email}
      
    Invoice Id:  ${row.id}      
`
    }).join('\n-------------------------------------------------------------\n')

    const fileContent = txt

    return { fileContent }
  } catch (error) {
    return { error: 'Error downloading the file\n' + error } 
  }
}

export async function downloadCheckedTXT (query: string) {
  try {
    const newData = await sql<InvoicesTable>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        invoices.checked,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        (customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`})
        AND invoices.checked = true
      ORDER BY invoices.date DESC;
    `

    const txt = newData.rows.map(row => {
      return `
          Date:  ${row.date.toString().split(' ').slice(0, 4).join('/')}
      
        Status:  ${row.status}
      
        Amount:  ${row.amount / 100}$
      
 Customer Name:  ${row.name}
      
Customer Email:  ${row.email}
      
    Invoice Id:  ${row.id}      
`
    }).join('\n-------------------------------------------------------------\n')

    return { fileContent: txt }
  } catch (error) {
    return { error: 'Error downloading files' }
  }
}

export async function downloadHTML (id: string) {
  try {
    const newData = await sql<{
      id: string;
      name: string;
      email: string;
      date: string;
      amount: number;
      status: "pending" | "paid";
      image_url: string;
  }>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE invoices.id = ${id};
    `

    const html = getHtml(newData)

    const fileContent = html

    return { fileContent }
  } catch (error) {
    return { error: 'Error downloading the file\n' + error } 
  }
}

export async function downloadCheckedHTML (query: string) {
  try {
    const newData = await sql<InvoicesTable>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        invoices.checked,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        (customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`})
        AND invoices.checked = true
      ORDER BY invoices.date DESC;
    `
    return { fileContent: getHtml(newData) }
  } catch (error) {
    return { error: 'Error downloading files' }
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn('credentials', formData)
  } catch (error) {
    if (error instanceof AuthError) {
      return error.type === 'CredentialsSignin' ? 'Invalid credentials' : 'Something went wrong'
    }
    throw error
  }
}
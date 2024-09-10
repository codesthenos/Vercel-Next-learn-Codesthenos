'use server'

export async function createInvoice(formData:FormData) {
  const rawFormData = {
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status')
  }
  console.log(rawFormData)
  console.log(typeof rawFormData.customerId)
  console.log(typeof rawFormData.amount)
  console.log(typeof rawFormData.status)
}
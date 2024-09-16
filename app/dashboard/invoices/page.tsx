import { fetchFilteredInvoicesChecked, fetchInvoicesPages } from "@/app/lib/data";
import { lusitana } from "@/app/ui/fonts";
import { CreateInvoice } from "@/app/ui/invoices/buttons";
import Checkbox from "@/app/ui/invoices/Checkbox";
import DownloadCheckedButton from "@/app/ui/invoices/DownloadCheckedInvoicesTXT";
import Pagination from "@/app/ui/invoices/pagination";
import InvoicesTable from "@/app/ui/invoices/table";
import Search from "@/app/ui/search";
import { InvoicesTableSkeleton } from "@/app/ui/skeletons";
import { Suspense } from "react";

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    search?: string
    page?: string
  }
}) {
  const query = searchParams?.search || ''
  const currentPage = Number(searchParams?.page) || 1
  const [totalPages, allChecked] = await Promise.all([
    fetchInvoicesPages(query),
    fetchFilteredInvoicesChecked(query)
  ])

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2x1`}>Invoices</h1>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <div className="flex gap-2">
          <Checkbox query={query} allChecked={allChecked} currentPage={currentPage} />
          <DownloadCheckedButton query={query} />
        </div>
        <Search placeholder="Search invoices..." />
        <CreateInvoice />
      </div>

      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <InvoicesTable query={query} currentPage={currentPage} />
      </Suspense>

      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
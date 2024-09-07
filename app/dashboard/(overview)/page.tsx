import { lusitana } from "@/app/ui/fonts";
import { fetchCardData, fetchLatestInvoices } from "@/app/lib/data";
import RevenueChart from "@/app/ui/dashboard/revenue-chart";
import LatestInvoices from "@/app/ui/dashboard/latest-invoices";
import { Card } from "@/app/ui/dashboard/cards";
import { Suspense } from "react";
import { RevenueChartSkeleton } from "@/app/ui/skeletons";

export default async function Page() {
  // Waterfall fetching
  //const revenue = await fetchRevenue()
  //const latestInvoices = await fetchLatestInvoices()
  //const {
  //  numberOfCustomers,
  //  numberOfInvoices,
  //  totalPaidInvoices,
  //  totalPendingInvoices
  //} = await fetchCardData()
  
  // Pararell fetching
  const data = await Promise.all([fetchLatestInvoices(), fetchCardData()])

  const latestInvoices = data[0]
  const {
    totalPaidInvoices,
    totalPendingInvoices,
    numberOfInvoices,
    numberOfCustomers
  } = data[1]

  return (
    <main>
      <h1 className={`${lusitana.className} antialiased mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Collected" value={totalPaidInvoices} type="collected" />
        <Card title="Pending" value={totalPendingInvoices} type="pending" />
        <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
        <Card title="Total Customers" value={numberOfCustomers} type="customers" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        <LatestInvoices latestInvoices={latestInvoices} />
      </div>
    </main>
  );
}

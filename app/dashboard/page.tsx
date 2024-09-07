import { lusitana } from "@/app/ui/fonts";
import { fetchCardData, fetchLatestInvoices, fetchRevenue } from "@/app/lib/data";
import RevenueChart from "@/app/ui/dashboard/revenue-chart";
import LatestInvoices from "@/app/ui/dashboard/latest-invoices";
import { Card } from "@/app/ui/dashboard/cards";

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
  const data = await Promise.all([fetchRevenue(), fetchLatestInvoices(), fetchCardData()])
  const revenue = data[0]
  const latestInvoices = data[1]
  const {
    totalPaidInvoices,
    totalPendingInvoices,
    numberOfInvoices,
    numberOfCustomers
  } = data[2]

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
        <div>
          <RevenueChart revenue={revenue} />
        </div>
        <div>
          <LatestInvoices latestInvoices={latestInvoices} />
        </div>
      </div>
    </main>
  );
}

import { lusitana } from "@/app/ui/fonts";
import { fetchRevenue } from "@/app/lib/data";
import RevenueChart from "@/app/ui/dashboard/revenue-chart";

export default async function Page() {
  const revenue = await fetchRevenue()

  return (
    <main>
      <h1 className={`${lusitana.className} antialiased mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          Paid invoices
        </div>
        <div>
          Pending invoices
        </div>
        <div>
          Total invoices
        </div>
        <div>
          Total customers
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <div>
          <RevenueChart revenue={revenue} />
        </div>
        <div>
          Latest invoices
        </div>
      </div>
    </main>
  );
}

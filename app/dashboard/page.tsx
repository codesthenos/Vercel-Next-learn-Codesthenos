import { lusitana } from "@/app/ui/fonts";

export default function Page() {
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
    </main>
  );
}

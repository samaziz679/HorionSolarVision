export const dynamic = "force-dynamic"
export const revalidate = 0
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"
import SaleForm from "@/components/sales/sale-form"
import { createClient } from "@/lib/supabase/server"

export default async function NewSalePage() {
  const supabase = createClient()
  const { data: products } = await supabase.from("products").select("id, name, price")
  const { data: clientsData } = await supabase.from("clients").select("id, first_name, last_name")

  const clients =
    clientsData?.map((client) => ({
      id: client.id,
      name: `${client.first_name} ${client.last_name}`,
    })) || []

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/sales">Sales</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>New Sale</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Create New Sale</h1>
        <SaleForm products={products || []} clients={clients} />
      </div>
    </main>
  )
}

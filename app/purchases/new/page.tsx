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
import PurchaseForm from "@/components/purchases/purchase-form"
import { createClient } from "@/lib/supabase/server"

export default async function NewPurchasePage() {
  const supabase = createClient()
  const { data: products } = await supabase.from("products").select("id, name")
  const { data: suppliers } = await supabase.from("suppliers").select("id, name")

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
              <Link href="/purchases">Purchases</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>New Purchase</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Create New Purchase</h1>
        <PurchaseForm products={products || []} suppliers={suppliers || []} />
      </div>
    </main>
  )
}

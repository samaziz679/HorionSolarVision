import { fetchPurchaseById } from "@/lib/data/purchases"
import PurchaseForm from "@/components/purchases/purchase-form"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function EditPurchasePage({ params }: { params: { id: string } }) {
  const id = params.id
  const purchase = await fetchPurchaseById(id)

  if (!purchase) {
    notFound()
  }

  const supabase = createClient()
  const { data: products } = await supabase.from("products").select("id, name")
  const { data: suppliers } = await supabase.from("suppliers").select("id, name")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit Purchase</h1>
      <PurchaseForm purchase={purchase} products={products || []} suppliers={suppliers || []} />
    </div>
  )
}

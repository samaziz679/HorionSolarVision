import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ProductList, { type InventoryProduct } from "@/components/inventory/product-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function InventoryPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Use your actual schema columns
  const { data, error } = await supabase
    .from("products")
    .select(
      [
        "id",
        "name",
        "unit",
        "quantity",
        "prix_achat",
        "prix_vente_detail_1",
        "prix_vente_detail_2",
        "prix_vente_gros",
        "seuil_stock_bas",
        "description",
        "created_at",
        "created_by",
      ].join(","),
    )

  if (error) {
    console.error("Inventory fetch error:", error)
  }

  const products: InventoryProduct[] = (data ?? []).map((p: any) => ({
    id: String(p.id),
    name: String(p.name ?? ""),
    unit: p.unit ?? null,
    quantity: Number(p.quantity ?? 0),
    prix_achat: p.prix_achat != null ? Number(p.prix_achat) : null,
    prix_vente_detail_1: p.prix_vente_detail_1 != null ? Number(p.prix_vente_detail_1) : null,
    prix_vente_detail_2: p.prix_vente_detail_2 != null ? Number(p.prix_vente_detail_2) : null,
    prix_vente_gros: p.prix_vente_gros != null ? Number(p.prix_vente_gros) : null,
    seuil_stock_bas: p.seuil_stock_bas != null ? Number(p.seuil_stock_bas) : null,
    description: p.description ?? null,
    created_at: String(p.created_at ?? new Date().toISOString()),
    created_by: p.created_by ? String(p.created_by) : null,
  }))

  return (
    <main className="flex-1 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductList products={products} />
        </CardContent>
      </Card>
    </main>
  )
}

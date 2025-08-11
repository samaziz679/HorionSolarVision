import { notFound } from "next/navigation"
import { fetchPurchaseById } from "@/lib/data/purchases"
import { fetchProducts } from "@/lib/data/products"
import { fetchSuppliers } from "@/lib/data/suppliers"
import { EditPurchaseForm } from "@/components/purchases/edit-purchase-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type PageProps = {
  params: {
    id: string
  }
}

export default async function EditPurchasePage({ params }: PageProps) {
  const purchase = await fetchPurchaseById(params.id)
  if (!purchase) {
    notFound()
  }

  const products = await fetchProducts()
  const suppliers = await fetchSuppliers()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Purchase</CardTitle>
      </CardHeader>
      <CardContent>
        <EditPurchaseForm purchase={purchase} products={products} suppliers={suppliers} />
      </CardContent>
    </Card>
  )
}

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
  const { id } = params
  const [purchase, products, suppliers] = await Promise.all([fetchPurchaseById(id), fetchProducts(), fetchSuppliers()])

  if (!purchase) {
    notFound()
  }

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

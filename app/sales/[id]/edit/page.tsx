import { notFound } from "next/navigation"
import { fetchSaleById } from "@/lib/data/sales"
import { fetchProducts } from "@/lib/data/products"
import { fetchClients } from "@/lib/data/clients"
import { EditSaleForm } from "@/components/sales/edit-sale-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type PageProps = {
  params: {
    id: string
  }
}

export default async function EditSalePage({ params }: PageProps) {
  const sale = await fetchSaleById(params.id)
  if (!sale) {
    notFound()
  }

  const products = await fetchProducts()
  const clients = await fetchClients()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Sale</CardTitle>
      </CardHeader>
      <CardContent>
        <EditSaleForm sale={sale} products={products} clients={clients} />
      </CardContent>
    </Card>
  )
}

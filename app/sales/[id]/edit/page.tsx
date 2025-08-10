import { notFound } from "next/navigation"
import { fetchSaleById } from "@/lib/data/sales"
import { fetchProducts } from "@/lib/data/products"
import { fetchClients } from "@/lib/data/clients"
import EditSaleForm from "@/components/sales/edit-sale-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type PageProps = {
  params: {
    id: string
  }
}

export default async function EditSalePage({ params }: PageProps) {
  const id = Number(params.id)
  if (isNaN(id)) {
    notFound()
  }

  const [sale, products, clients] = await Promise.all([fetchSaleById(id), fetchProducts(), fetchClients()])

  if (!sale) {
    notFound()
  }

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

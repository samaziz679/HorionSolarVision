import { notFound } from "next/navigation"
import { fetchSaleById } from "@/lib/data/sales"
import { fetchProducts } from "@/lib/data/products"
import { fetchClients } from "@/lib/data/clients"
import { EditSaleForm } from "@/components/sales/edit-sale-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function EditSalePage({ params }) {
  const id = Number(params.id)
  if (isNaN(id)) {
    notFound()
  }

  const [sale, products, clients] = await Promise.all([fetchSaleById(id), fetchProducts(), fetchClients()])

  if (!sale) {
    notFound()
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Edit Sale #{sale.id}</CardTitle>
          </CardHeader>
          <CardContent>
            <EditSaleForm sale={sale} products={products} clients={clients} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

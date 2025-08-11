import { notFound } from "next/navigation"
import { fetchSaleById } from "@/lib/data/sales"
import { fetchProducts } from "@/lib/data/products"
import { fetchClients } from "@/lib/data/clients"
import SaleForm from "@/components/sales/sale-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type PageProps = {
  params: {
    id: string
  }
}

export default async function EditSalePage({ params }: PageProps) {
  const id = params.id
  const [sale, products, clients] = await Promise.all([fetchSaleById(id), fetchProducts(), fetchClients()])

  if (!sale) {
    notFound()
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Edit Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <SaleForm sale={sale} products={products} clients={clients} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

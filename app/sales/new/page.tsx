import { fetchProducts } from "@/lib/data/products"
import { fetchClients } from "@/lib/data/clients"
import { SaleForm } from "@/components/sales/sale-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function NewSalePage() {
  const [products, clients] = await Promise.all([fetchProducts(), fetchClients()])

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Create New Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <SaleForm products={products} clients={clients} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

import { notFound } from "next/navigation"
import { fetchSaleById } from "@/lib/data/sales"
import { fetchClients } from "@/lib/data/clients"
import { fetchProducts } from "@/lib/data/products"
import SaleForm from "@/components/sales/sale-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"

type PageProps = {
  params: {
    id: string
  }
}

export default async function EditSalePage({ params }: PageProps) {
  const { id } = params

  const [sale, clientsData, productsData] = await Promise.all([fetchSaleById(id), fetchClients(), fetchProducts()])

  if (!sale) {
    notFound()
  }

  const clients = clientsData.map((client) => ({
    id: client.id,
    name: `${client.first_name} ${client.last_name}`,
  }))

  const products = productsData.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
  }))

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
              <Link href="/sales">Sales</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Edit Sale</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader>
          <CardTitle>Edit Sale</CardTitle>
        </CardHeader>
        <CardContent>
          <SaleForm sale={sale} clients={clients} products={products} />
        </CardContent>
      </Card>
    </main>
  )
}

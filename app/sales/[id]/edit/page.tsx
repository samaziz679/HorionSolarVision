import { notFound } from "next/navigation"
import { fetchSaleById } from "@/lib/data/sales"
import { fetchProducts } from "@/lib/data/products"
import { fetchClients } from "@/lib/data/clients"
import SaleForm from "@/components/sales/sale-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
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
  const sale = await fetchSaleById(id)
  const products = await fetchProducts()
  const clients = await fetchClients()

  if (!sale) {
    notFound()
  }

  const productOptions = products.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    stock_quantity: product.stock_quantity,
  }))

  const clientOptions = clients.map((client) => ({
    id: client.id,
    first_name: client.first_name,
    last_name: client.last_name,
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
            <BreadcrumbPage>Edit Sale</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid gap-6">
        <SaleForm sale={sale} products={productOptions} clients={clientOptions} />
      </div>
    </main>
  )
}

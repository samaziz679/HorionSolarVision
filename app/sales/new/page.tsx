import { fetchProductsForForm } from "@/lib/data/products"
import { fetchClientsForForm } from "@/lib/data/clients"
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

export default async function NewSalePage() {
  const [products, clients] = await Promise.all([fetchProductsForForm(), fetchClientsForForm()])

  const productOptions = products.map((product) => ({
    id: product.id,
    name: product.name,
    prix_vente_detail_1: product.prix_vente_detail_1,
    prix_vente_detail_2: product.prix_vente_detail_2 || product.prix_vente_detail_1,
    prix_vente_gros: product.prix_vente_gros || product.prix_vente_detail_1,
    stock_quantity: 0, // Not needed for form display
    image: null, // Not needed for initial load
  }))

  const clientOptions = clients.map((client) => ({
    id: client.id,
    name: client.name,
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
            <BreadcrumbPage>New Sale</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid gap-6">
        <SaleForm products={productOptions} clients={clientOptions} />
      </div>
    </main>
  )
}

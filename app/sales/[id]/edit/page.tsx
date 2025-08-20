import { notFound } from "next/navigation"
import { fetchSaleById } from "@/lib/data/sales"
import { fetchProducts } from "@/lib/data/products"
import { fetchClients } from "@/lib/data/clients"
import EditSaleForm from "@/components/sales/edit-sale-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"
import type { Product, Client } from "@/lib/supabase/types"

type PageProps = {
  params: {
    id: string
  }
}

export default async function EditSalePage({ params }: PageProps) {
  const { id } = params

  try {
    const sale = await fetchSaleById(id)
    const productsResult = await fetchProducts(1, 1000) // Get all products for editing
    const products = productsResult.products || [] // Fixed: use .products instead of .data
    const clients = (await fetchClients()) || [] // Added fallback to empty array

    if (!sale) {
      notFound()
    }

    const productOptions = products.map((product: Product) => ({
      id: product.id,
      name: product.name,
      prix_vente_detail_1: product.prix_vente_detail_1,
      prix_vente_detail_2: product.prix_vente_detail_2,
      prix_vente_gros: product.prix_vente_gros,
      image: product.image,
    }))

    const clientOptions = clients.map((client: Client) => ({
      id: client.id,
      name: client.name,
    }))

    const saleWithItems = {
      ...sale,
      date: sale.sale_date, // Map sale_date to date for form compatibility
      sale_items: sale.product_id
        ? [
            {
              id: sale.id,
              sale_id: sale.id,
              product_id: sale.product_id,
              quantity: sale.quantity,
              unit_price: sale.unit_price,
              created_at: sale.sale_date,
              products: sale.products,
            },
          ]
        : [],
    }

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
            <EditSaleForm sale={saleWithItems} products={productOptions} clients={clientOptions} />
          </CardContent>
        </Card>
      </main>
    )
  } catch (error) {
    console.error("Error loading sale edit page:", error)
    notFound()
  }
}

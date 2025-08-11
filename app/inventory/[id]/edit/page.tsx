import { notFound } from "next/navigation"
import { fetchProductById } from "@/lib/data/products"
import { fetchSuppliers } from "@/lib/data/suppliers"
import ProductForm from "@/components/inventory/product-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"
import type { Supplier } from "@/lib/supabase/types"

type PageProps = {
  params: {
    id: string
  }
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = params
  const product = await fetchProductById(Number(id))
  const suppliers = await fetchSuppliers()

  if (!product) {
    notFound()
  }

  const supplierOptions = suppliers.map((supplier: Supplier) => ({
    id: supplier.id,
    name: supplier.name,
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
              <Link href="/inventory">Inventory</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Edit Product</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm product={product} suppliers={supplierOptions} />
        </CardContent>
      </Card>
    </main>
  )
}

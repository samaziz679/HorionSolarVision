import { notFound } from "next/navigation"
import { fetchProductById } from "@/lib/data/products"
import { fetchSuppliers } from "@/lib/data/suppliers"
import ProductForm from "@/components/inventory/product-form"
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

export default async function EditProductPage({ params }: PageProps) {
  const { id } = params
  const product = await fetchProductById(id)
  const suppliers = await fetchSuppliers()

  if (!product) {
    notFound()
  }

  const supplierOptions = suppliers.map((supplier) => ({
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
            <BreadcrumbPage>Edit Product</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid gap-6">
        <ProductForm product={product} suppliers={supplierOptions} />
      </div>
    </main>
  )
}

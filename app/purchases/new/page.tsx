import { fetchProducts } from "@/lib/data/products"
import { fetchSuppliers } from "@/lib/data/suppliers"
import PurchaseForm from "@/components/purchases/purchase-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"

export default async function NewPurchasePage() {
  const productsResult = await fetchProducts(1, 1000)
  const suppliersResult = await fetchSuppliers()

  const products = productsResult.products || []
  const suppliers = suppliersResult || []

  const productOptions = products.map((product) => ({
    id: product.id,
    name: product.name,
  }))

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
              <Link href="/purchases">Purchases</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New Purchase</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid gap-6">
        <PurchaseForm products={productOptions} suppliers={supplierOptions} />
      </div>
    </main>
  )
}

import { notFound } from "next/navigation"
import { fetchPurchaseById } from "@/lib/data/purchases"
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

type PageProps = {
  params: {
    id: string
  }
}

export default async function EditPurchasePage({ params }: PageProps) {
  const { id } = params
  const purchase = await fetchPurchaseById(id)
  const products = await fetchProducts()
  const suppliers = await fetchSuppliers()

  if (!purchase) {
    notFound()
  }

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
            <BreadcrumbPage>Edit Purchase</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid gap-6">
        <PurchaseForm purchase={purchase} products={productOptions} suppliers={supplierOptions} />
      </div>
    </main>
  )
}

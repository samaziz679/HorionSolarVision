import { notFound } from "next/navigation"
import { fetchProductById } from "@/lib/data/products"
import { fetchSuppliers } from "@/lib/data/suppliers"
import ProductForm from "@/components/inventory/product-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type PageProps = {
  params: {
    id: string
  }
}

export default async function EditProductPage({ params }: PageProps) {
  const id = params.id
  const [product, suppliers] = await Promise.all([fetchProductById(id), fetchSuppliers()])

  if (!product) {
    notFound()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Product</CardTitle>
      </CardHeader>
      <CardContent>
        <ProductForm product={product} suppliers={suppliers} />
      </CardContent>
    </Card>
  )
}

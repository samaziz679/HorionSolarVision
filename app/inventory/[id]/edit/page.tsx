import { notFound } from "next/navigation"
import { fetchProductById } from "@/lib/data/products"
import EditProductForm from "@/components/inventory/edit-product-form"
import { fetchSuppliers } from "@/lib/data/suppliers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type PageProps = {
  params: {
    id: string
  }
}

export default async function EditProductPage({ params }: PageProps) {
  const id = Number(params.id)
  if (isNaN(id)) {
    notFound()
  }

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
        <EditProductForm product={product} suppliers={suppliers} />
      </CardContent>
    </Card>
  )
}

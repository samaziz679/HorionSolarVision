import { fetchProductById } from "@/lib/data/products"
import { fetchSuppliers } from "@/lib/data/suppliers"
import EditProductForm from "@/components/inventory/edit-product-form"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
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

import ProductForm from "@/components/inventory/product-form"
import { fetchSuppliers } from "@/lib/data/suppliers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function NewProductPage() {
  const suppliers = await fetchSuppliers()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <ProductForm suppliers={suppliers} />
      </CardContent>
    </Card>
  )
}

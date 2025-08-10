import { notFound } from "next/navigation"
import { fetchProductById } from "@/lib/data/products"
import { EditProductForm } from "@/components/inventory/edit-product-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type PageProps = {
  params: {
    id: string
  }
}

export default async function EditProductPage({ params }: PageProps) {
  const id = params.id
  const product = await fetchProductById(id)

  if (!product) {
    notFound()
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Edit Product</CardTitle>
          </CardHeader>
          <CardContent>
            <EditProductForm product={product} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

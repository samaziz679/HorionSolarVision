import { notFound } from "next/navigation"
import { fetchSupplierById } from "@/lib/data/suppliers"
import { EditSupplierForm } from "@/components/suppliers/edit-supplier-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type PageProps = {
  params: {
    id: string
  }
}

export default async function EditSupplierPage({ params }: PageProps) {
  const id = Number(params.id)
  if (isNaN(id)) {
    notFound()
  }
  const supplier = await fetchSupplierById(id)

  if (!supplier) {
    notFound()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Supplier</CardTitle>
      </CardHeader>
      <CardContent>
        <EditSupplierForm supplier={supplier} />
      </CardContent>
    </Card>
  )
}

import { notFound } from "next/navigation"
import { fetchSupplierById } from "@/lib/data/suppliers"
import { SupplierForm } from "@/components/suppliers/supplier-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type PageProps = {
  params: {
    id: string
  }
}

export default async function EditSupplierPage({ params }: PageProps) {
  const { id } = params
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
        <SupplierForm supplier={supplier} />
      </CardContent>
    </Card>
  )
}

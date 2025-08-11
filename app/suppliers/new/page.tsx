import SupplierForm from "@/components/suppliers/supplier-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewSupplierPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Supplier</CardTitle>
      </CardHeader>
      <CardContent>
        <SupplierForm />
      </CardContent>
    </Card>
  )
}

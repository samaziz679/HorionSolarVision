import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateSupplier } from "@/app/suppliers/actions"

type Supplier = {
  id: string
  name: string
  contact_person: string | null
  email: string | null
  phone_number: string | null
  address: string | null
}

export type EditSupplierFormProps = {
  initialData: Supplier
}

export function EditSupplierForm({ initialData }: EditSupplierFormProps) {
  const formAction = updateSupplier.bind(null, initialData.id) as unknown as string

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={initialData.id} />

      <div className="grid gap-2">
        <Label htmlFor="name">Supplier Name</Label>
        <Input id="name" name="name" type="text" defaultValue={initialData.name} required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contact_person">Contact Person</Label>
        <Input id="contact_person" name="contact_person" type="text" defaultValue={initialData.contact_person ?? ""} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={initialData.email ?? ""} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="phone_number">Phone Number</Label>
        <Input id="phone_number" name="phone_number" type="tel" defaultValue={initialData.phone_number ?? ""} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" name="address" defaultValue={initialData.address ?? ""} />
      </div>

      <Button type="submit" className="w-full">
        Update Supplier
      </Button>
    </form>
  )
}

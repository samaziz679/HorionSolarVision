import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createClientAction, updateClientAction } from "@/app/clients/actions"
import type { Client } from "@/lib/supabase/types"

interface ClientFormProps {
  client?: Client
}

export default function ClientForm({ client }: ClientFormProps) {
  // Bind the appropriate Server Action.
  const formAction = client?.id ? updateClientAction.bind(null, client.id) : createClientAction

  return (
    <form action={formAction as unknown as string} className="space-y-4">
      <input type="hidden" name="id" value={client?.id ?? ""} />

      <div className="grid gap-2">
        <Label htmlFor="name">Client Name</Label>
        <Input id="name" name="name" type="text" defaultValue={client?.name ?? ""} required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contact_person">Contact Person</Label>
        <Input id="contact_person" name="contact_person" type="text" defaultValue={client?.contact_person ?? ""} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={client?.email ?? ""} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="phone_number">Phone Number</Label>
        <Input id="phone_number" name="phone_number" type="tel" defaultValue={client?.phone_number ?? ""} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" name="address" defaultValue={client?.address ?? ""} />
      </div>

      <Button type="submit" className="w-full">
        {client ? "Update Client" : "Create Client"}
      </Button>
    </form>
  )
}

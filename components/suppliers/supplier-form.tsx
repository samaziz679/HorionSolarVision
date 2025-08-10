"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createSupplier, updateSupplier } from "@/app/suppliers/actions"
import type { Supplier } from "@/lib/supabase/types"

type Props = {
  initialData?: Supplier | null
}

export default function SupplierForm({ initialData = null }: Props) {
  const [name, setName] = useState(initialData?.name ?? "")
  const [contactPerson, setContactPerson] = useState(initialData?.contact_person ?? "")
  const [email, setEmail] = useState(initialData?.email ?? "")
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phone_number ?? "")
  const [address, setAddress] = useState(initialData?.address ?? "")
  const [isPending, setIsPending] = useState(false)

  const formAction = (initialData ? updateSupplier : createSupplier) as unknown as string

  return (
    <form action={formAction} onSubmit={() => setIsPending(true)} className="space-y-4">
      <input type="hidden" name="id" value={initialData?.id ?? ""} />

      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Acme Supplies Co."
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contact_person">Contact person</Label>
        <Input
          id="contact_person"
          name="contact_person"
          value={contactPerson}
          onChange={(e) => setContactPerson(e.target.value)}
          placeholder="Jane Doe"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="supplier@example.com"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="phone_number">Phone number</Label>
        <Input
          id="phone_number"
          name="phone_number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+226 70 00 00 00"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          name="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="123 Market Street, Ouagadougou"
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : initialData ? "Update Supplier" : "Create Supplier"}
        </Button>
      </div>
    </form>
  )
}

// Also export a named export for backwards-compat imports if any file still uses it.
export { default as SupplierForm } from "./supplier-form"

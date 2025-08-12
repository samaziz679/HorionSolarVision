"use client"

import { useFormState, useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect } from "react"
import type { Product, Client, SaleWithItems } from "@/lib/supabase/types"
import { Loader2 } from "lucide-react"
import { updateSale } from "@/app/sales/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full mt-4">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? "Updating..." : "Update Sale"}
    </Button>
  )
}

export function EditSaleForm({
  sale,
  products,
  clients,
}: {
  sale: SaleWithItems
  products: Product[]
  clients: Client[]
}) {
  const [state, formAction] = useFormState(updateSale.bind(null, sale.id), { message: null, errors: {} })

  useEffect(() => {
    // toast logic here
  }, [])

  return (
    <form action={formAction}>
      <div className="grid gap-4">
        <div>
          <Label htmlFor="client_id">Client</Label>
          <Select name="client_id" defaultValue={String(sale.client_id)} required>
            <SelectTrigger>
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={String(client.id)}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="sale_date">Sale Date</Label>
          <Input
            name="sale_date"
            type="date"
            defaultValue={new Date(sale.sale_date).toISOString().split("T")[0]}
            required
          />
        </div>

        {/* Item editing logic would go here, similar to SaleForm */}
        <p className="text-sm text-muted-foreground p-4 border rounded-md">
          Editing individual sale items is not yet implemented in this form. This would involve loading
          `sale.sale_items` into a state variable and providing UI to modify them.
        </p>

        <SubmitButton />
      </div>
    </form>
  )
}

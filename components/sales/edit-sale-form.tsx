"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Product, Client, SaleWithItems } from "@/lib/supabase/types"
import { Loader2 } from "lucide-react"
import { updateSale } from "@/app/sales/actions"

export function EditSaleForm({
  sale,
  products,
  clients,
}: {
  sale: SaleWithItems
  products: Product[]
  clients: Client[]
}) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    const formData = new FormData(event.currentTarget)

    await updateSale(sale.id, formData)
    // Note: redirect() in server actions will handle navigation
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
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

        <Button type="submit" disabled={isLoading} className="w-full mt-4">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Updating..." : "Update Sale"}
        </Button>
      </div>
    </form>
  )
}

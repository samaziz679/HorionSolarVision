"use client"

import type React from "react"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { createPurchase, updatePurchase } from "@/app/purchases/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Purchase, Product, Supplier } from "@/lib/supabase/types"

export default function PurchaseForm({
  purchase,
  products,
  suppliers,
}: {
  purchase?: Purchase
  products: Pick<Product, "id" | "name">[]
  suppliers: Pick<Supplier, "id" | "name">[]
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [quantity, setQuantity] = useState(purchase?.quantity || 0)
  const [unitPrice, setUnitPrice] = useState(0)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    const formData = new FormData(event.currentTarget as HTMLFormElement)

    if (purchase) {
      await updatePurchase(purchase.id, { success: false }, formData)
    } else {
      await createPurchase({ success: false }, formData)
    }
    // Note: redirect() in server actions will handle navigation
    setIsLoading(false)
  }

  const renderErrors = (errors: string[] | undefined) => {
    if (!errors || !Array.isArray(errors)) return null
    return errors.map((error: string) => (
      <p className="mt-2 text-sm text-red-500" key={error}>
        {error}
      </p>
    ))
  }

  const total = quantity * unitPrice

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <Label htmlFor="product_id">Product</Label>
        <Select name="product_id" defaultValue={purchase?.product_id || ""} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="supplier_id">Supplier</Label>
        <Select name="supplier_id" defaultValue={purchase?.supplier_id || ""} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a supplier" />
          </SelectTrigger>
          <SelectContent>
            {suppliers.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          min="1"
          defaultValue={purchase?.quantity || ""}
          onChange={(e) => setQuantity(Number(e.target.value))}
          required
        />
      </div>

      <div>
        <Label htmlFor="unit_price">Unit Price</Label>
        <Input
          id="unit_price"
          name="unit_price"
          type="number"
          step="0.01"
          min="0"
          defaultValue=""
          onChange={(e) => setUnitPrice(Number(e.target.value))}
          required
        />
      </div>

      <div>
        <Label htmlFor="total">Total</Label>
        <Input id="total" name="total" type="number" step="0.01" value={total} readOnly className="bg-gray-50" />
      </div>

      <div>
        <Label htmlFor="purchase_date">Purchase Date</Label>
        <Input
          id="purchase_date"
          name="purchase_date"
          type="date"
          defaultValue={purchase?.purchase_date || new Date().toISOString().split("T")[0]}
          required
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? (purchase ? "Updating..." : "Creating...") : purchase ? "Update Purchase" : "Create Purchase"}
      </Button>
    </form>
  )
}

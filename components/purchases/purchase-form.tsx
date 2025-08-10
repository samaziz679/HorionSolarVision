"use client"

import { useFormState, useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createPurchase } from "@/app/purchases/actions"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import type { ProductOption } from "@/lib/data/products"
import type { SupplierOption } from "@/lib/data/suppliers"

type PurchaseFormProps = {
  products: ProductOption[]
  suppliers: SupplierOption[]
}

export function PurchaseForm({ products, suppliers }: PurchaseFormProps) {
  const initialState = { message: null, errors: {} }
  const [state, dispatch] = useFormState(createPurchase, initialState)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [unitPrice, setUnitPrice] = useState<number>(0)

  useEffect(() => {
    if (selectedProductId) {
      const product = products.find((p) => p.id === selectedProductId)
      if (product) {
        setUnitPrice(product.prix_achat ?? 0)
      }
    }
  }, [selectedProductId, products])

  useEffect(() => {
    if (state.message) {
      if (state.errors) {
        toast.error(state.message)
      } else {
        toast.success(state.message)
      }
    }
  }, [state])

  return (
    <form action={dispatch}>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="supplier_id">Supplier</Label>
          <Select name="supplier_id" required>
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

        <div className="grid gap-2">
          <Label htmlFor="product_id">Product</Label>
          <Select name="product_id" onValueChange={setSelectedProductId} required>
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

        <div className="grid gap-2">
          <Label htmlFor="unit_price">Unit Price</Label>
          <Input
            name="unit_price"
            type="number"
            value={unitPrice}
            onChange={(e) => setUnitPrice(Number(e.target.value))}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input name="quantity" type="number" placeholder="0" required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="purchase_date">Purchase Date</Label>
          <Input name="purchase_date" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
        </div>

        <SubmitButton />
      </div>
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Creating Purchase..." : "Create Purchase"}
    </Button>
  )
}

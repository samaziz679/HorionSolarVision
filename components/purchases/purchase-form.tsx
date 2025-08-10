"use client"

import { useFormState, useFormStatus } from "react-dom"
import { createPurchase, updatePurchase, type State } from "@/app/purchases/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Purchase, Product, Supplier } from "@/lib/supabase/types"
import { useState, useEffect } from "react"
import { PlusCircle, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default function PurchaseForm({
  purchase,
  products,
  suppliers,
}: {
  purchase?: Purchase | null
  products: Pick<Product, "id" | "name">[]
  suppliers: Pick<Supplier, "id" | "name">[]
}) {
  const initialState: State = { message: null, errors: {} }
  const action = purchase ? updatePurchase.bind(null, purchase.id) : createPurchase
  const [state, dispatch] = useFormState(action, initialState)
  const [items, setItems] = useState(purchase?.purchase_items || [{ product_id: "", quantity: 1, price: 0 }])

  useEffect(() => {
    if (state.message && !state.errors) {
      // Ideally, show a toast notification
      alert(state.message)
    }
  }, [state])

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, { product_id: "", quantity: 1, price: 0 }])
  }

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
  }

  const total = items.reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0)

  return (
    <form action={dispatch} className="space-y-6">
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="supplier_id">Supplier</Label>
          <Select name="supplier_id" defaultValue={purchase?.supplier_id}>
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
          {state.errors?.supplier_id && <p className="text-sm text-red-500">{state.errors.supplier_id}</p>}
        </div>
        <div>
          <Label htmlFor="purchase_date">Purchase Date</Label>
          <Input
            id="purchase_date"
            name="purchase_date"
            type="date"
            defaultValue={purchase?.purchase_date.split("T")[0]}
            required
          />
          {state.errors?.purchase_date && <p className="text-sm text-red-500">{state.errors.purchase_date}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Items</h3>
        {items.map((item, index) => (
          <div key={index} className="flex items-end gap-2 rounded-md border p-4">
            <div className="flex-1">
              <Label>Product</Label>
              <Select value={item.product_id} onValueChange={(value) => handleItemChange(index, "product_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
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
            <div className="w-24">
              <Label>Quantity</Label>
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, "quantity", Number.parseInt(e.target.value))}
                min="1"
              />
            </div>
            <div className="w-32">
              <Label>Price</Label>
              <Input
                type="number"
                value={item.price}
                onChange={(e) => handleItemChange(index, "price", Number.parseFloat(e.target.value))}
                step="0.01"
                min="0"
              />
            </div>
            <Button type="button" variant="destructive" size="icon" onClick={() => removeItem(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addItem}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Item
        </Button>
        {state.errors?.items && <p className="text-sm text-red-500">{state.errors.items}</p>}
      </div>

      <div className="text-right text-xl font-bold">Total: {formatCurrency(total)}</div>

      <div className="flex justify-end gap-4">
        <SubmitButton text={purchase ? "Update Purchase" : "Create Purchase"} />
      </div>
    </form>
  )
}

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : text}
    </Button>
  )
}

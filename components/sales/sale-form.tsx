"use client"

import { useState, useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { createSale } from "@/app/sales/actions"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, PlusCircle } from "lucide-react"
import type { Product, Client } from "@/lib/supabase/types"
import { formatMoney } from "@/lib/currency"

const initialState = { message: null, errors: {} }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full mt-4">
      {pending ? "Creating Sale..." : "Create Sale"}
    </Button>
  )
}

type SaleItem = {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total: number
}

export function SaleForm({ products, clients }: { products: Product[]; clients: Client[] }) {
  const [state, dispatch] = useFormState(createSale, initialState)
  const [items, setItems] = useState<SaleItem[]>([])
  const [totalAmount, setTotalAmount] = useState(0)

  useEffect(() => {
    if (state.message) {
      if (state.errors && Object.keys(state.errors).length > 0) {
        toast.error(state.message, {
          description: Object.values(state.errors).flat().join("\n"),
        })
      } else {
        toast.success("Sale created successfully!")
        // Reset form might be needed here
      }
    }
  }, [state])

  useEffect(() => {
    const total = items.reduce((sum, item) => sum + item.total, 0)
    setTotalAmount(total)
  }, [items])

  const addItem = () => {
    const defaultProduct = products[0]
    if (!defaultProduct) {
      toast.error("No products available to add.")
      return
    }
    setItems([
      ...items,
      {
        product_id: String(defaultProduct.id),
        product_name: defaultProduct.name,
        quantity: 1,
        unit_price: defaultProduct.prix_vente_detail_1 ?? 0,
        total: defaultProduct.prix_vente_detail_1 ?? 0,
      },
    ])
  }

  const updateItem = (index: number, field: keyof SaleItem, value: any) => {
    const newItems = [...items]
    const item = newItems[index]

    if (field === "product_id") {
      const product = products.find((p) => String(p.id) === value)
      if (product) {
        item.product_id = value
        item.product_name = product.name
        item.unit_price = product.prix_vente_detail_1 ?? 0
      }
    } else if (field === "quantity" || field === "unit_price") {
      item[field] = Number(value)
    }

    item.total = item.quantity * item.unit_price
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  return (
    <form action={dispatch}>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="client_id">Client</Label>
          <Select name="client_id" required>
            <SelectTrigger>
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={String(client.id)}>
                  {`${client.first_name} ${client.last_name}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="sale_date">Sale Date</Label>
          <Input name="sale_date" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-2">Sale Items</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <Select value={item.product_id} onValueChange={(val) => updateItem(index, "product_id", val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  min="1"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={item.unit_price}
                  onChange={(e) => updateItem(index, "unit_price", e.target.value)}
                  min="0"
                  step="0.01"
                />
              </TableCell>
              <TableCell>{formatMoney(item.total)}</TableCell>
              <TableCell>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button type="button" variant="outline" size="sm" onClick={addItem} className="mt-2 bg-transparent">
        <PlusCircle className="h-4 w-4 mr-2" /> Add Item
      </Button>

      <div className="mt-4 text-right">
        <h3 className="text-xl font-bold">Total: {formatMoney(totalAmount)}</h3>
      </div>

      <input
        type="hidden"
        name="items"
        value={JSON.stringify(
          items.map((i) => ({ product_id: i.product_id, quantity: i.quantity, unit_price: i.unit_price })),
        )}
      />
      <input type="hidden" name="total_amount" value={totalAmount} />

      <SubmitButton />
    </form>
  )
}

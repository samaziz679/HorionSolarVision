"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatMoney } from "@/lib/currency"

type BasePurchase = {
  created_at: string
  id: string
  product_id: string
  purchase_date: string
  quantity: number
  supplier_id: string
  total_amount: number
  user_id: string
}

// Support either flat aliased fields or joined objects
type PurchaseJoins = {
  supplier_name?: string | null
  product_name?: string | null
  suppliers?: { id: string; name: string | null } | null
  products?: { id: string; name: string | null } | null
}

export type PurchaseRow = BasePurchase & Partial<PurchaseJoins>

type Props = {
  data?: PurchaseRow[]
  purchases?: PurchaseRow[]
}

function formatDate(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d
  if (Number.isNaN(date.getTime())) return d?.toString() ?? "N/A"
  return date.toLocaleDateString()
}

function safeSupplierName(row: PurchaseRow) {
  return row.supplier_name ?? row.suppliers?.name ?? "N/A"
}

function safeProductName(row: PurchaseRow) {
  return row.product_name ?? row.products?.name ?? "N/A"
}

function PurchaseListComponent({ data, purchases }: Props) {
  const rows = data ?? purchases ?? []

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Purchase Date</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Product</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No purchases found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{formatDate(row.purchase_date)}</TableCell>
                <TableCell>{safeSupplierName(row)}</TableCell>
                <TableCell>{safeProductName(row)}</TableCell>
                <TableCell className="text-right">{row.quantity}</TableCell>
                <TableCell className="text-right">{formatMoney(row.total_amount)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

// Export both named and default to be compatible with varying imports
export { PurchaseListComponent as PurchaseList }
export default PurchaseListComponent

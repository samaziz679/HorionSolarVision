"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatMoney } from "@/lib/currency"

type BaseSale = {
  id: string
  created_at: string
  product_id: string
  client_id: string
  sale_date: string
  quantity: number
  total_amount: number
  user_id: string
}

// Support either flat aliased fields or joined objects
type SaleJoins = {
  client_name?: string | null
  product_name?: string | null
  clients?: { id: string; name: string | null } | null
  products?: { id: string; name: string | null } | null
}

export type SaleRow = BaseSale & Partial<SaleJoins>

type Props = {
  data?: SaleRow[]
  sales?: SaleRow[]
}

function formatDate(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d
  if (Number.isNaN(date.getTime())) return d?.toString() ?? "N/A"
  return date.toLocaleDateString()
}

function safeClientName(row: SaleRow) {
  return row.client_name ?? row.clients?.name ?? "N/A"
}

function safeProductName(row: SaleRow) {
  return row.product_name ?? row.products?.name ?? "N/A"
}

function SalesListComponent({ data, sales }: Props) {
  const rows = data ?? sales ?? []

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sale Date</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Product</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No sales found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{formatDate(row.sale_date)}</TableCell>
                <TableCell>{safeClientName(row)}</TableCell>
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
export { SalesListComponent as SalesList }
export default SalesListComponent

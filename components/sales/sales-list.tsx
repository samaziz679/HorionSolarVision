"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatMoney } from "@/lib/currency"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Pencil } from "lucide-react"

type SaleForList = {
  id: string
  date: string
  total_amount: number
  client_name: string
}

export function SalesList({ sales }: { sales: SaleForList[] }) {
  const router = useRouter()

  const handleEdit = (id: string) => {
    router.push(`/sales/${id}/edit`)
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sale ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Client</TableHead>
            <TableHead className="text-right">Total Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No sales found.
              </TableCell>
            </TableRow>
          ) : (
            sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>
                  <Badge variant="outline">SALE-{sale.id.slice(0, 8)}</Badge>
                </TableCell>
                <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                <TableCell>{sale.client_name}</TableCell>
                <TableCell className="text-right">{formatMoney(sale.total_amount)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(sale.id)}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit Sale</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

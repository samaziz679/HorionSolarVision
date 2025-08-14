"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatMoney } from "@/lib/currency"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
import { DeleteSaleDialog } from "./delete-sale-dialog"
import { useState } from "react"

type SaleForList = {
  id: string
  date: string
  total_amount: number
  client_name: string
}

export function SalesList({ sales }: { sales: SaleForList[] }) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null)

  const handleEdit = (id: string) => {
    router.push(`/sales/${id}/edit`)
  }

  const handleDelete = (id: string) => {
    setSaleToDelete(id)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Vente</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Client</TableHead>
            <TableHead className="text-right">Montant Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Aucune vente trouvée.
              </TableCell>
            </TableRow>
          ) : (
            sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>
                  <Badge variant="outline">VENTE-{sale.id.slice(0, 8)}</Badge>
                </TableCell>
                <TableCell>{new Date(sale.date).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell>{sale.client_name}</TableCell>
                <TableCell className="text-right">{formatMoney(sale.total_amount)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(sale.id)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Modifier la Vente</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(sale.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Supprimer la Vente</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {saleToDelete && (
        <DeleteSaleDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} saleId={saleToDelete} />
      )}
    </div>
  )
}

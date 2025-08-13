"use client"

import type { PurchaseWithDetails } from "@/lib/supabase/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import DeletePurchaseDialog from "./delete-purchase-dialog"

export default function PurchaseList({ purchases }: { purchases: PurchaseWithDetails[] }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Fournisseur</TableHead>
            <TableHead>Produit</TableHead>
            <TableHead>Quantité</TableHead>
            <TableHead className="text-right">Coût Total</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((purchase) => (
            <TableRow key={purchase.id}>
              <TableCell>{formatDate(purchase.purchase_date)}</TableCell>
              <TableCell>{purchase.suppliers?.name || "N/A"}</TableCell>
              <TableCell>{purchase.products?.name || "N/A"}</TableCell>
              <TableCell>{purchase.quantity}</TableCell>
              <TableCell className="text-right">{formatCurrency(purchase.total)}</TableCell>
              <TableCell className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/purchases/${purchase.id}/edit`}>Modifier</Link>
                </Button>
                <DeletePurchaseDialog purchaseId={purchase.id.toString()} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

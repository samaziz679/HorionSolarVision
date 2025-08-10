"use client"

import type { Purchase } from "@/lib/supabase/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import DeletePurchaseDialog from "./delete-purchase-dialog"

export default function PurchaseList({ purchases }: { purchases: Purchase[] }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="text-right">Total Amount</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((purchase) => (
            <TableRow key={purchase.id}>
              <TableCell>{formatDate(purchase.purchase_date)}</TableCell>
              <TableCell>{purchase.suppliers.name}</TableCell>
              <TableCell>{purchase.purchase_items.reduce((acc, item) => acc + item.quantity, 0)}</TableCell>
              <TableCell className="text-right">{formatCurrency(purchase.total_amount)}</TableCell>
              <TableCell className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/purchases/${purchase.id}/edit`}>Edit</Link>
                </Button>
                <DeletePurchaseDialog purchaseId={purchase.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

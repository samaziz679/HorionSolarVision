"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { formatMoney } from "@/lib/currency"

export type InventoryProduct = {
  id: string
  name: string
  unit: string | null
  quantity: number
  prix_achat: number | null
  prix_vente_detail_1: number | null
  prix_vente_detail_2: number | null
  prix_vente_gros: number | null
  seuil_stock_bas: number | null
  description: string | null
  created_at: string
  created_by: string | null
}

type ProductListProps = {
  products: InventoryProduct[]
}

export default function ProductList({ products }: ProductListProps) {
  if (!products || products.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">No products found.</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[220px]">Name</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Low stock</TableHead>
              <TableHead className="text-right">Detail 1</TableHead>
              <TableHead className="text-right">Detail 2</TableHead>
              <TableHead className="text-right">Wholesale</TableHead>
              <TableHead className="text-right">Purchase</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  <div className="truncate max-w-[260px]">{p.name}</div>
                  {p.description ? (
                    <div className="text-xs text-muted-foreground truncate max-w-[260px]">{p.description}</div>
                  ) : null}
                </TableCell>
                <TableCell className="text-right tabular-nums">{p.quantity}</TableCell>
                <TableCell>{p.unit ?? "—"}</TableCell>
                <TableCell className="text-right tabular-nums">{p.seuil_stock_bas ?? "—"}</TableCell>
                <TableCell className="text-right">{formatMoney(p.prix_vente_detail_1)}</TableCell>
                <TableCell className="text-right">{formatMoney(p.prix_vente_detail_2)}</TableCell>
                <TableCell className="text-right">{formatMoney(p.prix_vente_gros)}</TableCell>
                <TableCell className="text-right">{formatMoney(p.prix_achat)}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {new Date(p.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

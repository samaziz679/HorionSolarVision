"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BarChart3 } from "lucide-react"

interface MarginByProductTableProps {
  data: Array<{
    product_id: string
    product_name: string
    total_sales: number
    total_margin: number
    average_margin_percentage: number
    sales_count: number
  }>
}

export function MarginByProductTable({ data }: MarginByProductTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Marges par Produit
        </CardTitle>
        <CardDescription>Performance détaillée par produit</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead className="text-right">Ventes</TableHead>
              <TableHead className="text-right">Marge Totale</TableHead>
              <TableHead className="text-right">Marge Moyenne</TableHead>
              <TableHead className="text-right">Nb Ventes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((product) => (
              <TableRow key={product.product_id}>
                <TableCell className="font-medium">{product.product_name}</TableCell>
                <TableCell className="text-right">{(product.total_sales ?? 0).toLocaleString()} CFA</TableCell>
                <TableCell className="text-right font-medium text-green-600">
                  {(product.total_margin ?? 0).toLocaleString()} CFA
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={
                      product.average_margin_percentage >= 30
                        ? "default"
                        : product.average_margin_percentage >= 20
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {product.average_margin_percentage.toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">{product.sales_count}</TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                  Aucune donnée de marge disponible
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

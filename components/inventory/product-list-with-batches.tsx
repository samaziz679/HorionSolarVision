"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Pencil, Trash2, ChevronDown, ChevronRight, Package } from "lucide-react"
import Link from "next/link"
import type { ProductWithBatches } from "@/lib/data/stock-lots"
import DeleteProductDialog from "./delete-product-dialog"
import { formatMoney } from "@/lib/currency"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default function ProductListWithBatches({ products }: { products: ProductWithBatches[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [selectedProductId, setSelectedProductId] = React.useState<string | null>(null)
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set())

  const handleDeleteClick = (id: string) => {
    setSelectedProductId(id)
    setIsDeleteDialogOpen(true)
  }

  const toggleRowExpansion = (productId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId)
    } else {
      newExpanded.add(productId)
    }
    setExpandedRows(newExpanded)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Critical":
        return "destructive"
      case "Low Stock":
        return "secondary"
      default:
        return "default"
    }
  }

  const columns: ColumnDef<ProductWithBatches>[] = [
    {
      id: "expand",
      cell: ({ row }) => {
        const product = row.original
        const isExpanded = expandedRows.has(product.id)
        const hasBatches = product.stock_lots.length > 0

        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleRowExpansion(product.id)}
            disabled={!hasBatches}
            className="h-8 w-8 p-0"
          >
            {hasBatches ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )
            ) : (
              <Package className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        )
      },
    },
    {
      accessorKey: "name",
      header: "Product Name",
    },
    {
      accessorKey: "total_quantity",
      header: "Total Quantity",
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{product.total_quantity}</span>
            <Badge variant={getStatusBadgeVariant(product.stock_status)}>{product.stock_status}</Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "batch_count",
      header: "Batches",
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="text-center">
            <span className="text-sm font-medium">{product.batch_count}</span>
            <div className="text-xs text-muted-foreground">batches</div>
          </div>
        )
      },
    },
    {
      accessorKey: "average_cost",
      header: "Average Cost",
      cell: ({ row }) => formatMoney(row.original.average_cost),
    },
    {
      accessorKey: "prix_vente_detail_1",
      header: "Sale Price",
      cell: ({ row }) => formatMoney(row.original.prix_vente_detail_1),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/inventory/${product.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDeleteClick(product.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const product = row.original
                const isExpanded = expandedRows.has(product.id)

                return (
                  <React.Fragment key={row.id}>
                    <TableRow>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                    {isExpanded && product.stock_lots.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="p-0">
                          <div className="bg-muted/50 p-4">
                            <h4 className="font-medium mb-3 text-sm">Batch Details</h4>
                            <div className="grid gap-2">
                              {product.stock_lots.map((lot) => (
                                <div
                                  key={lot.id}
                                  className="flex items-center justify-between p-3 bg-background rounded border text-sm"
                                >
                                  <div className="flex items-center gap-4">
                                    <div>
                                      <div className="font-medium">{lot.lot_number}</div>
                                      <div className="text-xs text-muted-foreground">
                                        Purchased on{" "}
                                        {format(new Date(lot.purchase_date), "dd MMM yyyy", { locale: fr })}
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="font-medium">{lot.quantity_available}</div>
                                      <div className="text-xs text-muted-foreground">available</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="font-medium">{formatMoney(lot.unit_cost)}</div>
                                      <div className="text-xs text-muted-foreground">unit cost</div>
                                    </div>
                                  </div>
                                  {lot.notes && (
                                    <div className="text-xs text-muted-foreground max-w-xs truncate">{lot.notes}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
      {selectedProductId && (
        <DeleteProductDialog
          productId={selectedProductId}
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
        />
      )}
    </>
  )
}

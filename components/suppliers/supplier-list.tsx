"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import type { Supplier } from "@/lib/supabase/types"
import Link from "next/link"
import { PencilIcon, TrashIcon } from "lucide-react"
import DeleteSupplierDialog from "./delete-supplier-dialog"

interface SupplierListProps {
  suppliers: Supplier[]
}

export default function SupplierList({ suppliers }: SupplierListProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null)

  const handleDeleteClick = (id: string) => {
    setSelectedSupplierId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDeleteDialogOpen(false)
    setSelectedSupplierId(null)
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell className="font-medium">{supplier.name}</TableCell>
              <TableCell>{supplier.email}</TableCell>
              <TableCell>{supplier.phone}</TableCell>
              <TableCell className="flex justify-end gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/suppliers/${supplier.id}/edit`}>
                    <PencilIcon className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(supplier.id)}>
                  <TrashIcon className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedSupplierId && (
        <DeleteSupplierDialog supplierId={selectedSupplierId} isOpen={isDeleteDialogOpen} onClose={handleCloseDialog} />
      )}
    </div>
  )
}

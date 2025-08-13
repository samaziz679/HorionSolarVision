"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import type { Client } from "@/lib/supabase/types"
import Link from "next/link"
import { PencilIcon, TrashIcon } from "lucide-react"
import DeleteClientDialog from "./delete-client-dialog"

interface ClientListProps {
  clients: Client[]
}

export default function ClientList({ clients }: ClientListProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

  const handleDeleteClick = (id: string) => {
    setSelectedClientId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDeleteDialogOpen(false)
    setSelectedClientId(null)
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Téléphone</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>{client.phone}</TableCell>
              <TableCell className="flex justify-end gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/clients/${client.id}/edit`}>
                    <PencilIcon className="h-4 w-4" />
                    <span className="sr-only">Modifier</span>
                  </Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(client.id.toString())}>
                  <TrashIcon className="h-4 w-4" />
                  <span className="sr-only">Supprimer</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedClientId && (
        <DeleteClientDialog clientId={selectedClientId} isOpen={isDeleteDialogOpen} onClose={handleCloseDialog} />
      )}
    </>
  )
}

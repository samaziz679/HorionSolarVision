"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
import { deleteBankEntry } from "@/app/bank/actions"
import { useTransition } from "react"
import { toast } from "sonner"
import type { BankEntry } from "@/lib/data/bank-entries"

interface BankEntryListProps {
  entries: BankEntry[]
}

export function BankEntryList({ entries }: BankEntryListProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette entrée ?")) {
      startTransition(async () => {
        const result = await deleteBankEntry(id)
        if (result.success) {
          toast.success(result.message)
        } else {
          toast.error(result.message)
        }
      })
    }
  }

  if (entries.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Aucune entrée bancaire trouvée</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Montant</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                {entry.account_type === "in" ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">Entrée</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-red-600 font-medium">Sortie</span>
                  </>
                )}
              </div>
            </TableCell>
            <TableCell>{new Date(entry.entry_date).toLocaleDateString("fr-FR")}</TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{entry.description}</div>
                {entry.notes && <div className="text-sm text-muted-foreground">{entry.notes}</div>}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <span
                className={entry.account_type === "in" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}
              >
                {entry.account_type === "in" ? "+" : "-"}
                {entry.amount.toLocaleString("fr-FR")} FCFA
              </span>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/bank/${entry.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)} disabled={isPending}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

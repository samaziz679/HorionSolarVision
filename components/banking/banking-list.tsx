"use client"

import type { BankAccount } from "@/lib/supabase/types"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { formatCurrency } from "@/lib/currency"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import Link from "next/link"
import DeleteBankingDialog from "./delete-banking-dialog"

interface BankingListProps {
  accounts: BankAccount[]
}

export default function BankAccountList({ accounts }: BankingListProps) {
  const columns: ColumnDef<BankAccount>[] = [
    {
      accessorKey: "account_name",
      header: "Account Name",
    },
    {
      accessorKey: "bank_name",
      header: "Bank Name",
    },
    {
      accessorKey: "account_type",
      header: "Type",
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) => formatCurrency(row.original.balance),
    },
    {
      accessorKey: "created_at",
      header: "Date Added",
      cell: ({ row }) => format(new Date(row.original.created_at), "PPP"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const account = row.original
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
                  <Link href={`/banking/${account.id}/edit`}>Edit</Link>
                </DropdownMenuItem>
                <DeleteBankingDialog accountId={account.id} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  return <DataTable columns={columns} data={accounts} />
}

"use client"

import type { BankAccount } from "@/lib/supabase/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import DeleteBankAccountDialog from "./delete-banking-dialog"

export default function BankAccountList({ accounts }: { accounts: BankAccount[] }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Account Name</TableHead>
            <TableHead>Bank Name</TableHead>
            <TableHead>Account Number</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell>{account.account_name}</TableCell>
              <TableCell>{account.bank_name}</TableCell>
              <TableCell>****{account.account_number.slice(-4)}</TableCell>
              <TableCell className="text-right">{formatCurrency(account.initial_balance)}</TableCell>
              <TableCell className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/banking/${account.id}/edit`}>Edit</Link>
                </Button>
                <DeleteBankAccountDialog accountId={account.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

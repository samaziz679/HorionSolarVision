'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { BankingAccount } from '@/lib/supabase/types';
import Link from 'next/link';
import { PencilIcon, TrashIcon } from 'lucide-react';
import DeleteBankingAccountDialog from './delete-banking-dialog';

interface BankingListProps {
  bankingAccounts: BankingAccount[];
}

export default function BankingList({ bankingAccounts }: BankingListProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setSelectedAccountId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedAccountId(null);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bank Name</TableHead>
            <TableHead>Account Name</TableHead>
            <TableHead>Account Number</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bankingAccounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell className="font-medium">{account.bank_name}</TableCell>
              <TableCell>{account.account_name}</TableCell>
              <TableCell>{account.account_number}</TableCell>
              <TableCell>${account.balance.toFixed(2)}</TableCell>
              <TableCell className="flex justify-end gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/banking/${account.id}/edit`}>
                    <PencilIcon className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(account.id)}>
                  <TrashIcon className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedAccountId && (
        <DeleteBankingAccountDialog
          accountId={selectedAccountId}
          isOpen={isDeleteDialogOpen}
          onClose={handleCloseDialog}
        />
      )}
    </>
  );
}

'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteBankingAccount } from '@/app/banking/actions';
import { toast } from 'sonner';

interface DeleteBankingAccountDialogProps {
  accountId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteBankingAccountDialog({
  accountId,
  isOpen,
  onClose,
}: DeleteBankingAccountDialogProps) {
  const handleDelete = async () => {
    const result = await deleteBankingAccount(accountId);
    if (result?.message) {
      toast.error(result.message);
    } else {
      toast.success('Banking account deleted successfully!');
    }
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your banking account
            and remove its data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

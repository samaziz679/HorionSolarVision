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
import { deleteExpense } from '@/app/expenses/actions';
import { toast } from 'sonner';

interface DeleteExpenseDialogProps {
  expenseId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteExpenseDialog({
  expenseId,
  isOpen,
  onClose,
}: DeleteExpenseDialogProps) {
  const handleDelete = async () => {
    const result = await deleteExpense(expenseId);
    if (result?.message) {
      toast.error(result.message);
    } else {
      toast.success('Expense deleted successfully!');
    }
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your expense
            record and remove its data from our servers.
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

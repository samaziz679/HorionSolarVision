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
import { deleteClientAction } from '@/app/clients/actions';
import { toast } from 'sonner';

interface DeleteClientDialogProps {
  clientId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteClientDialog({
  clientId,
  isOpen,
  onClose,
}: DeleteClientDialogProps) {
  const handleDelete = async () => {
    const result = await deleteClientAction(clientId);
    if (result?.message) {
      toast.error(result.message);
    } else {
      toast.success('Client deleted successfully!');
    }
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the client
            and remove their data from our servers.
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

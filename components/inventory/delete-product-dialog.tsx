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
import { deleteProduct } from '@/app/inventory/actions';
import { toast } from 'sonner';

interface DeleteProductDialogProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteProductDialog({
  productId,
  isOpen,
  onClose,
}: DeleteProductDialogProps) {
  const handleDelete = async () => {
    const result = await deleteProduct(productId);
    if (result?.message) {
      toast.error(result.message);
    } else {
      toast.success('Product deleted successfully!');
    }
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the product
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

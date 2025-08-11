"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteProduct } from "@/app/inventory/actions"
import { useState } from "react"
import { toast } from "sonner"

interface DeleteProductDialogProps {
  productId: string // Changed from number to string for UUID compatibility
  isOpen: boolean
  onClose: () => void
}

export default function DeleteProductDialog({ productId, isOpen, onClose }: DeleteProductDialogProps) {
  const [isPending, setIsPending] = useState(false)

  const handleDelete = async () => {
    setIsPending(true)
    try {
      const result = await deleteProduct(productId) // Removed String() conversion since productId is already a string
      if (result?.message) {
        toast.error(result.message)
      } else {
        toast.success("Product deleted successfully.")
        onClose()
      }
    } catch (error) {
      toast.error("Failed to delete product")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the product from the inventory.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

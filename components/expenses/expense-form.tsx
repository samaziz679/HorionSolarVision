import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createExpense, updateExpense } from "@/app/expenses/actions"
import type { Expense } from "@/lib/supabase/types"

interface ExpenseFormProps {
  expense?: Expense
}

export default function ExpenseForm({ expense }: ExpenseFormProps) {
  // Bind the appropriate Server Action. Casting satisfies React 18 DOM typings for form.action.
  const formAction = (expense ? updateExpense.bind(null, expense.id) : createExpense) as unknown as string

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={expense?.id ?? ""} />

      <div className="grid gap-2">
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" name="amount" type="number" step="0.01" defaultValue={expense?.amount ?? 0} required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="category">Category</Label>
        <Input id="category" name="category" type="text" defaultValue={expense?.category ?? ""} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" defaultValue={expense?.description ?? ""} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          name="date"
          type="date"
          defaultValue={expense?.date ? expense.date : new Date().toISOString().split("T")[0]}
          required
        />
      </div>

      <Button type="submit" className="w-full">
        {expense ? "Update Expense" : "Create Expense"}
      </Button>
    </form>
  )
}

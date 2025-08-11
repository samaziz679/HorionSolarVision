"use client"

import { useEffect } from "react"
import { useFormState, useFormStatus } from "react"
import { toast } from "sonner"
import { createExpense, updateExpense, type State } from "@/app/expenses/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Expense } from "@/lib/supabase/types"

export default function ExpenseForm({ expense }: { expense?: Expense }) {
  const initialState: State = { message: null, errors: {} }
  const action = expense ? updateExpense.bind(null, expense.id) : createExpense
  const [state, dispatch] = useFormState(action, initialState)

  useEffect(() => {
    if (state.message) {
      if (state.success === false) {
        toast.error(state.message)
      } else if (state.success === true) {
        toast.success(state.message)
      }
    }
  }, [state])

  return (
    <form action={dispatch} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input id="category" name="category" defaultValue={expense?.category} aria-describedby="category-error" />
        <div id="category-error" aria-live="polite" aria-atomic="true">
          {state.errors?.category &&
            state.errors.category.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          defaultValue={expense?.amount}
          aria-describedby="amount-error"
        />
        <div id="amount-error" aria-live="polite" aria-atomic="true">
          {state.errors?.amount &&
            state.errors.amount.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="expense_date">Expense Date</Label>
        <Input
          id="expense_date"
          name="expense_date"
          type="date"
          defaultValue={expense?.expense_date ? new Date(expense.expense_date).toISOString().split("T")[0] : ""}
          aria-describedby="expense_date-error"
        />
        <div id="expense_date-error" aria-live="polite" aria-atomic="true">
          {state.errors?.expense_date &&
            state.errors.expense_date.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={expense?.description ?? ""}
          aria-describedby="description-error"
        />
        <div id="description-error" aria-live="polite" aria-atomic="true">
          {state.errors?.description &&
            state.errors.description.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>
      <SubmitButton isEditing={!!expense} />
    </form>
  )
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Expense" : "Create Expense"}
    </Button>
  )
}

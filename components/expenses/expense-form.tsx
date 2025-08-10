"use client"

import { useFormState, useFormStatus } from "react-dom"
import { createExpense, updateExpense, type State } from "@/app/expenses/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Expense } from "@/lib/supabase/types"
import { useEffect } from "react"

export default function ExpenseForm({ expense }: { expense?: Expense | null }) {
  const initialState: State = { message: null, errors: {} }
  const action = expense ? updateExpense.bind(null, expense.id) : createExpense
  const [state, dispatch] = useFormState(action, initialState)

  useEffect(() => {
    if (state.message && !state.errors) {
      alert(state.message)
    }
  }, [state])

  return (
    <form action={dispatch} className="space-y-4">
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={expense?.description} required />
        {state.errors?.description && <p className="text-sm text-red-500">{state.errors.description}</p>}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" name="amount" type="number" step="0.01" defaultValue={expense?.amount} required />
          {state.errors?.amount && <p className="text-sm text-red-500">{state.errors.amount}</p>}
        </div>
        <div>
          <Label htmlFor="expense_date">Expense Date</Label>
          <Input
            id="expense_date"
            name="expense_date"
            type="date"
            defaultValue={expense?.expense_date.split("T")[0]}
            required
          />
          {state.errors?.expense_date && <p className="text-sm text-red-500">{state.errors.expense_date}</p>}
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" defaultValue={expense?.category} required />
          {state.errors?.category && <p className="text-sm text-red-500">{state.errors.category}</p>}
        </div>
      </div>
      <div className="flex justify-end gap-4">
        <SubmitButton text={expense ? "Update Expense" : "Create Expense"} />
      </div>
    </form>
  )
}

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : text}
    </Button>
  )
}

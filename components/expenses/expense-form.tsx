"use client"

import type React from "react"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { createExpense, updateExpense } from "@/app/expenses/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Expense } from "@/lib/supabase/types"

export default function ExpenseForm({ expense }: { expense?: Expense }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    const formData = new FormData(event.currentTarget)

    if (expense) {
      await updateExpense(expense.id, { success: false }, formData)
    } else {
      await createExpense({ success: false }, formData)
    }
    // Note: redirect() in server actions will handle navigation
    setIsLoading(false)
  }

  const renderErrors = (errors: string[] | undefined) => {
    if (!errors || !Array.isArray(errors)) return null
    return errors.map((error: string) => (
      <p className="mt-2 text-sm text-red-500" key={error}>
        {error}
      </p>
    ))
  }

  const expenseCategories = [
    "Office Supplies",
    "Transportation",
    "Utilities",
    "Marketing",
    "Equipment",
    "Maintenance",
    "Professional Services",
    "Insurance",
    "Other",
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          defaultValue={expense?.description || ""}
          placeholder="Enter expense description"
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select name="category" defaultValue={expense?.category || ""} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {expenseCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0"
          defaultValue={expense?.amount || ""}
          placeholder="0.00"
          required
        />
      </div>

      <div>
        <Label htmlFor="expense_date">Expense Date</Label>
        <Input
          id="expense_date"
          name="expense_date"
          type="date"
          defaultValue={expense?.expense_date || new Date().toISOString().split("T")[0]}
          required
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={expense?.notes || ""}
          placeholder="Additional notes about this expense"
          rows={3}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? (expense ? "Updating..." : "Creating...") : expense ? "Update Expense" : "Create Expense"}
      </Button>
    </form>
  )
}

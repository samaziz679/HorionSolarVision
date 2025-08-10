import { fetchExpenseById } from "@/lib/data/expenses"
import ExpenseForm from "@/components/expenses/expense-form"
import { notFound } from "next/navigation"

export default async function EditExpensePage({ params }: { params: { id: string } }) {
  const id = params.id
  const expense = await fetchExpenseById(id)

  if (!expense) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit Expense</h1>
      <ExpenseForm expense={expense} />
    </div>
  )
}

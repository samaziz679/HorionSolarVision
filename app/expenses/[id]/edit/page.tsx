import { notFound } from "next/navigation"
import { fetchExpenseById } from "@/lib/data/expenses"
import ExpenseForm from "@/components/expenses/expense-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type PageProps = {
  params: {
    id: string
  }
}

export default async function EditExpensePage({ params }: PageProps) {
  const id = Number(params.id)
  if (isNaN(id)) {
    notFound()
  }

  const expense = await fetchExpenseById(id)

  if (!expense) {
    notFound()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <ExpenseForm expense={expense} />
      </CardContent>
    </Card>
  )
}

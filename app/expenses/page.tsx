import { fetchExpenses } from "@/lib/data/expenses"
import ExpenseList from "@/components/expenses/expense-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export default async function ExpensesPage() {
  const expenses = await fetchExpenses()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dépenses</h1>
        <Button asChild>
          <Link href="/expenses/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouvelle Dépense
          </Link>
        </Button>
      </div>
      <ExpenseList expenses={expenses} />
    </div>
  )
}

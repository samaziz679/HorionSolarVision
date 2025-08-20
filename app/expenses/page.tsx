import { fetchExpenses } from "@/lib/data/expenses"
import ExpenseList from "@/components/expenses/expense-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default async function ExpensesPage() {
  const expenses = await fetchExpenses()

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Tableau de bord</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Dépenses</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button asChild className="ml-auto">
          <Link href="/expenses/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouvelle Dépense
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <ExpenseList expenses={expenses} />
      </div>
    </main>
  )
}

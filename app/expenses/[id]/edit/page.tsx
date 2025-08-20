import { notFound } from "next/navigation"
import { fetchExpenseById } from "@/lib/data/expenses"
import { fetchExpenseCategories } from "@/lib/data/categories"
import ExpenseForm from "@/components/expenses/expense-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"

type PageProps = {
  params: {
    id: string
  }
}

export default async function EditExpensePage({ params }: PageProps) {
  const { id } = params
  const [expense, categories] = await Promise.all([fetchExpenseById(id), fetchExpenseCategories()])

  if (!expense) {
    notFound()
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Tableau de bord</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/expenses">Dépenses</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Modifier Dépense</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader>
          <CardTitle>Modifier Dépense</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseForm expense={expense} categories={categories || []} />
        </CardContent>
      </Card>
    </main>
  )
}

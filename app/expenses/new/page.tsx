export const dynamic = "force-dynamic"
export const revalidate = 0

import ExpenseForm from "@/components/expenses/expense-form"
import { fetchExpenseCategories } from "@/lib/data/categories"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"

export default async function NewExpensePage() {
  const categories = await fetchExpenseCategories()

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
            <BreadcrumbLink>Nouvelle Dépense</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Créer une Nouvelle Dépense</h1>
        <ExpenseForm categories={categories} />
      </div>
    </main>
  )
}

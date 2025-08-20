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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const currentPage = Number(searchParams?.page) || 1
  const { expenses, totalPages, hasNextPage, hasPrevPage } = await fetchExpenses(currentPage, 10)

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
        <Button asChild size="sm" className="ml-auto gap-1">
          <Link href="/expenses/new">
            Nouvelle Dépense
            <PlusCircle className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dépenses récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseList expenses={expenses} />

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" asChild disabled={!hasPrevPage}>
                  <Link href={`/expenses?page=${currentPage - 1}`}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild disabled={!hasNextPage}>
                  <Link href={`/expenses?page=${currentPage + 1}`}>
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

import { fetchBankEntries, getBankSummary } from "@/lib/data/bank-entries"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, Link2 } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet } from "lucide-react"
import { BankEntryList } from "@/components/bank/bank-entry-list"
import { requireRole } from "@/lib/auth/rbac"
import { redirect } from "next/navigation"

export default async function BankPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  try {
    await requireRole(["admin", "finance"])
  } catch (error) {
    redirect("/dashboard")
  }

  const currentPage = Number(searchParams?.page) || 1
  const { entries, totalPages, hasNextPage, hasPrevPage } = await fetchBankEntries(currentPage, 10)
  const summary = await getBankSummary()

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
              <BreadcrumbLink>Banque</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex gap-2">
          <Button asChild size="sm" variant="outline" className="gap-1 bg-transparent">
            <Link href="/bank/reconciliation">
              <Link2 className="h-4 w-4" />
              Rapprochement
            </Link>
          </Button>
          <Button asChild size="sm" className="gap-1">
            <Link href="/bank/new">
              Nouvelle Entrée
              <PlusCircle className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrées</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.totalIn.toLocaleString("fr-FR")} FCFA</div>
            <p className="text-xs text-muted-foreground">Total des entrées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sorties</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.totalOut.toLocaleString("fr-FR")} FCFA</div>
            <p className="text-xs text-muted-foreground">Total des sorties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solde</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.balance >= 0 ? "text-blue-600" : "text-red-600"}`}>
              {summary.balance.toLocaleString("fr-FR")} FCFA
            </div>
            <p className="text-xs text-muted-foreground">Solde actuel</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entrées bancaires récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <BankEntryList entries={entries} />

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" asChild disabled={!hasPrevPage}>
                  <Link href={`/bank?page=${currentPage - 1}`}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild disabled={!hasNextPage}>
                  <Link href={`/bank?page=${currentPage + 1}`}>
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

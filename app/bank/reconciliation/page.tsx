import { Suspense } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ReconciliationClient } from "@/components/bank/reconciliation-client"
import { fetchUnreconciledSales } from "@/lib/data/sales"
import { fetchUnreconciledBankInflows, fetchReconciledEntries } from "@/lib/data/bank-entries"
import { requireRole } from "@/lib/auth/rbac"
import { redirect } from "next/navigation"

export default async function ReconciliationPage() {
  try {
    await requireRole(["admin", "finance"])
  } catch (error) {
    redirect("/dashboard")
  }

  const [unreconciledSales, unreconciledBankInflows, reconciledData] = await Promise.all([
    fetchUnreconciledSales(),
    fetchUnreconciledBankInflows(),
    fetchReconciledEntries(1, 20),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/bank">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bank Reconciliation</h1>
            <p className="text-muted-foreground">Link sales to bank deposits for accurate tracking</p>
          </div>
        </div>
      </div>

      <Suspense fallback={<div>Loading reconciliation data...</div>}>
        <ReconciliationClient
          unreconciledSales={unreconciledSales}
          unreconciledBankInflows={unreconciledBankInflows}
          reconciledEntries={reconciledData.entries}
        />
      </Suspense>
    </div>
  )
}

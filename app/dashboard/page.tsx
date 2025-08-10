import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { fetchCardData } from "@/lib/data/dashboard"
import { DollarSign, ShoppingCart, Package } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { formatMoney } from "@/lib/currency"

function toIntSafe(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) ? Math.trunc(n) : 0
}

export default async function DashboardPage() {
  const supabase = createClient()
  let userEmail: string | null = null

  try {
    const { data, error } = await supabase.auth.getUser()
    if (!error && data?.user) userEmail = data.user.email ?? null
  } catch (e) {
    console.error("dashboard: auth.getUser failed", e)
  }

  // Resilient: returns zeros on failure; never throws
  const { totalSales, totalExpenses, totalProducts } = await fetchCardData()

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        {userEmail ? `Signed in as ${userEmail}` : "No user session detected."}
      </p>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Overview</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(totalSales)}</div>
            <p className="text-xs text-muted-foreground">Total revenue from all sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">Total amount spent on expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products in Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toIntSafe(totalProducts)}</div>
            <p className="text-xs text-muted-foreground">Sum of all product quantities</p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getDashboardData } from "@/lib/data/dashboard"

export default async function DashboardPage() {
  const cookieStore = cookies()

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })

  const dashboardData = await getDashboardData(supabase)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">Bienvenue dans le système ERP Solar Vision</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des ventes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalSales}</div>
            <p className="text-xs text-muted-foreground">+20,1% par rapport au mois dernier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalProducts}</div>
            <p className="text-xs text-muted-foreground">+180,1% par rapport au mois dernier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalClients}</div>
            <p className="text-xs text-muted-foreground">+19% par rapport au mois dernier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fournisseurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">+201 depuis la dernière heure</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Ventes récentes</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
              {dashboardData.recentSales.map((sale, index) => (
                <div key={index} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">Vente #{sale.id}</p>
                    <p className="text-sm text-muted-foreground">{sale.client_name}</p>
                  </div>
                  <div className="ml-auto font-medium">
                    {process.env.NEXT_PUBLIC_CURRENCY || "FCFA"} {sale.total_amount}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Articles en rupture de stock</CardTitle>
            <CardDescription>Articles qui nécessitent un réapprovisionnement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.lowStockItems.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Stock: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

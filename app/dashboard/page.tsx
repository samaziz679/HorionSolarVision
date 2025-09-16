import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getDashboardData } from "@/lib/data/dashboard"
import { getCompanyConfig } from "@/lib/config/company"
import { formatMoney } from "@/lib/currency"

export default async function DashboardPage() {
  const cookieStore = cookies()
  const company = getCompanyConfig()

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
        <h1 className="text-3xl font-bold tracking-tight text-solar-orange">Tableau de bord</h1>
        <p className="text-muted-foreground">{company.tagline}</p>
      </div>

      {/* ... existing dashboard cards ... */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-solar-orange">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des ventes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-solar-orange">{dashboardData.totalSales}</div>
            <p className="text-xs text-muted-foreground">+20,1% par rapport au mois dernier</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-sky-blue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-blue">{dashboardData.totalProducts}</div>
            <p className="text-xs text-muted-foreground">+180,1% par rapport au mois dernier</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dashboardData.totalClients}</div>
            <p className="text-xs text-muted-foreground">+19% par rapport au mois dernier</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fournisseurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{dashboardData.totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">+201 depuis la dernière heure</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-orange-50/30">
          <CardHeader>
            <CardTitle className="text-solar-orange">Ventes récentes</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
              {dashboardData.recentSales.map((sale, index) => (
                <div key={index} className="flex items-center p-2 rounded-lg hover:bg-orange-50/50 transition-colors">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">Vente #{sale.id}</p>
                    <p className="text-sm text-muted-foreground">{sale.client_name}</p>
                  </div>
                  <div className="ml-auto font-medium text-solar-orange">{formatMoney(sale.total_amount)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader>
            <CardTitle className="text-sky-blue">Articles en rupture de stock</CardTitle>
            <CardDescription>Articles qui nécessitent un réapprovisionnement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.lowStockItems.length > 0 ? (
                dashboardData.lowStockItems.map((item, index) => (
                  <div key={index} className="flex items-center p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                    <div className="ml-4 space-y-1 flex-1">
                      <p className="text-sm font-medium leading-none">{item.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                          Stock:{" "}
                          <span className={`font-medium ${item.quantity === 0 ? "text-red-600" : "text-amber-600"}`}>
                            {item.quantity}
                          </span>
                        </p>
                        <span className="text-xs text-muted-foreground">/ Seuil: {item.threshold}</span>
                      </div>
                    </div>
                    <div className="ml-auto">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          item.status === "Critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.status === "Critical" ? "Rupture" : "Stock Bas"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Aucun article en rupture de stock</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

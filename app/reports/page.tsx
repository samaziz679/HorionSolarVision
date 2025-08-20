"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  AlertTriangle,
  Target,
  PieChart,
  BarChart3,
  Calendar,
  Percent,
} from "lucide-react"
import { getAnalyticsData } from "@/lib/data/analytics"

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { period?: string }
}) {
  const analytics = await getAnalyticsData(searchParams.period)

  const profitMargin =
    analytics.totalRevenue > 0 ? ((analytics.netProfit / analytics.totalRevenue) * 100).toFixed(1) : 0

  const expenseRatio =
    analytics.totalRevenue > 0 ? ((analytics.totalExpenses / analytics.totalRevenue) * 100).toFixed(1) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rapports & Analyses</h1>
          <p className="text-muted-foreground">Tableau de bord analytique pour la prise de décision</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            className="px-3 py-2 border rounded-md text-sm"
            defaultValue={searchParams.period || "all"}
            onChange={(e) => {
              const url = new URL(window.location.href)
              if (e.target.value === "all") {
                url.searchParams.delete("period")
              } else {
                url.searchParams.set("period", e.target.value)
              }
              window.location.href = url.toString()
            }}
          >
            <option value="all">6 derniers mois</option>
            <option value="current-month">Mois actuel</option>
            <option value="last-month">Mois dernier</option>
          </select>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Période: {analytics.currentPeriod}</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="financial">Financier</TabsTrigger>
          <TabsTrigger value="inventory">Inventaire</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Performance Indicators */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  Chiffre d'Affaires
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{analytics.totalRevenue.toLocaleString()} FCFA</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  {analytics.revenueGrowth >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                  )}
                  {analytics.revenueGrowth >= 0 ? "+" : ""}
                  {analytics.revenueGrowth}% vs mois dernier
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  Bénéfice Net
                  <Target className="h-4 w-4 text-blue-600" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${analytics.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {analytics.netProfit.toLocaleString()} FCFA
                </div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <Percent className="h-3 w-3 mr-1" />
                  Marge: {profitMargin}%
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  Dépenses Totales
                  <ShoppingCart className="h-4 w-4 text-orange-600" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {analytics.totalExpenses.toLocaleString()} FCFA
                </div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <Percent className="h-3 w-3 mr-1" />
                  {expenseRatio}% du CA
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  Clients Actifs
                  <Users className="h-4 w-4 text-purple-600" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{analytics.activeClients}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  {analytics.clientGrowth >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                  )}
                  {analytics.clientGrowth >= 0 ? "+" : ""}
                  {analytics.clientGrowth}% ce mois
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Business Health Indicators */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Santé Financière
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Marge Bénéficiaire</span>
                    <span
                      className={
                        profitMargin >= 20 ? "text-green-600" : profitMargin >= 10 ? "text-yellow-600" : "text-red-600"
                      }
                    >
                      {profitMargin}%
                    </span>
                  </div>
                  <Progress value={Math.min(Number.parseFloat(profitMargin), 100)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Ratio Dépenses/CA</span>
                    <span
                      className={
                        expenseRatio <= 60 ? "text-green-600" : expenseRatio <= 80 ? "text-yellow-600" : "text-red-600"
                      }
                    >
                      {expenseRatio}%
                    </span>
                  </div>
                  <Progress value={Number.parseFloat(expenseRatio)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Croissance CA</span>
                    <span
                      className={
                        analytics.revenueGrowth >= 10
                          ? "text-green-600"
                          : analytics.revenueGrowth >= 0
                            ? "text-yellow-600"
                            : "text-red-600"
                      }
                    >
                      {analytics.revenueGrowth}%
                    </span>
                  </div>
                  <Progress value={Math.max(0, Math.min(analytics.revenueGrowth + 50, 100))} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Alertes Stock
                </CardTitle>
                <CardDescription>Produits nécessitant attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.lowStockItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Stock: {item.currentStock}</p>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        Critique
                      </Badge>
                    </div>
                  ))}
                  {analytics.lowStockItems.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucune alerte stock</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Top Produits
                </CardTitle>
                <CardDescription>Meilleures ventes ce mois</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            index === 0
                              ? "bg-yellow-500"
                              : index === 1
                                ? "bg-gray-400"
                                : index === 2
                                  ? "bg-orange-500"
                                  : "bg-blue-500"
                          }`}
                        />
                        <span className="text-sm font-medium">{product.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{product.sales}</p>
                        <p className="text-xs text-muted-foreground">{product.revenue.toLocaleString()} FCFA</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Analyse des Revenus</CardTitle>
                <CardDescription>Répartition des sources de revenus</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.revenueBreakdown.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.category}</span>
                        <span className="font-medium">{item.amount.toLocaleString()} FCFA</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">{item.percentage}% du total</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analyse des Dépenses</CardTitle>
                <CardDescription>Répartition par catégorie</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.expenseBreakdown.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.category}</span>
                        <span className="font-medium text-red-600">{item.amount.toLocaleString()} FCFA</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">{item.percentage}% du total</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Flux de Trésorerie</CardTitle>
              <CardDescription>Évolution mensuelle des entrées et sorties</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mois</TableHead>
                    <TableHead>Revenus</TableHead>
                    <TableHead>Dépenses</TableHead>
                    <TableHead>Bénéfice Net</TableHead>
                    <TableHead>Marge</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.cashFlow.map((month, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{month.month}</TableCell>
                      <TableCell className="text-green-600">+{month.revenue.toLocaleString()} FCFA</TableCell>
                      <TableCell className="text-red-600">-{month.expenses.toLocaleString()} FCFA</TableCell>
                      <TableCell
                        className={month.profit >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}
                      >
                        {month.profit >= 0 ? "+" : ""}
                        {month.profit.toLocaleString()} FCFA
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={month.margin >= 20 ? "default" : month.margin >= 10 ? "secondary" : "destructive"}
                        >
                          {month.margin}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>État des Stocks</CardTitle>
                <CardDescription>Valeur et rotation des stocks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Valeur Totale Stock</span>
                  <span className="text-lg font-bold text-blue-600">
                    {analytics.inventoryValue.toLocaleString()} FCFA
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Rotation Stock (mois)</span>
                  <span className="text-lg font-bold text-green-600">{analytics.inventoryTurnover}x</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium">Produits en Rupture</span>
                  <span className="text-lg font-bold text-orange-600">{analytics.outOfStockItems}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mouvements de Stock</CardTitle>
                <CardDescription>Activité récente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.recentStockMovements.map((movement, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{movement.product}</p>
                        <p className="text-xs text-muted-foreground">{movement.type}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${movement.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                          {movement.quantity > 0 ? "+" : ""}
                          {movement.quantity}
                        </p>
                        <p className="text-xs text-muted-foreground">{movement.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Objectifs Mensuels</CardTitle>
                <CardDescription>Progression vers les objectifs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Chiffre d'Affaires</span>
                    <span>
                      {analytics.salesTarget.achieved.toLocaleString()} /{" "}
                      {analytics.salesTarget.target.toLocaleString()} FCFA
                    </span>
                  </div>
                  <Progress value={analytics.salesTarget.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{analytics.salesTarget.percentage}% atteint</p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Nouveaux Clients</span>
                    <span>
                      {analytics.clientTarget.achieved} / {analytics.clientTarget.target}
                    </span>
                  </div>
                  <Progress value={analytics.clientTarget.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{analytics.clientTarget.percentage}% atteint</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Clients</CardTitle>
                <CardDescription>Clients les plus rentables</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topClients.map((client, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            index === 0
                              ? "bg-yellow-500"
                              : index === 1
                                ? "bg-gray-400"
                                : index === 2
                                  ? "bg-orange-500"
                                  : "bg-blue-500"
                          }`}
                        />
                        <span className="text-sm font-medium">{client.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{client.totalSales.toLocaleString()} FCFA</p>
                        <p className="text-xs text-muted-foreground">{client.orders} commandes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommandations</CardTitle>
                <CardDescription>Actions suggérées</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-l-4 ${
                        rec.priority === "high"
                          ? "border-l-red-500 bg-red-50"
                          : rec.priority === "medium"
                            ? "border-l-yellow-500 bg-yellow-50"
                            : "border-l-blue-500 bg-blue-50"
                      }`}
                    >
                      <p className="text-sm font-medium">{rec.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

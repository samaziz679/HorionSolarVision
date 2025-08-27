"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
  AlertTriangle,
  Target,
  PieChart,
  BarChart3,
  Calendar,
  Percent,
  Printer,
} from "lucide-react"
import { getAnalyticsData, type AnalyticsData } from "@/lib/data/analytics-client"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"

export default function ReportsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<string>("all")

  const handlePrint = () => {
    window.print()
  }

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        let startDate: string | undefined
        let endDate: string | undefined

        const now = new Date()
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth()

        switch (period) {
          case "current-month":
            startDate = new Date(currentYear, currentMonth, 1).toISOString().split("T")[0]
            endDate = new Date(currentYear, currentMonth + 1, 0).toISOString().split("T")[0]
            break
          case "last-month":
            startDate = new Date(currentYear, currentMonth - 1, 1).toISOString().split("T")[0]
            endDate = new Date(currentYear, currentMonth, 0).toISOString().split("T")[0]
            break
          case "all":
          default:
            // Last 6 months
            startDate = new Date(currentYear, currentMonth - 6, 1).toISOString().split("T")[0]
            endDate = now.toISOString().split("T")[0]
            break
        }

        const data = await getAnalyticsData(startDate, endDate)
        setAnalytics(data)
      } catch (error) {
        console.error("Error fetching analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [period])

  if (loading || !analytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/dashboard">Tableau de bord</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink>Rapports & Analyses</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-3xl font-bold mt-2">Rapports & Analyses</h1>
            <p className="text-muted-foreground">Chargement des données analytiques...</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const profitMargin =
    analytics.totalRevenue > 0 ? ((analytics.netProfit / analytics.totalRevenue) * 100).toFixed(1) : "0"
  const expenseRatio =
    analytics.totalRevenue > 0 ? ((analytics.totalExpenses / analytics.totalRevenue) * 100).toFixed(1) : "0"

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-break {
            page-break-before: always;
          }
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          .tabs-content {
            display: block !important;
          }
          .tabs-content[data-state="inactive"] {
            display: none !important;
          }
        }
      `}</style>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Breadcrumb className="no-print">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/dashboard">Tableau de bord</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink>Rapports & Analyses</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-3xl font-bold mt-2">Rapports & Analyses</h1>
            <p className="text-muted-foreground">Tableau de bord analytique pour la prise de décision</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={handlePrint} variant="outline" size="sm" className="no-print bg-transparent">
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-48 no-print">
                <SelectValue placeholder="Sélectionner une période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">6 derniers mois</SelectItem>
                <SelectItem value="current-month">Mois actuel</SelectItem>
                <SelectItem value="last-month">Mois dernier</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Période:{" "}
                {period === "all" ? "6 derniers mois" : period === "current-month" ? "août 2025" : "juillet 2025"}
              </span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 no-print">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="financial">Financier</TabsTrigger>
            <TabsTrigger value="inventory">Inventaire</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 tabs-content">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    Chiffre d'Affaires
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {analytics.totalRevenue.toLocaleString()} FCFA
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    +0% vs mois dernier
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
                  <div className="text-2xl font-bold text-purple-600">{analytics.totalClients}</div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    +0% ce mois
                  </p>
                </CardContent>
              </Card>
            </div>

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
                          Number(profitMargin) >= 20
                            ? "text-green-600"
                            : Number(profitMargin) >= 10
                              ? "text-yellow-600"
                              : "text-red-600"
                        }
                      >
                        {profitMargin}%
                      </span>
                    </div>
                    <Progress value={Math.min(Number(profitMargin), 100)} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Ratio Dépenses/CA</span>
                      <span
                        className={
                          Number(expenseRatio) <= 60
                            ? "text-green-600"
                            : Number(expenseRatio) <= 80
                              ? "text-yellow-600"
                              : "text-red-600"
                        }
                      >
                        {expenseRatio}%
                      </span>
                    </div>
                    <Progress value={Number(expenseRatio)} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Croissance CA</span>
                      <span className="text-yellow-600">0%</span>
                    </div>
                    <Progress value={50} className="h-2" />
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
                    {analytics.stockAlerts.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Stock: {item.currentStock}</p>
                        </div>
                        <Badge variant={item.status === "critical" ? "destructive" : "secondary"} className="text-xs">
                          {item.status === "critical" ? "Critique" : "Faible"}
                        </Badge>
                      </div>
                    ))}
                    {analytics.stockAlerts.length === 0 && (
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
                            className={`w-2 h-2 rounded-full ${index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-orange-500" : "bg-blue-500"}`}
                          />
                          <span className="text-sm font-medium">{product.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{product.quantity}</p>
                          <p className="text-xs text-muted-foreground">{product.revenue.toLocaleString()} FCFA</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6 tabs-content">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Analyse des Revenus</CardTitle>
                  <CardDescription>Répartition des sources de revenus</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.revenueBySource.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{item.source}</span>
                          <span className="font-medium">{item.amount.toLocaleString()} FCFA</span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground">{item.percentage}% du total</p>
                      </div>
                    ))}
                    {analytics.revenueBySource.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">Aucune donnée de revenus</p>
                    )}
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
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Données de dépenses par catégorie à venir
                    </p>
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
                    {analytics.monthlyData.map((month, index) => (
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
                            {month.margin.toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {analytics.monthlyData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                          Aucune donnée mensuelle disponible
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6 tabs-content">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>État des Stocks</CardTitle>
                  <CardDescription>Valeur et rotation des stocks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">Valeur Stock (Prix Achat)</span>
                      <span className="text-lg font-bold text-blue-600">
                        {analytics.totalStockValue.toLocaleString()} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Valeur Stock (Prix Détail 1)</span>
                      <span className="text-lg font-bold text-green-600">
                        {analytics.stockValueDetail1.toLocaleString()} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium">Valeur Stock (Prix Détail 2)</span>
                      <span className="text-lg font-bold text-purple-600">
                        {analytics.stockValueDetail2.toLocaleString()} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium">Valeur Stock (Prix Gros)</span>
                      <span className="text-lg font-bold text-orange-600">
                        {analytics.stockValueGros.toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Rotation Stock (mois)</span>
                      <span className="text-lg font-bold text-gray-600">{analytics.stockRotation}x</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium">Produits en Rupture</span>
                      <span className="text-lg font-bold text-red-600">{analytics.outOfStockCount}</span>
                    </div>
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
                    {analytics.stockMovements.map((movement, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-2 h-2 rounded-full ${movement.type === "sale" ? "bg-red-500" : "bg-green-500"}`}
                          />
                          <div>
                            <p className="text-sm font-medium">{movement.product}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(movement.date).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-sm font-bold ${movement.quantity < 0 ? "text-red-600" : "text-green-600"}`}
                          >
                            {movement.quantity > 0 ? "+" : ""}
                            {movement.quantity}
                          </p>
                          <p className="text-xs text-muted-foreground">{movement.value.toLocaleString()} FCFA</p>
                        </div>
                      </div>
                    ))}
                    {analytics.stockMovements.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">Aucun mouvement de stock récent</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6 tabs-content">
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
                      <span>{analytics.totalRevenue.toLocaleString()} / 2,000,000 FCFA</span>
                    </div>
                    <Progress value={Math.min((analytics.totalRevenue / 2000000) * 100, 100)} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.min((analytics.totalRevenue / 2000000) * 100, 100).toFixed(1)}% atteint
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Nouveaux Clients</span>
                      <span>0 / 10</span>
                    </div>
                    <Progress value={0} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">0% atteint</p>
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
                            className={`w-2 h-2 rounded-full ${index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-orange-500" : "bg-blue-500"}`}
                          />
                          <span className="text-sm font-medium">{client.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{client.totalSpent.toLocaleString()} FCFA</p>
                          <p className="text-xs text-muted-foreground">{client.orderCount} commandes</p>
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
                    <div className="p-3 rounded-lg border-l-4 border-l-red-500 bg-red-50">
                      <p className="text-sm font-medium">Enregistrer Vos Premières Ventes</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Commencez par enregistrer vos ventes pour voir les analyses en temps réel.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg border-l-4 border-l-yellow-500 bg-yellow-50">
                      <p className="text-sm font-medium">Développer la Base Client</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Concentrez-vous sur l'acquisition de nouveaux clients pour augmenter les ventes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

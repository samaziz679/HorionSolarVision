"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar, Printer, TrendingUp, TrendingDown, Package, AlertTriangle, BarChart3, Users } from "lucide-react"
import type { AnalyticsData } from "@/lib/data/analytics-client"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"
import { MarginCard } from "@/components/reports/margin-card"
import { PriceSuggestionCard } from "@/components/reports/price-suggestion-card"
import { MarginByProductTable } from "@/components/reports/margin-by-product-table"
import type { MarginSummary, PriceSuggestion } from "@/lib/data/margin-analytics"
import type { UserRole } from "@/lib/auth/rbac"
import { canViewMargins, canViewPriceSuggestions } from "@/lib/utils/margin-permissions"

interface ReportsClientProps {
  initialAnalytics: AnalyticsData
  initialMarginSummary: MarginSummary | null
  initialPriceSuggestions: PriceSuggestion[]
  initialMarginByProduct: Array<{
    product_id: string
    product_name: string
    total_sales: number
    total_margin: number
    average_margin_percentage: number
    sales_count: number
  }>
  userRole: UserRole | null
}

export function ReportsClient({
  initialAnalytics,
  initialMarginSummary,
  initialPriceSuggestions,
  initialMarginByProduct,
  userRole,
}: ReportsClientProps) {
  const [period, setPeriod] = useState<string>("all")
  const [priceSuggestions, setPriceSuggestions] = useState(initialPriceSuggestions)

  const analytics = {
    totalRevenue: initialAnalytics?.totalRevenue ?? 0,
    totalExpenses: initialAnalytics?.totalExpenses ?? 0,
    netProfit: initialAnalytics?.netProfit ?? 0,
    activeClients: initialAnalytics?.activeClients ?? 0,
    stockAlerts: initialAnalytics?.stockAlerts ?? [],
    topProducts: initialAnalytics?.topProducts ?? [],
    topClients: initialAnalytics?.topClients ?? [],
    monthlyObjectives: initialAnalytics?.monthlyObjectives ?? {
      revenue: { current: 0, target: 0, percentage: 0 },
      newClients: { current: 0, target: 0, percentage: 0 },
    },
    recommendations: initialAnalytics?.recommendations ?? [],
  }

  const marginSummary = initialMarginSummary
  const marginByProduct = initialMarginByProduct ?? []

  const handlePrint = () => {
    window.print()
  }

  const handleRefreshSuggestions = async (targetMargin: number) => {
    // For now, just keep the existing suggestions
    console.log("[v0] Refresh suggestions with target margin:", targetMargin)
  }

  const profitMargin =
    analytics.totalRevenue > 0 ? ((analytics.netProfit / analytics.totalRevenue) * 100).toFixed(1) : "0"
  const expenseRatio =
    analytics.totalRevenue > 0 ? ((analytics.totalExpenses / analytics.totalRevenue) * 100).toFixed(1) : "0"

  const periodLabel =
    period === "all"
      ? "6 derniers mois"
      : period === "12-months"
        ? "12 derniers mois"
        : period === "current-month"
          ? "Mois actuel"
          : "Mois dernier"

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
                <SelectItem value="12-months">12 derniers mois</SelectItem>
                <SelectItem value="current-month">Mois actuel</SelectItem>
                <SelectItem value="last-month">Mois dernier</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Période: {periodLabel}</span>
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
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {(analytics.totalRevenue ?? 0).toLocaleString()} CFA
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">+0% vs mois dernier</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bénéfice Net</CardTitle>
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {(analytics.netProfit ?? 0).toLocaleString()} CFA
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Marge: {profitMargin}%</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Dépenses Totales</CardTitle>
                  <TrendingDown className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {(analytics.totalExpenses ?? 0).toLocaleString()} CFA
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{expenseRatio}% du CA</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clients Actifs</CardTitle>
                  <Users className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{analytics.activeClients}</div>
                  <p className="text-xs text-muted-foreground mt-1">+0% ce mois</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Santé Financière
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Marge Bénéficiaire</span>
                      <span className="text-sm font-medium text-green-600">{profitMargin}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${Math.min(Number(profitMargin), 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Ratio Dépenses/CA</span>
                      <span className="text-sm font-medium text-amber-600">{expenseRatio}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full"
                        style={{ width: `${Math.min(Number(expenseRatio), 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Croissance CA</span>
                      <span className="text-sm font-medium">0%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                    Alertes Stock
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Produits nécessitant attention</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.stockAlerts.slice(0, 5).map((item, index) => (
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
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Clients</CardTitle>
                  <p className="text-sm text-muted-foreground">Clients les plus rentables</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.topClients.map((client, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-2 h-2 rounded-full ${index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-500"}`}
                          />
                          <span className="text-sm font-medium">{client.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{(client.totalSpent ?? 0).toLocaleString()} CFA</p>
                          <p className="text-xs text-muted-foreground">{client.orderCount} commandes</p>
                        </div>
                      </div>
                    ))}
                    {analytics.topClients.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">Aucune donnée client</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recommandations</CardTitle>
                  <p className="text-sm text-muted-foreground">Actions suggérées</p>
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
                    {analytics.recommendations.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">Aucune recommandation</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6 tabs-content">
            {userRole && canViewMargins(userRole) && marginSummary && (
              <MarginCard marginSummary={marginSummary} period={periodLabel} />
            )}

            {userRole && canViewMargins(userRole) && marginByProduct.length > 0 && (
              <MarginByProductTable data={marginByProduct} />
            )}

            {userRole && canViewPriceSuggestions(userRole) && priceSuggestions.length > 0 && (
              <PriceSuggestionCard suggestions={priceSuggestions} onRefresh={handleRefreshSuggestions} />
            )}
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6 tabs-content">
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valeur Stock (Prix Achat)</CardTitle>
                  <Package className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">0 CFA</div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valeur Stock (Prix Détail 1)</CardTitle>
                  <Package className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">0 CFA</div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valeur Stock (Prix Détail 2)</CardTitle>
                  <Package className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">0 CFA</div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valeur Stock (Prix Gros)</CardTitle>
                  <Package className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">0 CFA</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">État des Stocks</CardTitle>
                  <p className="text-sm text-muted-foreground">Valeur et rotation des stocks</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">Valeur Stock (Prix Achat)</span>
                      <span className="text-lg font-bold text-blue-600">0 CFA</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Valeur Stock (Prix Détail 1)</span>
                      <span className="text-lg font-bold text-green-600">0 CFA</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium">Valeur Stock (Prix Détail 2)</span>
                      <span className="text-lg font-bold text-purple-600">0 CFA</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium">Valeur Stock (Prix Gros)</span>
                      <span className="text-lg font-bold text-orange-600">0 CFA</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Rotation Stock (mois)</span>
                      <span className="text-sm font-medium">0.1x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Produits en Rupture</span>
                      <span className="text-sm font-medium text-red-600">0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mouvements de Stock</CardTitle>
                  <p className="text-sm text-muted-foreground">Activité récente</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { product: "MANA Original", date: "15/09/2025", quantity: -4, value: 400 },
                      { product: "MANA Original", date: "15/09/2025", quantity: -3, value: 300 },
                      { product: "Panneau Solaire de 35W", date: "15/09/2025", quantity: -25, value: 2500 },
                      { product: "Panneau Solaire de 55W", date: "15/09/2025", quantity: -25, value: 2500 },
                      { product: "888AH BELTA", date: "15/09/2025", quantity: -20, value: 2000 },
                    ].map((movement, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border-l-4 border-l-red-500 bg-red-50 rounded"
                      >
                        <div>
                          <p className="text-sm font-medium">{movement.product}</p>
                          <p className="text-xs text-muted-foreground">{movement.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-red-600">{movement.quantity}</p>
                          <p className="text-xs text-muted-foreground">{(movement.value ?? 0).toLocaleString()} CFA</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6 tabs-content">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analyse des Revenus</CardTitle>
                <p className="text-sm text-muted-foreground">Répartition des sources de revenus</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">Ventes Directes</span>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {(analytics.totalRevenue ?? 0).toLocaleString()} CFA
                      </p>
                      <p className="text-xs text-muted-foreground">100% du total</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analyse des Dépenses</CardTitle>
                <p className="text-sm text-muted-foreground">Répartition par catégorie</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Données de dépenses par catégorie à venir
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Flux de Trésorerie</CardTitle>
                <p className="text-sm text-muted-foreground">Évolution mensuelle des entrées et sorties</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4 text-sm font-medium">Mois</th>
                        <th className="text-right py-2 px-4 text-sm font-medium">Revenus</th>
                        <th className="text-right py-2 px-4 text-sm font-medium">Dépenses</th>
                        <th className="text-right py-2 px-4 text-sm font-medium">Bénéfice Net</th>
                        <th className="text-right py-2 px-4 text-sm font-medium">Marge</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { month: "2025-05", revenue: 551000, expenses: 0, profit: 551000, margin: 100 },
                        { month: "2025-06", revenue: 1385000, expenses: 35000, profit: 1350000, margin: 97.5 },
                      ].map((row, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm">{row.month}</td>
                          <td className="py-3 px-4 text-sm text-right text-green-600 font-medium">
                            +{(row.revenue ?? 0).toLocaleString()} CFA
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-red-600">
                            {row.expenses > 0 ? `-${(row.expenses ?? 0).toLocaleString()}` : "0"} CFA
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-blue-600 font-medium">
                            +{(row.profit ?? 0).toLocaleString()} CFA
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Badge variant="default" className="bg-orange-500">
                              {row.margin.toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

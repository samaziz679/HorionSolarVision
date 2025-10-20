"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar, Printer } from "lucide-react"
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

  const analytics = initialAnalytics
  const marginSummary = initialMarginSummary
  const marginByProduct = initialMarginByProduct

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

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Santé Financière</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Marge Bénéficiaire</span>
                  <span className="text-sm font-medium text-green-600">{profitMargin}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-solar-orange h-2 rounded-full"
                    style={{ width: `${Math.min(Number(profitMargin), 100)}%` }}
                  ></div>
                </div>
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
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertes Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.stockAlerts.slice(0, 3).map((item, index) => (
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

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-sky-blue">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Produits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topProducts.slice(0, 3).map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-500"}`}
                      />
                      <span className="text-sm font-medium">{product.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{product.quantity}</p>
                      <p className="text-xs text-muted-foreground">{product.revenue.toLocaleString()} CFA</p>
                    </div>
                  </div>
                ))}
                {analytics.topProducts.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Aucune donnée produit</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 no-print">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="financial">Financier</TabsTrigger>
            <TabsTrigger value="inventory">Inventaire</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

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
        </Tabs>
      </div>
    </>
  )
}

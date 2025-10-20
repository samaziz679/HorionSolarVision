"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Suspense } from "react"
import { ReportsClient } from "@/components/reports/reports-client"
import { getAnalyticsData as getAnalyticsDataServer } from "@/lib/data/analytics"
import {
  getMarginSummary as getMarginSummaryServer,
  generatePriceSuggestions as generatePriceSuggestionsServer,
  getMarginByProduct as getMarginByProductServer,
  canViewMargins as canViewMarginsServer,
  canViewPriceSuggestions as canViewPriceSuggestionsServer,
} from "@/lib/data/margin-analytics"
import { getCurrentUserRole as getCurrentUserRoleServer } from "@/lib/auth/rbac"

export default async function ReportsPage() {
  const userRole = await getCurrentUserRoleServer()

  // Get date range for last 6 months
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString().split("T")[0]
  const endDate = now.toISOString().split("T")[0]

  // Fetch analytics data
  const analytics = await getAnalyticsDataServer(startDate, endDate)

  // Fetch margin data if user has permission
  let marginSummary = null
  let priceSuggestions = []
  let marginByProduct = []

  if (userRole && canViewMarginsServer(userRole)) {
    marginSummary = await getMarginSummaryServer(startDate, endDate)
    marginByProduct = await getMarginByProductServer(startDate, endDate)
  }

  if (userRole && canViewPriceSuggestionsServer(userRole)) {
    priceSuggestions = await generatePriceSuggestionsServer(30)
  }

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
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
      }
    >
      <ReportsClient
        initialAnalytics={analytics}
        initialMarginSummary={marginSummary}
        initialPriceSuggestions={priceSuggestions}
        initialMarginByProduct={marginByProduct}
        userRole={userRole}
      />
    </Suspense>
  )
}

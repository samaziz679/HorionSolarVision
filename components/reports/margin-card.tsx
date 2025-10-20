"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Percent } from "lucide-react"
import type { MarginSummary } from "@/lib/data/margin-analytics"

interface MarginCardProps {
  marginSummary: MarginSummary
  period: string
}

export function MarginCard({ marginSummary, period }: MarginCardProps) {
  const marginColor =
    marginSummary.average_margin_percentage >= 30
      ? "text-green-600"
      : marginSummary.average_margin_percentage >= 20
        ? "text-yellow-600"
        : "text-red-600"

  const progressColor =
    marginSummary.average_margin_percentage >= 30
      ? "bg-green-500"
      : marginSummary.average_margin_percentage >= 20
        ? "bg-yellow-500"
        : "bg-red-500"

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Percent className="h-5 w-5 mr-2" />
          Analyse des Marges
        </CardTitle>
        <CardDescription>Performance financière - {period}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Chiffre d'Affaires</p>
            <p className="text-2xl font-bold text-green-600">{marginSummary.total_sales.toLocaleString()} CFA</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Coût d'Achat</p>
            <p className="text-2xl font-bold text-orange-600">{marginSummary.total_cost.toLocaleString()} CFA</p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Marge Brute Totale</p>
          <p className="text-3xl font-bold text-blue-600">{marginSummary.total_margin.toLocaleString()} CFA</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Marge Moyenne</span>
            <span className={`text-lg font-bold ${marginColor}`}>
              {marginSummary.average_margin_percentage.toFixed(1)}%
            </span>
          </div>
          <Progress value={Math.min(marginSummary.average_margin_percentage, 100)} className={`h-3 ${progressColor}`} />
          <p className="text-xs text-muted-foreground">
            {marginSummary.sales_count} vente{marginSummary.sales_count > 1 ? "s" : ""} analysée
            {marginSummary.sales_count > 1 ? "s" : ""}
          </p>
        </div>

        <div className="pt-4 border-t space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Objectif de marge</span>
            <span className="font-medium">30%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Performance</span>
            <span className={marginColor}>
              {marginSummary.average_margin_percentage >= 30
                ? "Excellent"
                : marginSummary.average_margin_percentage >= 20
                  ? "Bon"
                  : "À améliorer"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

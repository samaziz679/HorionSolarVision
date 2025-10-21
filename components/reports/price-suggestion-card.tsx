"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lightbulb } from "lucide-react"
import type { PriceSuggestion } from "@/lib/data/margin-analytics"

interface PriceSuggestionCardProps {
  suggestions: PriceSuggestion[]
  onRefresh?: (targetMargin: number) => void
  isRecalculating?: boolean
}

export function PriceSuggestionCard({ suggestions, onRefresh, isRecalculating = false }: PriceSuggestionCardProps) {
  const [targetMargin, setTargetMargin] = useState(30)

  const recalculatedSuggestions = useMemo(() => {
    return suggestions.map((suggestion) => {
      const purchasePrice = suggestion.current_purchase_price ?? 0
      const marginDecimal = targetMargin / 100

      // Calculate suggested prices using the formula: price = cost / (1 - margin%)
      const suggestedPriceDetail1 = purchasePrice > 0 ? Math.round(purchasePrice / (1 - marginDecimal)) : 0
      const suggestedPriceDetail2 = purchasePrice > 0 ? Math.round(purchasePrice / (1 - marginDecimal)) : 0
      const suggestedPriceGros = purchasePrice > 0 ? Math.round(purchasePrice / (1 - marginDecimal)) : 0

      return {
        ...suggestion,
        suggested_price_detail1: suggestedPriceDetail1,
        suggested_price_detail2: suggestedPriceDetail2,
        suggested_price_gros: suggestedPriceGros,
      }
    })
  }, [suggestions, targetMargin])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
          Suggestions de Prix de Vente
        </CardTitle>
        <CardDescription>Prix recommandés basés sur la marge cible</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex-1">
            <Label htmlFor="target-margin">Marge Cible (%)</Label>
            <Input
              id="target-margin"
              type="number"
              min="0"
              max="200"
              value={targetMargin}
              onChange={(e) => setTargetMargin(Number(e.target.value))}
              className="mt-1"
            />
          </div>
          <div className="text-sm text-muted-foreground px-4 py-2 bg-green-50 rounded border border-green-200">
            Prix mis à jour automatiquement
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead className="text-right">Prix Achat</TableHead>
                <TableHead className="text-right">Détail 1</TableHead>
                <TableHead className="text-right">Détail 2</TableHead>
                <TableHead className="text-right">Gros</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recalculatedSuggestions.slice(0, 10).map((suggestion) => (
                <TableRow key={suggestion.product_id}>
                  <TableCell className="font-medium">{suggestion.product_name}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {(suggestion.current_purchase_price ?? 0).toLocaleString()} CFA
                  </TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    {(suggestion.suggested_price_detail1 ?? 0).toLocaleString()} CFA
                  </TableCell>
                  <TableCell className="text-right font-medium text-blue-600">
                    {(suggestion.suggested_price_detail2 ?? 0).toLocaleString()} CFA
                  </TableCell>
                  <TableCell className="text-right font-medium text-orange-600">
                    {(suggestion.suggested_price_gros ?? 0).toLocaleString()} CFA
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {recalculatedSuggestions.length > 10 && (
          <p className="text-sm text-muted-foreground text-center">
            Affichage de 10 sur {recalculatedSuggestions.length} produits
          </p>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Lightbulb, ChevronLeft, ChevronRight } from "lucide-react"
import type { PriceSuggestion } from "@/lib/data/margin-analytics"

interface PriceSuggestionCardProps {
  suggestions: PriceSuggestion[]
  onRefresh?: (targetMargin: number) => void
  isRecalculating?: boolean
}

export function PriceSuggestionCard({ suggestions, onRefresh, isRecalculating = false }: PriceSuggestionCardProps) {
  const [targetMargin, setTargetMargin] = useState(30)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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

  const totalPages = Math.ceil(recalculatedSuggestions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentSuggestions = recalculatedSuggestions.slice(startIndex, endIndex)

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

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
              {currentSuggestions.map((suggestion) => (
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

        {recalculatedSuggestions.length > itemsPerPage && (
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Affichage de {startIndex + 1} à {Math.min(endIndex, recalculatedSuggestions.length)} sur{" "}
              {recalculatedSuggestions.length} produits
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="gap-1 bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Page {currentPage} sur {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="gap-1 bg-transparent"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

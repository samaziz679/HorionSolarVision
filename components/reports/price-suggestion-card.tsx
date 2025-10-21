"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Lightbulb, Calculator } from "lucide-react"
import type { PriceSuggestion } from "@/lib/data/margin-analytics"

interface PriceSuggestionCardProps {
  suggestions: PriceSuggestion[]
  onRefresh: (targetMargin: number) => void
  isRecalculating?: boolean
}

export function PriceSuggestionCard({ suggestions, onRefresh, isRecalculating = false }: PriceSuggestionCardProps) {
  const [targetMargin, setTargetMargin] = useState(30)

  const handleRecalculate = () => {
    console.log("[v0] PriceSuggestionCard: Recalculate button clicked")
    console.log("[v0] PriceSuggestionCard: Target margin:", targetMargin)
    console.log("[v0] PriceSuggestionCard: Is recalculating:", isRecalculating)

    if (targetMargin > 0 && targetMargin <= 200) {
      console.log("[v0] PriceSuggestionCard: Calling onRefresh with target margin:", targetMargin)
      onRefresh(targetMargin)
    } else {
      console.log("[v0] PriceSuggestionCard: Invalid target margin, not calling onRefresh")
    }
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
              disabled={isRecalculating}
            />
          </div>
          <Button onClick={handleRecalculate} size="sm" disabled={isRecalculating}>
            <Calculator className="h-4 w-4 mr-2" />
            {isRecalculating ? "Calcul..." : "Recalculer"}
          </Button>
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
              {suggestions.slice(0, 10).map((suggestion) => (
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

        {suggestions.length > 10 && (
          <p className="text-sm text-muted-foreground text-center">Affichage de 10 sur {suggestions.length} produits</p>
        )}
      </CardContent>
    </Card>
  )
}

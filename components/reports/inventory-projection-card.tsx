"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrendingUp } from "lucide-react"

interface InventoryProjectionCardProps {
  currentValues: {
    purchasePrice: number
    retailPrice1: number
    retailPrice2: number
    wholesalePrice: number
  }
}

export function InventoryProjectionCard({ currentValues }: InventoryProjectionCardProps) {
  const [targetMargin, setTargetMargin] = useState(30)

  const projectedValues = useMemo(() => {
    const marginMultiplier = 1 / (1 - targetMargin / 100)

    return {
      retailPrice1: Math.round(currentValues.purchasePrice * marginMultiplier),
      retailPrice2: Math.round(currentValues.purchasePrice * marginMultiplier),
      wholesalePrice: Math.round(currentValues.purchasePrice * marginMultiplier),
    }
  }, [currentValues.purchasePrice, targetMargin])

  const differences = {
    retailPrice1: projectedValues.retailPrice1 - currentValues.retailPrice1,
    retailPrice2: projectedValues.retailPrice2 - currentValues.retailPrice2,
    wholesalePrice: projectedValues.wholesalePrice - currentValues.wholesalePrice,
  }

  const handleMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    if (value >= 0 && value <= 100) {
      setTargetMargin(value)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Projection de Valeur avec Marge Cible
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Valeur projetée du stock si tous les prix sont ajustés selon la marge cible
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="target-margin" className="text-sm font-medium">
              Marge Cible (%)
            </Label>
            <Input
              id="target-margin"
              type="number"
              min="0"
              max="100"
              value={targetMargin}
              onChange={handleMarginChange}
              className="mt-1"
            />
          </div>
          <div className="text-sm text-muted-foreground pt-6">Prix mis à jour automatiquement</div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border-l-4 border-l-blue-500">
            <div>
              <span className="text-sm font-medium">Valeur Stock (Prix Achat)</span>
              <p className="text-xs text-muted-foreground">Valeur actuelle</p>
            </div>
            <span className="text-lg font-bold text-blue-600">{currentValues.purchasePrice.toLocaleString()} CFA</span>
          </div>

          <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-l-4 border-l-green-500">
            <div>
              <span className="text-sm font-medium">Valeur Projetée (Prix Détail 1)</span>
              <p className="text-xs text-muted-foreground">
                Actuel: {currentValues.retailPrice1.toLocaleString()} CFA
                {differences.retailPrice1 !== 0 && (
                  <span className={differences.retailPrice1 > 0 ? "text-green-600" : "text-red-600"}>
                    {" "}
                    ({differences.retailPrice1 > 0 ? "+" : ""}
                    {differences.retailPrice1.toLocaleString()} CFA)
                  </span>
                )}
              </p>
            </div>
            <span className="text-lg font-bold text-green-600">
              {projectedValues.retailPrice1.toLocaleString()} CFA
            </span>
          </div>

          <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg border-l-4 border-l-purple-500">
            <div>
              <span className="text-sm font-medium">Valeur Projetée (Prix Détail 2)</span>
              <p className="text-xs text-muted-foreground">
                Actuel: {currentValues.retailPrice2.toLocaleString()} CFA
                {differences.retailPrice2 !== 0 && (
                  <span className={differences.retailPrice2 > 0 ? "text-green-600" : "text-red-600"}>
                    {" "}
                    ({differences.retailPrice2 > 0 ? "+" : ""}
                    {differences.retailPrice2.toLocaleString()} CFA)
                  </span>
                )}
              </p>
            </div>
            <span className="text-lg font-bold text-purple-600">
              {projectedValues.retailPrice2.toLocaleString()} CFA
            </span>
          </div>

          <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg border-l-4 border-l-orange-500">
            <div>
              <span className="text-sm font-medium">Valeur Projetée (Prix Gros)</span>
              <p className="text-xs text-muted-foreground">
                Actuel: {currentValues.wholesalePrice.toLocaleString()} CFA
                {differences.wholesalePrice !== 0 && (
                  <span className={differences.wholesalePrice > 0 ? "text-green-600" : "text-red-600"}>
                    {" "}
                    ({differences.wholesalePrice > 0 ? "+" : ""}
                    {differences.wholesalePrice.toLocaleString()} CFA)
                  </span>
                )}
              </p>
            </div>
            <span className="text-lg font-bold text-orange-600">
              {projectedValues.wholesalePrice.toLocaleString()} CFA
            </span>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center p-4 bg-cyan-50 rounded-lg">
            <div>
              <span className="text-sm font-medium">Augmentation Totale Potentielle</span>
              <p className="text-xs text-muted-foreground">Gain si tous les prix sont ajustés à {targetMargin}%</p>
            </div>
            <span className="text-xl font-bold text-cyan-600">
              +
              {(
                projectedValues.retailPrice1 +
                projectedValues.retailPrice2 +
                projectedValues.wholesalePrice -
                (currentValues.retailPrice1 + currentValues.retailPrice2 + currentValues.wholesalePrice)
              ).toLocaleString()}{" "}
              CFA
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

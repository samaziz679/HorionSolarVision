"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Battery } from "lucide-react"
import { useSizerStore } from "@/lib/stores/sizer-store"

export function BatteryDesign() {
  const { battery, updateBattery, siteSystem, results } = useSizerStore()

  const handleBatteryTypeChange = (type: "lead-acid" | "lithium") => {
    const defaults = type === "lead-acid" ? { dod: 0.5, efficiency: 0.85 } : { dod: 0.8, efficiency: 0.92 }

    updateBattery({
      type,
      dod: defaults.dod,
      efficiency: defaults.efficiency,
    })
  }

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <Battery className="h-5 w-5" />
          Batterie
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Type de Batterie</Label>
          <Select value={battery.type} onValueChange={handleBatteryTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lead-acid">Plomb-Acide</SelectItem>
              <SelectItem value="lithium">Lithium (LiFePO₄)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="battDod">DoD Utilisable</Label>
            <Input
              id="battDod"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={battery.dod}
              onChange={(e) => updateBattery({ dod: Number.parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="battEfficiency">Rendement</Label>
            <Input
              id="battEfficiency"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={battery.efficiency}
              onChange={(e) => updateBattery({ efficiency: Number.parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="battVoltage">Tension Nominale (V)</Label>
          <Input
            id="battVoltage"
            type="number"
            value={battery.nominalVoltage}
            onChange={(e) => updateBattery({ nominalVoltage: Number.parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="battCapacity">Capacité (Ah ou kWh)</Label>
            <Input
              id="battCapacity"
              type="number"
              value={battery.capacity}
              onChange={(e) => updateBattery({ capacity: Number.parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label>Unité</Label>
            <Select
              value={battery.capacityUnit}
              onValueChange={(value: "Ah" | "kWh") => updateBattery({ capacityUnit: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ah">Ah</SelectItem>
                <SelectItem value="kWh">kWh</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {results.battery && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Série par string:</span>
              <Badge variant="secondary">{results.battery.seriesPerString}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Strings en parallèle:</span>
              <Badge variant="secondary">{results.battery.parallelStrings}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total batteries:</span>
              <Badge variant="secondary">{results.battery.totalUnits}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Capacité utilisable:</span>
              <Badge className="bg-green-600">{results.battery.usableCapacityKwh.toFixed(1)} kWh</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

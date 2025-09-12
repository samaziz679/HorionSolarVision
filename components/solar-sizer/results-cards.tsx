"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Sun, Battery, Calculator, AlertTriangle, CheckCircle } from "lucide-react"
import { useSizerStore } from "@/lib/stores/sizer-store"

export function ResultsCards() {
  const { results } = useSizerStore()

  if (!results.loads) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Ajoutez des charges pour voir les résultats</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Daily Load Summary */}
      <Card className="border-l-4 border-l-amber-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-amber-600 text-lg">
            <Zap className="h-5 w-5" />
            Charges Quotidiennes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm">Énergie totale:</span>
            <Badge className="bg-amber-600">{results.loads.totalEnergyKwh.toFixed(2)} kWh/jour</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Puissance de pointe:</span>
            <Badge variant="secondary">{results.loads.peakPowerW.toFixed(0)} W</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Nombre d'équipements:</span>
            <Badge variant="outline">{results.loads.totalDevices}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* PV Array Results */}
      {results.pv && (
        <Card className="border-l-4 border-l-sky-blue">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sky-blue text-lg">
              <Sun className="h-5 w-5" />
              Installation PV
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Requis / Dimensionné:</span>
              <div className="flex gap-2">
                <Badge variant="outline">{results.pv.requiredPowerKw.toFixed(2)} kW</Badge>
                <Badge className="bg-sky-600">{results.pv.totalPowerKw.toFixed(2)} kW</Badge>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Configuration:</span>
              <Badge variant="secondary">
                {results.pv.seriesPerString}S × {results.pv.parallelStrings}P = {results.pv.totalPanels} panneaux
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Production estimée:</span>
              <Badge className="bg-green-600">{results.pv.dailyEnergyKwh.toFixed(2)} kWh/jour</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Validation MPPT:</span>
              <div className="flex gap-2">
                {results.pv.mpptWindowOk ? (
                  <Badge className="bg-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Tension OK
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Tension
                  </Badge>
                )}
                {results.pv.currentOk ? (
                  <Badge className="bg-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Courant OK
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Courant
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Battery Results */}
      {results.battery && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-600 text-lg">
              <Battery className="h-5 w-5" />
              Parc Batteries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Requis / Dimensionné:</span>
              <div className="flex gap-2">
                <Badge variant="outline">{results.battery.requiredCapacityKwh.toFixed(2)} kWh</Badge>
                <Badge className="bg-green-600">{results.battery.usableCapacityKwh.toFixed(2)} kWh</Badge>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Configuration:</span>
              <Badge variant="secondary">
                {results.battery.seriesPerString}S × {results.battery.parallelStrings}P = {results.battery.totalUnits}{" "}
                batteries
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Tension nominale:</span>
              <Badge variant="outline">{results.battery.bankVoltage.toFixed(1)} V</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Capacité Ah équivalente:</span>
              <Badge variant="outline">{results.battery.totalCapacityAh.toFixed(0)} Ah</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inverter Results */}
      {results.inverter && (
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-600 text-lg">
              <Calculator className="h-5 w-5" />
              Onduleur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Puissance continue min:</span>
              <Badge className="bg-purple-600">{results.inverter.minContinuousW.toFixed(0)} W</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Puissance de pointe sugg:</span>
              <Badge variant="secondary">{results.inverter.suggestedSurgeW.toFixed(0)} W</Badge>
            </div>
            {results.inverter.batteryDischargeOk !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm">Décharge batterie:</span>
                {results.inverter.batteryDischargeOk ? (
                  <Badge className="bg-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    OK
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Limite
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      {results.simulation && (
        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-indigo-600 text-lg">
              <Calculator className="h-5 w-5" />
              Simulation 24h
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">État du système:</span>
              {results.simulation.systemOk ? (
                <Badge className="bg-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Dimensionnement OK
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Sous-dimensionné
                </Badge>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-sm">SoC minimum:</span>
              <Badge variant={results.simulation.minSoC < 10 ? "destructive" : "secondary"}>
                {results.simulation.minSoC.toFixed(1)}%
              </Badge>
            </div>
            {!results.simulation.systemOk && (
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                ⚠️ Le système risque de manquer d'énergie. Augmentez la capacité PV ou batterie.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

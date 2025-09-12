"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { HelpCircle, Sun, AlertTriangle, CheckCircle } from "lucide-react"
import { useSizerStore } from "@/lib/stores/sizer-store"

export function PVDesign() {
  const { pv, updatePV, results } = useSizerStore()

  return (
    <Card className="border-l-4 border-l-sky-blue">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sky-blue">
          <Sun className="h-5 w-5" />
          Panneaux PV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="panelPower">Puissance STC (W)</Label>
          <Input
            id="panelPower"
            type="number"
            value={pv.panelPower}
            onChange={(e) => updatePV({ panelPower: Number.parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vmp">Vmp (V)</Label>
            <Input
              id="vmp"
              type="number"
              step="0.1"
              value={pv.vmp}
              onChange={(e) => updatePV({ vmp: Number.parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="voc">Voc (V)</Label>
            <Input
              id="voc"
              type="number"
              step="0.1"
              value={pv.voc}
              onChange={(e) => updatePV({ voc: Number.parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="imp">Imp (A)</Label>
            <Input
              id="imp"
              type="number"
              step="0.1"
              value={pv.imp}
              onChange={(e) => updatePV({ imp: Number.parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="isc">Isc (A)</Label>
            <Input
              id="isc"
              type="number"
              step="0.1"
              value={pv.isc}
              onChange={(e) => updatePV({ isc: Number.parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="space-y-4 border-t pt-4">
          <h4 className="font-medium">Contrôleur MPPT</h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="mpptMinV">Tension Min (V)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Tension minimale MPPT pour démarrer la charge</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="mpptMinV"
                type="number"
                value={pv.mpptMinVoltage}
                onChange={(e) => updatePV({ mpptMinVoltage: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mpptMaxV">Tension Max (V)</Label>
              <Input
                id="mpptMaxV"
                type="number"
                value={pv.mpptMaxVoltage}
                onChange={(e) => updatePV({ mpptMaxVoltage: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mpptMaxCurrent">Courant Max (A)</Label>
            <Input
              id="mpptMaxCurrent"
              type="number"
              value={pv.mpptMaxCurrent}
              onChange={(e) => updatePV({ mpptMaxCurrent: Number.parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        {results.pv && (
          <div className="mt-4 p-3 bg-sky-50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Panneaux par string:</span>
              <Badge variant="secondary">{results.pv.seriesPerString}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Strings en parallèle:</span>
              <Badge variant="secondary">{results.pv.parallelStrings}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total panneaux:</span>
              <Badge variant="secondary">{results.pv.totalPanels}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Puissance totale:</span>
              <Badge className="bg-sky-600">{results.pv.totalPowerKw.toFixed(2)} kW</Badge>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span>Fenêtre MPPT:</span>
              {results.pv.mpptWindowOk ? (
                <Badge className="bg-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  OK
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Erreur
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span>Courant MPPT:</span>
              {results.pv.currentOk ? (
                <Badge className="bg-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  OK
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Dépassé
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

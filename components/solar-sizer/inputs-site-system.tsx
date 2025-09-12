"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle, Sun } from "lucide-react"
import { useSizerStore } from "@/lib/stores/sizer-store"

export function InputsSiteSystem() {
  const { siteSystem, updateSiteSystem } = useSizerStore()

  return (
    <Card className="border-l-4 border-l-solar-orange">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-solar-orange">
          <Sun className="h-5 w-5" />
          Site & Système
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="psh">Heures de Soleil Équivalent (PSH)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Irradiation solaire quotidienne moyenne en kWh/m²/jour
                      <br />
                      Burkina Faso: 5.0-6.0 kWh/m²/jour
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="psh"
              type="number"
              step="0.1"
              value={siteSystem.psh}
              onChange={(e) => updateSiteSystem({ psh: Number.parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="busVoltage">Tension Bus DC (V)</Label>
            <Select
              value={siteSystem.busVoltage.toString()}
              onValueChange={(value) => updateSiteSystem({ busVoltage: Number.parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12V</SelectItem>
                <SelectItem value="24">24V</SelectItem>
                <SelectItem value="48">48V</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="pvEfficiency">Rendement PV</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Facteur de déclassement global du système PV
                      <br />
                      Inclut: ombrage, poussière, câblage, température
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="pvEfficiency"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={siteSystem.pvEfficiency}
              onChange={(e) => updateSiteSystem({ pvEfficiency: Number.parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="inverterEfficiency">Rendement Onduleur</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Efficacité de conversion DC/AC de l'onduleur
                      <br />
                      Typique: 0.90-0.95 pour onduleurs modernes
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="inverterEfficiency"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={siteSystem.inverterEfficiency}
              onChange={(e) => updateSiteSystem({ inverterEfficiency: Number.parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="autonomyDays">Jours d'Autonomie</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Nombre de jours sans soleil que le système doit supporter
                      <br />
                      Recommandé: 2-3 jours pour usage résidentiel
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="autonomyDays"
              type="number"
              min="1"
              value={siteSystem.autonomyDays}
              onChange={(e) => updateSiteSystem({ autonomyDays: Number.parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="maxDoD">DoD Maximum</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Profondeur de décharge maximale autorisée
                      <br />
                      Plomb: 0.5, Lithium: 0.8-0.9
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="maxDoD"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={siteSystem.maxDoD}
              onChange={(e) => updateSiteSystem({ maxDoD: Number.parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

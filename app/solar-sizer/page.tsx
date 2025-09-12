"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calculator, Sun, Plus, Trash2, Search } from "lucide-react"
import { DEVICES, BATTERIES, SOLAR_PANELS, DEVICE_CATEGORIES, type Device } from "@/lib/data/solar-devices"

interface LoadItem {
  id: number
  deviceId?: string
  customName?: string
  power: number
  quantity: number
  hours: number
  peakFactor: number
}

interface CustomBattery {
  id: string
  brand: string
  model: string
  voltage: number
  capacity: number
  chemistry: string
  dod: number
  efficiency: number
}

interface CustomPanel {
  id: string
  brand: string
  model: string
  power: number
  vmp: number
  voc: number
  imp: number
  isc: number
  efficiency: number
}

export default function SolarSizerPage() {
  // Paramètres du site et système
  const [psh, setPsh] = useState(5.5)
  const [busVoltage, setBusVoltage] = useState(48)
  const [pvEfficiency, setPvEfficiency] = useState(0.8)
  const [inverterEfficiency, setInverterEfficiency] = useState(0.92)
  const [autonomyDays, setAutonomyDays] = useState(2)
  const [maxDoD, setMaxDoD] = useState(0.8)

  const [selectedBattery, setSelectedBattery] = useState<any>(BATTERIES[0])
  const [selectedPanel, setSelectedPanel] = useState<any>(SOLAR_PANELS[0])
  const [isCustomBattery, setIsCustomBattery] = useState(false)
  const [isCustomPanel, setIsCustomPanel] = useState(false)
  const [customBattery, setCustomBattery] = useState<CustomBattery>({
    id: "custom",
    brand: "",
    model: "",
    voltage: 12,
    capacity: 100,
    chemistry: "LiFePO4",
    dod: 0.8,
    efficiency: 0.95,
  })
  const [customPanel, setCustomPanel] = useState<CustomPanel>({
    id: "custom",
    brand: "",
    model: "",
    power: 400,
    vmp: 40,
    voc: 48,
    imp: 10,
    isc: 11,
    efficiency: 0.21,
  })

  // Paramètres MPPT
  const [mpptMinV, setMpptMinV] = useState(120)
  const [mpptMaxV, setMpptMaxV] = useState(430)
  const [mpptMaxCurrent, setMpptMaxCurrent] = useState(18)

  // Charges électriques
  const [loads, setLoads] = useState<LoadItem[]>([
    { id: 1, deviceId: "led-bulb-12w", power: 12, quantity: 20, hours: 6, peakFactor: 1 },
    { id: 2, deviceId: "desktop-pc", power: 150, quantity: 8, hours: 8, peakFactor: 1.2 },
    { id: 3, deviceId: "fridge-200l", power: 120, quantity: 2, hours: 8, peakFactor: 3 },
    { id: 4, deviceId: "water-pump-1hp", power: 750, quantity: 1, hours: 2, peakFactor: 3 },
    { id: 5, deviceId: "router-wifi", power: 15, quantity: 6, hours: 24, peakFactor: 1 },
  ])

  // États pour l'interface
  const [deviceSearch, setDeviceSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tous")
  const [showDeviceSelector, setShowDeviceSelector] = useState(false)
  const [editingLoadId, setEditingLoadId] = useState<number | null>(null)

  // Filtrer les appareils
  const filteredDevices = DEVICES.filter((device) => {
    const matchesSearch =
      device.name.toLowerCase().includes(deviceSearch.toLowerCase()) ||
      device.category.toLowerCase().includes(deviceSearch.toLowerCase())
    const matchesCategory = selectedCategory === "Tous" || device.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const currentBattery = isCustomBattery ? customBattery : selectedBattery
  const currentPanel = isCustomPanel ? customPanel : selectedPanel

  // Calculs énergétiques
  const dailyLoadKwh = loads.reduce((sum, load) => sum + (load.power * load.quantity * load.hours) / 1000, 0)
  const peakPowerW = loads.reduce((sum, load) => sum + load.power * load.quantity * load.peakFactor, 0)

  // Calculs PV
  const requiredPvKw = dailyLoadKwh / (psh * pvEfficiency)
  const seriesPerString = Math.ceil(mpptMinV / currentPanel.vmp)
  const stringPowerW = seriesPerString * currentPanel.power
  const parallelStrings = Math.ceil((requiredPvKw * 1000) / stringPowerW)
  const totalPanels = seriesPerString * parallelStrings
  const totalPvKw = (totalPanels * currentPanel.power) / 1000
  const dailyPvKwh = totalPvKw * psh * pvEfficiency

  // Calculs batteries
  const requiredBatteryKwh = (dailyLoadKwh * autonomyDays) / (currentBattery.dod * currentBattery.efficiency)
  const unitCapacityKwh = (currentBattery.voltage * currentBattery.capacity) / 1000
  const batterySeries = Math.ceil(busVoltage / currentBattery.voltage)
  const perStringUsableKwh = batterySeries * unitCapacityKwh * currentBattery.dod * currentBattery.efficiency
  const batteryParallel = Math.ceil(requiredBatteryKwh / perStringUsableKwh)
  const totalBatteries = batterySeries * batteryParallel
  const usableBatteryKwh = batteryParallel * perStringUsableKwh

  // Calculs onduleur
  const minInverterW = Math.ceil((peakPowerW / inverterEfficiency) * 1.25)
  const suggestedSurgeW = minInverterW * 2

  const addLoad = () => {
    const newId = Math.max(...loads.map((l) => l.id), 0) + 1
    setLoads([
      ...loads,
      {
        id: newId,
        customName: "",
        power: 0,
        quantity: 1,
        hours: 0,
        peakFactor: 1,
      },
    ])
    setEditingLoadId(newId)
  }

  const addDeviceLoad = (device: Device) => {
    const newId = Math.max(...loads.map((l) => l.id), 0) + 1
    setLoads([
      ...loads,
      {
        id: newId,
        deviceId: device.id,
        power: device.power,
        quantity: 1,
        hours: device.typicalHours,
        peakFactor: device.peakFactor,
      },
    ])
    setShowDeviceSelector(false)
  }

  const updateLoad = (id: number, field: string, value: any) => {
    setLoads(loads.map((load) => (load.id === id ? { ...load, [field]: value } : load)))
  }

  const removeLoad = (id: number) => {
    setLoads(loads.filter((load) => load.id !== id))
  }

  const getLoadDisplayName = (load: LoadItem) => {
    if (load.deviceId) {
      const device = DEVICES.find((d) => d.id === load.deviceId)
      return device?.name || "Appareil inconnu"
    }
    return load.customName || "Charge personnalisée"
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-solar-orange flex items-center gap-2">
            <Calculator className="h-8 w-8" />
            Dimensionnement Solaire & Batterie
          </h1>
          <p className="text-muted-foreground mt-2">
            Outil professionnel de dimensionnement pour systèmes solaires autonomes - Calculez la taille optimale de
            votre installation PV, batterie et onduleur
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Exporter PDF</Button>
          <Button>Sauvegarder Projet</Button>
        </div>
      </div>

      {/* Disposition principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Paramètres */}
        <div className="lg:col-span-2 space-y-6">
          {/* Site & Système */}
          <Card className="border-l-4 border-l-solar-orange">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-solar-orange">
                <Sun className="h-5 w-5" />
                Paramètres du Site & Système
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="psh">Heures de Soleil Équivalent (PSH)</Label>
                  <Input
                    id="psh"
                    type="number"
                    step="0.1"
                    value={psh}
                    onChange={(e) => setPsh(Number.parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">kWh/m²/jour</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="busVoltage">Tension Bus DC</Label>
                  <Select value={busVoltage.toString()} onValueChange={(v) => setBusVoltage(Number.parseInt(v))}>
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
                  <Label htmlFor="autonomyDays">Jours d'Autonomie</Label>
                  <Input
                    id="autonomyDays"
                    type="number"
                    value={autonomyDays}
                    onChange={(e) => setAutonomyDays(Number.parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pvEfficiency">Rendement Global PV</Label>
                  <Input
                    id="pvEfficiency"
                    type="number"
                    step="0.01"
                    value={pvEfficiency}
                    onChange={(e) => setPvEfficiency(Number.parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">Inclut pertes câblage, MPPT, etc.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inverterEfficiency">Rendement Onduleur</Label>
                  <Input
                    id="inverterEfficiency"
                    type="number"
                    step="0.01"
                    value={inverterEfficiency}
                    onChange={(e) => setInverterEfficiency(Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mpptMinV">MPPT Tension Min</Label>
                  <Input
                    id="mpptMinV"
                    type="number"
                    value={mpptMinV}
                    onChange={(e) => setMpptMinV(Number.parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">Volts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sélection Batterie & Panneau */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Batterie */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">Modèle de Batterie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant={!isCustomBattery ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsCustomBattery(false)}
                  >
                    Catalogue
                  </Button>
                  <Button
                    variant={isCustomBattery ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsCustomBattery(true)}
                  >
                    Personnalisé
                  </Button>
                </div>

                {!isCustomBattery ? (
                  <Select
                    value={selectedBattery.id}
                    onValueChange={(id) => {
                      const battery = BATTERIES.find((b) => b.id === id)
                      if (battery) setSelectedBattery(battery)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BATTERIES.map((battery) => (
                        <SelectItem key={battery.id} value={battery.id}>
                          {battery.brand} {battery.model} - {battery.voltage}V {battery.capacity}Ah
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Marque</Label>
                        <Input
                          placeholder="Ex: Rolls"
                          value={customBattery.brand}
                          onChange={(e) => setCustomBattery({ ...customBattery, brand: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Modèle</Label>
                        <Input
                          placeholder="Ex: S-550"
                          value={customBattery.model}
                          onChange={(e) => setCustomBattery({ ...customBattery, model: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Tension (V)</Label>
                        <Input
                          type="number"
                          value={customBattery.voltage}
                          onChange={(e) =>
                            setCustomBattery({ ...customBattery, voltage: Number.parseFloat(e.target.value) || 12 })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Capacité (Ah)</Label>
                        <Input
                          type="number"
                          value={customBattery.capacity}
                          onChange={(e) =>
                            setCustomBattery({ ...customBattery, capacity: Number.parseFloat(e.target.value) || 100 })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Technologie</Label>
                        <Select
                          value={customBattery.chemistry}
                          onValueChange={(value) => setCustomBattery({ ...customBattery, chemistry: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LiFePO4">LiFePO4</SelectItem>
                            <SelectItem value="Gel">Gel</SelectItem>
                            <SelectItem value="AGM">AGM</SelectItem>
                            <SelectItem value="Plomb-acide">Plomb-acide</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">DoD (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={customBattery.dod * 100}
                          onChange={(e) =>
                            setCustomBattery({ ...customBattery, dod: (Number.parseFloat(e.target.value) || 80) / 100 })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Rendement (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={customBattery.efficiency * 100}
                          onChange={(e) =>
                            setCustomBattery({
                              ...customBattery,
                              efficiency: (Number.parseFloat(e.target.value) || 95) / 100,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Technologie:</span>
                    <Badge variant="secondary">{currentBattery.chemistry}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Capacité unitaire:</span>
                    <span>{((currentBattery.voltage * currentBattery.capacity) / 1000).toFixed(2)} kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DoD / Rendement:</span>
                    <span>
                      {(currentBattery.dod * 100).toFixed(0)}% / {(currentBattery.efficiency * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-green-50 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Configuration calculée:</span>
                    <span className="font-medium">
                      {batterySeries}S × {batteryParallel}P = {totalBatteries} batteries
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Capacité utilisable:</span>
                    <span className="font-medium text-green-600">{usableBatteryKwh.toFixed(1)} kWh</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Panneau PV */}
            <Card className="border-l-4 border-l-sky-blue">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sky-blue">Modèle de Panneau PV</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant={!isCustomPanel ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsCustomPanel(false)}
                  >
                    Catalogue
                  </Button>
                  <Button
                    variant={isCustomPanel ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsCustomPanel(true)}
                  >
                    Personnalisé
                  </Button>
                </div>

                {!isCustomPanel ? (
                  <Select
                    value={selectedPanel.id}
                    onValueChange={(id) => {
                      const panel = SOLAR_PANELS.find((p) => p.id === id)
                      if (panel) setSelectedPanel(panel)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SOLAR_PANELS.map((panel) => (
                        <SelectItem key={panel.id} value={panel.id}>
                          {panel.brand} {panel.model} - {panel.power}W
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Marque</Label>
                        <Input
                          placeholder="Ex: LONGi"
                          value={customPanel.brand}
                          onChange={(e) => setCustomPanel({ ...customPanel, brand: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Modèle</Label>
                        <Input
                          placeholder="Ex: Hi-MO6"
                          value={customPanel.model}
                          onChange={(e) => setCustomPanel({ ...customPanel, model: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Puissance (W)</Label>
                        <Input
                          type="number"
                          value={customPanel.power}
                          onChange={(e) =>
                            setCustomPanel({ ...customPanel, power: Number.parseFloat(e.target.value) || 400 })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Rendement (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={customPanel.efficiency * 100}
                          onChange={(e) =>
                            setCustomPanel({
                              ...customPanel,
                              efficiency: (Number.parseFloat(e.target.value) || 21) / 100,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <Label className="text-xs">Vmp (V)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={customPanel.vmp}
                          onChange={(e) =>
                            setCustomPanel({ ...customPanel, vmp: Number.parseFloat(e.target.value) || 40 })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Voc (V)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={customPanel.voc}
                          onChange={(e) =>
                            setCustomPanel({ ...customPanel, voc: Number.parseFloat(e.target.value) || 48 })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Imp (A)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={customPanel.imp}
                          onChange={(e) =>
                            setCustomPanel({ ...customPanel, imp: Number.parseFloat(e.target.value) || 10 })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Isc (A)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={customPanel.isc}
                          onChange={(e) =>
                            setCustomPanel({ ...customPanel, isc: Number.parseFloat(e.target.value) || 11 })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Vmp / Voc:</span>
                    <span>
                      {currentPanel.vmp}V / {currentPanel.voc}V
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Imp / Isc:</span>
                    <span>
                      {currentPanel.imp}A / {currentPanel.isc}A
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rendement:</span>
                    <span>{(currentPanel.efficiency * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-sky-50 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Configuration calculée:</span>
                    <span className="font-medium">
                      {seriesPerString}S × {parallelStrings}P = {totalPanels} panneaux
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Puissance totale:</span>
                    <span className="font-medium text-sky-600">{totalPvKw.toFixed(2)} kW</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charges Électriques */}
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-amber-600">Charges Électriques</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowDeviceSelector(!showDeviceSelector)}>
                    <Search className="h-4 w-4 mr-2" />
                    Catalogue
                  </Button>
                  <Button onClick={addLoad} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Personnalisé
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Sélecteur d'appareils */}
              {showDeviceSelector && (
                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Rechercher un appareil..."
                        value={deviceSearch}
                        onChange={(e) => setDeviceSearch(e.target.value)}
                      />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DEVICE_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                    {filteredDevices.map((device) => (
                      <Button
                        key={device.id}
                        variant="outline"
                        className="justify-start h-auto p-3 bg-transparent"
                        onClick={() => addDeviceLoad(device)}
                      >
                        <div className="text-left">
                          <div className="font-medium">{device.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {device.power}W • {device.category}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Liste des charges */}
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                  <div className="col-span-4">Appareil</div>
                  <div className="col-span-2">Puissance (W)</div>
                  <div className="col-span-1">Qté</div>
                  <div className="col-span-2">Heures/jour</div>
                  <div className="col-span-2">Facteur pointe</div>
                  <div className="col-span-1">Actions</div>
                </div>

                {loads.map((load) => (
                  <div key={load.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4">
                      {load.deviceId ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {DEVICES.find((d) => d.id === load.deviceId)?.category}
                          </Badge>
                          <span className="text-sm">{getLoadDisplayName(load)}</span>
                        </div>
                      ) : (
                        <Input
                          placeholder="Nom de l'appareil"
                          value={load.customName || ""}
                          onChange={(e) => updateLoad(load.id, "customName", e.target.value)}
                        />
                      )}
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={load.power}
                        onChange={(e) => updateLoad(load.id, "power", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        value={load.quantity}
                        onChange={(e) => updateLoad(load.id, "quantity", Number.parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="0.5"
                        value={load.hours}
                        onChange={(e) => updateLoad(load.id, "hours", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="0.1"
                        value={load.peakFactor}
                        onChange={(e) => updateLoad(load.id, "peakFactor", Number.parseFloat(e.target.value) || 1)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button variant="outline" size="sm" onClick={() => removeLoad(load.id)} className="h-8 w-8 p-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite - Résultats */}
        <div className="space-y-6">
          {/* Bilan Énergétique */}
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader>
              <CardTitle className="text-amber-600 text-lg">Bilan Énergétique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Consommation quotidienne:</span>
                <span className="font-medium text-amber-600">{dailyLoadKwh.toFixed(2)} kWh/jour</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Puissance de pointe:</span>
                <span className="font-medium">{(peakPowerW / 1000).toFixed(2)} kW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Production PV estimée:</span>
                <span className="font-medium text-green-600">{dailyPvKwh.toFixed(2)} kWh/jour</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Surplus/Déficit:</span>
                <span className={`font-medium ${dailyPvKwh >= dailyLoadKwh ? "text-green-600" : "text-red-600"}`}>
                  {dailyPvKwh - dailyLoadKwh > 0 ? "+" : ""}
                  {(dailyPvKwh - dailyLoadKwh).toFixed(2)} kWh/jour
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Installation PV */}
          <Card className="border-l-4 border-l-sky-blue">
            <CardHeader>
              <CardTitle className="text-sky-blue text-lg">Installation Photovoltaïque</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Puissance requise:</span>
                <span className="text-sm text-muted-foreground">{requiredPvKw.toFixed(2)} kW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Puissance installée:</span>
                <span className="font-medium text-sky-600">{totalPvKw.toFixed(2)} kW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Nombre de panneaux:</span>
                <span className="font-medium">
                  {totalPanels} × {currentPanel.power}W
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Configuration strings:</span>
                <span className="font-medium">
                  {seriesPerString}S × {parallelStrings}P
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Parc Batteries */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="text-green-600 text-lg">Parc de Batteries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Capacité requise:</span>
                <span className="text-sm text-muted-foreground">{requiredBatteryKwh.toFixed(2)} kWh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Capacité utilisable:</span>
                <span className="font-medium text-green-600">{usableBatteryKwh.toFixed(2)} kWh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Nombre de batteries:</span>
                <span className="font-medium">
                  {totalBatteries} × {currentBattery.capacity}Ah
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Configuration:</span>
                <span className="font-medium">
                  {batterySeries}S × {batteryParallel}P
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Onduleur */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="text-purple-600 text-lg">Onduleur Requis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Puissance continue min:</span>
                <span className="font-medium text-purple-600">{(minInverterW / 1000).toFixed(1)} kW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Puissance de pointe sugg:</span>
                <span className="font-medium">{(suggestedSurgeW / 1000).toFixed(1)} kW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Tension d'entrée:</span>
                <span className="font-medium">{busVoltage}V DC</span>
              </div>
            </CardContent>
          </Card>

          {/* Validation Technique */}
          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader>
              <CardTitle className="text-indigo-600 text-lg">Validation Technique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Tension MPPT:</span>
                <Badge variant={seriesPerString * currentPanel.vmp >= mpptMinV ? "default" : "destructive"}>
                  {(seriesPerString * currentPanel.vmp).toFixed(0)}V
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Bilan énergétique:</span>
                <Badge variant={dailyPvKwh >= dailyLoadKwh ? "default" : "destructive"}>
                  {dailyPvKwh >= dailyLoadKwh ? "✓ Équilibré" : "⚠ Déficitaire"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Autonomie:</span>
                <Badge variant="default">
                  {autonomyDays} jour{autonomyDays > 1 ? "s" : ""}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notes Techniques */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="text-amber-800 text-lg">Notes Techniques & Hypothèses</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-700 space-y-2">
          <p>
            <strong>Méthodologie de calcul:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Consommation basée sur la somme des charges × heures d'utilisation quotidiennes</li>
            <li>Puissance de pointe calculée avec les facteurs de démarrage des équipements</li>
            <li>Dimensionnement PV basé sur PSH (Peak Sun Hours) et rendement global du système</li>
            <li>
              Capacité batterie calculée pour {autonomyDays} jour{autonomyDays > 1 ? "s" : ""} d'autonomie avec DoD de{" "}
              {(currentBattery.dod * 100).toFixed(0)}%
            </li>
            <li>Configuration MPPT validée selon les tensions Vmp des panneaux sélectionnés</li>
            <li>Onduleur dimensionné avec marge de sécurité de 25% sur la puissance continue</li>
          </ul>
          <p className="mt-3">
            <strong>Recommandations:</strong> Vérifiez les spécifications techniques des équipements et adaptez selon
            les conditions locales d'installation.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

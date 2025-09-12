"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Zap, RotateCcw } from "lucide-react"
import { useSizerStore } from "@/lib/stores/sizer-store"

export function LoadsTable() {
  const { loads, addLoad, updateLoad, removeLoad, clearLoads } = useSizerStore()

  const addNewLoad = () => {
    addLoad({
      id: Date.now().toString(),
      name: "",
      power: 0,
      quantity: 1,
      hoursPerDay: 0,
      peakFactor: 1,
    })
  }

  return (
    <Card className="border-l-4 border-l-amber-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-amber-600">
            <Zap className="h-5 w-5" />
            Charges Électriques
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearLoads}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={addNewLoad} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Puissance (W)</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Heures/jour</TableHead>
                <TableHead>Facteur Pointe</TableHead>
                <TableHead>Énergie/jour</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loads.map((load) => (
                <TableRow key={load.id}>
                  <TableCell>
                    <Input
                      value={load.name}
                      onChange={(e) => updateLoad(load.id, { name: e.target.value })}
                      placeholder="Nom de l'équipement"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={load.power}
                      onChange={(e) => updateLoad(load.id, { power: Number.parseFloat(e.target.value) || 0 })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      value={load.quantity}
                      onChange={(e) => updateLoad(load.id, { quantity: Number.parseInt(e.target.value) || 1 })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      max="24"
                      step="0.1"
                      value={load.hoursPerDay}
                      onChange={(e) => updateLoad(load.id, { hoursPerDay: Number.parseFloat(e.target.value) || 0 })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      step="0.1"
                      value={load.peakFactor}
                      onChange={(e) => updateLoad(load.id, { peakFactor: Number.parseFloat(e.target.value) || 1 })}
                    />
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {((load.power * load.quantity * load.hoursPerDay) / 1000).toFixed(2)} kWh
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => removeLoad(load.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {loads.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune charge définie</p>
            <p className="text-sm">Cliquez sur "Ajouter" pour commencer</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

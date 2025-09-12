"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, Battery } from "lucide-react"
import { useSizerStore } from "@/lib/stores/sizer-store"

export function Charts() {
  const { results } = useSizerStore()

  if (!results.loads || !results.simulation) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Données insuffisantes pour les graphiques</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Complétez la configuration du système</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Prepare daily energy comparison data
  const dailyEnergyData = [
    {
      name: "Consommation",
      value: results.loads.totalEnergyKwh,
      fill: "#f59e0b",
    },
    {
      name: "Production PV",
      value: results.pv?.dailyEnergyKwh || 0,
      fill: "#0ea5e9",
    },
  ]

  // Prepare 24h SoC simulation data
  const socData = results.simulation.hourlyData.map((hour, index) => ({
    hour: index,
    soc: hour.soc,
    load: hour.loadKwh,
    pv: hour.pvKwh,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Energy Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-solar-orange">
            <TrendingUp className="h-5 w-5" />
            Bilan Énergétique Quotidien
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyEnergyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: "kWh/jour", angle: -90, position: "insideLeft" }} />
              <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} kWh`, ""]} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              Ratio production/consommation:{" "}
              <span
                className={`font-medium ${
                  (results.pv?.dailyEnergyKwh || 0) >= results.loads.totalEnergyKwh
                    ? "text-green-600"
                    : "text-amber-600"
                }`}
              >
                {(((results.pv?.dailyEnergyKwh || 0) / results.loads.totalEnergyKwh) * 100).toFixed(0)}%
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 24h State of Charge */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Battery className="h-5 w-5" />
            État de Charge sur 24h
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={socData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" label={{ value: "Heure", position: "insideBottom", offset: -5 }} />
              <YAxis domain={[0, 100]} label={{ value: "SoC (%)", angle: -90, position: "insideLeft" }} />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "soc") return [`${Number(value).toFixed(1)}%`, "État de Charge"]
                  if (name === "load") return [`${Number(value).toFixed(3)} kWh`, "Consommation"]
                  if (name === "pv") return [`${Number(value).toFixed(3)} kWh`, "Production PV"]
                  return [value, name]
                }}
                labelFormatter={(hour) => `Heure: ${hour}h`}
              />
              <Line
                type="monotone"
                dataKey="soc"
                stroke="#16a34a"
                strokeWidth={3}
                dot={{ fill: "#16a34a", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              {/* Critical SoC line */}
              <Line
                type="monotone"
                dataKey={() => 10}
                stroke="#dc2626"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              SoC minimum:{" "}
              <span className={`font-medium ${results.simulation.minSoC < 10 ? "text-red-600" : "text-green-600"}`}>
                {results.simulation.minSoC.toFixed(1)}%
              </span>
              {results.simulation.minSoC < 10 && <span className="text-red-600"> (⚠️ Critique)</span>}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

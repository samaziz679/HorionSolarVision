import type { Results, Load } from "@/lib/stores/sizer-store"

/**
 * Export calculation results to JSON and CSV formats
 */
export function exportResults(results: Results, loads: Load[]) {
  const timestamp = new Date().toISOString().split("T")[0]

  // Create summary data
  const summary = {
    timestamp,
    loads: results.loads,
    pv: results.pv,
    battery: results.battery,
    inverter: results.inverter,
    simulation: results.simulation,
  }

  // Export JSON
  const jsonBlob = new Blob([JSON.stringify(summary, null, 2)], { type: "application/json" })
  downloadFile(jsonBlob, `solar-sizing-${timestamp}.json`)

  // Export CSV for loads
  if (loads.length > 0) {
    const csvContent = [
      "Nom,Puissance (W),Quantité,Heures/jour,Facteur Pointe,Énergie/jour (kWh)",
      ...loads.map(
        (load) =>
          `${load.name},${load.power},${load.quantity},${load.hoursPerDay},${load.peakFactor},${((load.power * load.quantity * load.hoursPerDay) / 1000).toFixed(3)}`,
      ),
    ].join("\n")

    const csvBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    downloadFile(csvBlob, `solar-loads-${timestamp}.csv`)
  }
}

/**
 * Import configuration from URL hash or file
 */
export function importConfig(configString: string) {
  try {
    const config = JSON.parse(atob(configString))
    return config
  } catch (error) {
    console.error("Failed to import configuration:", error)
    return null
  }
}

/**
 * Generate shareable configuration URL
 */
export function generateShareableUrl(siteSystem: any, battery: any, pv: any, loads: Load[]) {
  const config = { siteSystem, battery, pv, loads }
  const encoded = btoa(JSON.stringify(config))
  return `${window.location.origin}${window.location.pathname}#config=${encoded}`
}

/**
 * Load demo dataset
 */
export function loadDemoData() {
  return {
    siteSystem: {
      psh: 5.5,
      busVoltage: 48,
      pvEfficiency: 0.8,
      inverterEfficiency: 0.92,
      autonomyDays: 2,
      maxDoD: 0.8,
    },
    battery: {
      type: "lithium" as const,
      nominalVoltage: 51.2,
      capacity: 200,
      capacityUnit: "Ah" as const,
      dod: 0.8,
      efficiency: 0.9,
    },
    pv: {
      panelPower: 560,
      vmp: 41.8,
      voc: 50.3,
      imp: 13.4,
      isc: 14.1,
      mpptMinVoltage: 120,
      mpptMaxVoltage: 430,
      mpptMaxCurrent: 18,
    },
    loads: [
      { id: "1", name: "Éclairage LED", power: 12, quantity: 20, hoursPerDay: 6, peakFactor: 1 },
      { id: "2", name: "PC Bureau", power: 100, quantity: 8, hoursPerDay: 8, peakFactor: 1 },
      { id: "3", name: "Réfrigérateur", power: 120, quantity: 2, hoursPerDay: 24, peakFactor: 1 },
      { id: "4", name: "Pompe à eau", power: 800, quantity: 1, hoursPerDay: 1, peakFactor: 1.5 },
      { id: "5", name: "Routeur/WiFi", power: 15, quantity: 6, hoursPerDay: 24, peakFactor: 1 },
    ],
  }
}

/**
 * Helper function to download files
 */
function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

import type { SiteSystem, Battery, PV, Load, Results } from "@/lib/stores/sizer-store"

/**
 * Main calculation engine for solar system sizing
 * Implements all formulas from the specification
 */
export function calculateResults(siteSystem: SiteSystem, battery: Battery, pv: PV, loads: Load[]): Results {
  // Calculate load requirements
  const loadResults = calculateLoadRequirements(loads)

  if (loadResults.totalEnergyKwh === 0) {
    return { loads: loadResults }
  }

  // Calculate PV requirements and design
  const pvResults = calculatePVDesign(siteSystem, pv, loadResults.totalEnergyKwh)

  // Calculate battery requirements and design
  const batteryResults = calculateBatteryDesign(siteSystem, battery, loadResults.totalEnergyKwh)

  // Calculate inverter requirements
  const inverterResults = calculateInverterRequirements(siteSystem, loadResults.peakPowerW, batteryResults)

  // Run 24h simulation
  const simulationResults = simulate24Hours(siteSystem, batteryResults, pvResults, loadResults.totalEnergyKwh)

  return {
    loads: loadResults,
    pv: pvResults,
    battery: batteryResults,
    inverter: inverterResults,
    simulation: simulationResults,
  }
}

/**
 * Calculate daily load energy and peak power requirements
 */
function calculateLoadRequirements(loads: Load[]) {
  const totalEnergyKwh = loads.reduce((sum, load) => sum + (load.power * load.quantity * load.hoursPerDay) / 1000, 0)

  const peakPowerW = loads.reduce((sum, load) => sum + load.power * load.quantity * load.peakFactor, 0)

  const totalDevices = loads.reduce((sum, load) => sum + load.quantity, 0)

  return {
    totalEnergyKwh,
    peakPowerW,
    totalDevices,
  }
}

/**
 * Calculate PV array sizing and validate MPPT constraints
 */
function calculatePVDesign(siteSystem: SiteSystem, pv: PV, dailyLoadKwh: number) {
  // Required PV power: E_load_day_kWh / (PSH * pv_efficiency)
  const requiredPowerKw = dailyLoadKwh / (siteSystem.psh * siteSystem.pvEfficiency)

  // Calculate series panels per string for MPPT window
  let seriesPerString = 1

  // Find minimum series for energy harvest: series * Vmp >= MPPT_min
  while (seriesPerString * pv.vmp < pv.mpptMinVoltage) {
    seriesPerString++
  }

  // Check maximum series for safety: series * Voc <= MPPT_max
  while (seriesPerString * pv.voc > pv.mpptMaxVoltage && seriesPerString > 1) {
    seriesPerString--
  }

  // Calculate parallel strings needed
  const stringPowerW = seriesPerString * pv.panelPower
  const parallelStrings = Math.ceil((requiredPowerKw * 1000) / stringPowerW)

  // Total array specifications
  const totalPanels = seriesPerString * parallelStrings
  const totalPowerKw = (totalPanels * pv.panelPower) / 1000

  // Daily energy production
  const dailyEnergyKwh = totalPowerKw * siteSystem.psh * siteSystem.pvEfficiency

  // Validate MPPT constraints
  const mpptWindowOk = seriesPerString * pv.vmp >= pv.mpptMinVoltage && seriesPerString * pv.voc <= pv.mpptMaxVoltage

  const arrayCurrent = parallelStrings * pv.isc
  const currentOk = arrayCurrent <= pv.mpptMaxCurrent

  return {
    requiredPowerKw,
    totalPowerKw,
    seriesPerString,
    parallelStrings,
    totalPanels,
    dailyEnergyKwh,
    mpptWindowOk,
    currentOk,
  }
}

/**
 * Calculate battery bank sizing and configuration
 */
function calculateBatteryDesign(siteSystem: SiteSystem, battery: Battery, dailyLoadKwh: number) {
  // Required battery capacity: (E_load_day * autonomy_days) / (DoD * efficiency)
  const requiredCapacityKwh = (dailyLoadKwh * siteSystem.autonomyDays) / (battery.dod * battery.efficiency)

  // Convert battery capacity to kWh if needed
  let unitCapacityKwh: number
  if (battery.capacityUnit === "Ah") {
    unitCapacityKwh = (battery.nominalVoltage * battery.capacity) / 1000
  } else {
    unitCapacityKwh = battery.capacity
  }

  // Calculate series batteries per string to match bus voltage
  const seriesPerString = Math.ceil(siteSystem.busVoltage / battery.nominalVoltage)

  // Usable capacity per string
  const perStringUsableKwh = seriesPerString * unitCapacityKwh * battery.dod * battery.efficiency

  // Calculate parallel strings needed
  const parallelStrings = Math.ceil(requiredCapacityKwh / perStringUsableKwh)

  // Total bank specifications
  const totalUnits = seriesPerString * parallelStrings
  const usableCapacityKwh = parallelStrings * perStringUsableKwh
  const bankVoltage = seriesPerString * battery.nominalVoltage

  // Calculate total Ah capacity at bank voltage
  const totalCapacityAh = (usableCapacityKwh * 1000) / (bankVoltage * battery.dod * battery.efficiency)

  return {
    requiredCapacityKwh,
    usableCapacityKwh,
    seriesPerString,
    parallelStrings,
    totalUnits,
    bankVoltage,
    totalCapacityAh,
  }
}

/**
 * Calculate inverter sizing requirements
 */
function calculateInverterRequirements(siteSystem: SiteSystem, peakPowerW: number, batteryResults: any) {
  // Minimum continuous inverter power with safety margin
  const minContinuousW = Math.ceil((peakPowerW / siteSystem.inverterEfficiency) * 1.25)

  // Suggested surge capacity (typically 2x continuous)
  const suggestedSurgeW = minContinuousW * 2

  // Check if battery can support inverter demand (if max discharge rate is specified)
  let batteryDischargeOk: boolean | undefined
  if (batteryResults.usableCapacityKwh > 0) {
    const maxBatteryDischargeW = batteryResults.usableCapacityKwh * 1000 // Assume 1C max discharge
    batteryDischargeOk = minContinuousW <= maxBatteryDischargeW
  }

  return {
    minContinuousW,
    suggestedSurgeW,
    batteryDischargeOk,
  }
}

/**
 * Simulate 24-hour system operation
 */
function simulate24Hours(siteSystem: SiteSystem, batteryResults: any, pvResults: any, dailyLoadKwh: number) {
  const hourlyData = []
  let currentSoC = 100 // Start at full charge

  // Assume sun hours from 6 AM to 6 PM (12 hours)
  const sunHours = 12
  const pvHourlyKwh = pvResults.dailyEnergyKwh / sunHours
  const loadHourlyKwh = dailyLoadKwh / 24 // Flat load distribution

  let minSoC = 100

  for (let hour = 0; hour < 24; hour++) {
    // PV production (only during sun hours)
    const pvKwh = hour >= 6 && hour < 18 ? pvHourlyKwh : 0

    // Net energy flow (positive = charging, negative = discharging)
    const netEnergyKwh = pvKwh - loadHourlyKwh

    // Apply battery efficiency
    const batteryEnergyKwh =
      netEnergyKwh > 0
        ? netEnergyKwh * siteSystem.inverterEfficiency * batteryResults.efficiency // Charging
        : netEnergyKwh / (siteSystem.inverterEfficiency * batteryResults.efficiency) // Discharging

    // Update SoC
    const socChangePercent = (batteryEnergyKwh / batteryResults.usableCapacityKwh) * 100
    currentSoC = Math.max(0, Math.min(100, currentSoC + socChangePercent))

    minSoC = Math.min(minSoC, currentSoC)

    hourlyData.push({
      hour,
      loadKwh: loadHourlyKwh,
      pvKwh,
      soc: currentSoC,
    })
  }

  const systemOk = minSoC >= 10 // System OK if SoC never drops below 10%

  return {
    systemOk,
    minSoC,
    hourlyData,
  }
}

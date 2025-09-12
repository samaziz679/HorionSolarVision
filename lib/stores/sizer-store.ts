import { create } from "zustand"
import { persist } from "zustand/middleware"
import { calculateResults } from "@/lib/utils/sizer-calculations"

export interface SiteSystem {
  psh: number
  busVoltage: number
  pvEfficiency: number
  inverterEfficiency: number
  autonomyDays: number
  maxDoD: number
}

export interface Battery {
  type: "lead-acid" | "lithium"
  nominalVoltage: number
  capacity: number
  capacityUnit: "Ah" | "kWh"
  dod: number
  efficiency: number
  maxDischargeRate?: number
}

export interface PV {
  panelPower: number
  vmp: number
  voc: number
  imp: number
  isc: number
  mpptMinVoltage: number
  mpptMaxVoltage: number
  mpptMaxCurrent: number
}

export interface Load {
  id: string
  name: string
  power: number
  quantity: number
  hoursPerDay: number
  peakFactor: number
}

export interface Results {
  loads?: {
    totalEnergyKwh: number
    peakPowerW: number
    totalDevices: number
  }
  pv?: {
    requiredPowerKw: number
    totalPowerKw: number
    seriesPerString: number
    parallelStrings: number
    totalPanels: number
    dailyEnergyKwh: number
    mpptWindowOk: boolean
    currentOk: boolean
  }
  battery?: {
    requiredCapacityKwh: number
    usableCapacityKwh: number
    seriesPerString: number
    parallelStrings: number
    totalUnits: number
    bankVoltage: number
    totalCapacityAh: number
  }
  inverter?: {
    minContinuousW: number
    suggestedSurgeW: number
    batteryDischargeOk?: boolean
  }
  simulation?: {
    systemOk: boolean
    minSoC: number
    hourlyData: Array<{
      hour: number
      loadKwh: number
      pvKwh: number
      soc: number
    }>
  }
}

interface SizerStore {
  siteSystem: SiteSystem
  battery: Battery
  pv: PV
  loads: Load[]
  results: Results

  updateSiteSystem: (updates: Partial<SiteSystem>) => void
  updateBattery: (updates: Partial<Battery>) => void
  updatePV: (updates: Partial<PV>) => void
  addLoad: (load: Load) => void
  updateLoad: (id: string, updates: Partial<Load>) => void
  removeLoad: (id: string) => void
  clearLoads: () => void
  resetAll: () => void
  loadDemo: () => void
}

const defaultSiteSystem: SiteSystem = {
  psh: 5.5,
  busVoltage: 48,
  pvEfficiency: 0.8,
  inverterEfficiency: 0.92,
  autonomyDays: 2,
  maxDoD: 0.8,
}

const defaultBattery: Battery = {
  type: "lithium",
  nominalVoltage: 51.2,
  capacity: 200,
  capacityUnit: "Ah",
  dod: 0.8,
  efficiency: 0.9,
  maxDischargeRate: 1.0,
}

const defaultPV: PV = {
  panelPower: 560,
  vmp: 41.8,
  voc: 50.3,
  imp: 13.4,
  isc: 14.1,
  mpptMinVoltage: 120,
  mpptMaxVoltage: 430,
  mpptMaxCurrent: 18,
}

const demoLoads: Load[] = [
  { id: "1", name: "Éclairage LED", power: 12, quantity: 20, hoursPerDay: 6, peakFactor: 1 },
  { id: "2", name: "PC Bureau", power: 100, quantity: 8, hoursPerDay: 8, peakFactor: 1 },
  { id: "3", name: "Réfrigérateur", power: 120, quantity: 2, hoursPerDay: 24, peakFactor: 1 },
  { id: "4", name: "Pompe à eau", power: 800, quantity: 1, hoursPerDay: 1, peakFactor: 1.5 },
  { id: "5", name: "Routeur/WiFi", power: 15, quantity: 6, hoursPerDay: 24, peakFactor: 1 },
]

export const useSizerStore = create<SizerStore>()(
  persist(
    (set, get) => ({
      siteSystem: defaultSiteSystem,
      battery: defaultBattery,
      pv: defaultPV,
      loads: [],
      results: {},

      updateSiteSystem: (updates) => {
        set((state) => {
          const newSiteSystem = { ...state.siteSystem, ...updates }
          const results = calculateResults(newSiteSystem, state.battery, state.pv, state.loads)
          return { siteSystem: newSiteSystem, results }
        })
      },

      updateBattery: (updates) => {
        set((state) => {
          const newBattery = { ...state.battery, ...updates }
          const results = calculateResults(state.siteSystem, newBattery, state.pv, state.loads)
          return { battery: newBattery, results }
        })
      },

      updatePV: (updates) => {
        set((state) => {
          const newPV = { ...state.pv, ...updates }
          const results = calculateResults(state.siteSystem, state.battery, newPV, state.loads)
          return { pv: newPV, results }
        })
      },

      addLoad: (load) => {
        set((state) => {
          const newLoads = [...state.loads, load]
          const results = calculateResults(state.siteSystem, state.battery, state.pv, newLoads)
          return { loads: newLoads, results }
        })
      },

      updateLoad: (id, updates) => {
        set((state) => {
          const newLoads = state.loads.map((load) => (load.id === id ? { ...load, ...updates } : load))
          const results = calculateResults(state.siteSystem, state.battery, state.pv, newLoads)
          return { loads: newLoads, results }
        })
      },

      removeLoad: (id) => {
        set((state) => {
          const newLoads = state.loads.filter((load) => load.id !== id)
          const results = calculateResults(state.siteSystem, state.battery, state.pv, newLoads)
          return { loads: newLoads, results }
        })
      },

      clearLoads: () => {
        set((state) => {
          const results = calculateResults(state.siteSystem, state.battery, state.pv, [])
          return { loads: [], results }
        })
      },

      resetAll: () => {
        set(() => ({
          siteSystem: defaultSiteSystem,
          battery: defaultBattery,
          pv: defaultPV,
          loads: [],
          results: {},
        }))
      },

      loadDemo: () => {
        set((state) => {
          const results = calculateResults(state.siteSystem, state.battery, state.pv, demoLoads)
          return { loads: demoLoads, results }
        })
      },
    }),
    {
      name: "solar-sizer-storage",
      partialize: (state) => ({
        siteSystem: state.siteSystem,
        battery: state.battery,
        pv: state.pv,
        loads: state.loads,
      }),
    },
  ),
)

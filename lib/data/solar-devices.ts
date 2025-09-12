export interface Device {
  id: string
  name: string
  category: string
  power: number // Watts
  peakFactor: number
  typicalHours: number
  description?: string
}

export interface Battery {
  id: string
  brand: string
  model: string
  voltage: number // V
  capacity: number // Ah
  dod: number // Depth of discharge
  efficiency: number
  chemistry: string
  price?: number
  description?: string
}

export interface SolarPanel {
  id: string
  brand: string
  model: string
  power: number // W
  vmp: number // V
  voc: number // V
  imp: number // A
  isc: number // A
  efficiency: number
  price?: number
  description?: string
}

export const DEVICES: Device[] = [
  // Éclairage
  { id: "led-bulb-12w", name: "Ampoule LED 12W", category: "Éclairage", power: 12, peakFactor: 1, typicalHours: 6 },
  { id: "led-bulb-18w", name: "Ampoule LED 18W", category: "Éclairage", power: 18, peakFactor: 1, typicalHours: 6 },
  { id: "led-strip-5m", name: "Bande LED 5m", category: "Éclairage", power: 24, peakFactor: 1, typicalHours: 8 },
  {
    id: "led-floodlight-50w",
    name: "Projecteur LED 50W",
    category: "Éclairage",
    power: 50,
    peakFactor: 1,
    typicalHours: 10,
  },
  {
    id: "led-floodlight-100w",
    name: "Projecteur LED 100W",
    category: "Éclairage",
    power: 100,
    peakFactor: 1,
    typicalHours: 10,
  },

  // Informatique
  { id: "laptop", name: "Ordinateur portable", category: "Informatique", power: 65, peakFactor: 1, typicalHours: 8 },
  { id: "desktop-pc", name: "PC de bureau", category: "Informatique", power: 150, peakFactor: 1.2, typicalHours: 8 },
  { id: "monitor-24", name: "Écran 24 pouces", category: "Informatique", power: 35, peakFactor: 1, typicalHours: 8 },
  { id: "router-wifi", name: "Routeur WiFi", category: "Informatique", power: 15, peakFactor: 1, typicalHours: 24 },
  { id: "printer", name: "Imprimante", category: "Informatique", power: 25, peakFactor: 3, typicalHours: 2 },

  // Électroménager
  {
    id: "fridge-200l",
    name: "Réfrigérateur 200L",
    category: "Électroménager",
    power: 120,
    peakFactor: 3,
    typicalHours: 8,
  },
  {
    id: "fridge-300l",
    name: "Réfrigérateur 300L",
    category: "Électroménager",
    power: 180,
    peakFactor: 3,
    typicalHours: 8,
  },
  {
    id: "freezer-150l",
    name: "Congélateur 150L",
    category: "Électroménager",
    power: 150,
    peakFactor: 3,
    typicalHours: 6,
  },
  { id: "microwave", name: "Micro-ondes", category: "Électroménager", power: 800, peakFactor: 1, typicalHours: 0.5 },
  { id: "washing-machine", name: "Lave-linge", category: "Électroménager", power: 500, peakFactor: 2, typicalHours: 1 },

  // Ventilation & Climatisation
  {
    id: "ceiling-fan",
    name: "Ventilateur plafond",
    category: "Ventilation",
    power: 75,
    peakFactor: 1.2,
    typicalHours: 12,
  },
  {
    id: "table-fan",
    name: "Ventilateur de table",
    category: "Ventilation",
    power: 45,
    peakFactor: 1.2,
    typicalHours: 8,
  },
  { id: "ac-1hp", name: "Climatiseur 1CV", category: "Climatisation", power: 900, peakFactor: 3, typicalHours: 8 },
  { id: "ac-1.5hp", name: "Climatiseur 1.5CV", category: "Climatisation", power: 1350, peakFactor: 3, typicalHours: 8 },

  // Pompes & Moteurs
  { id: "water-pump-0.5hp", name: "Pompe à eau 0.5CV", category: "Pompes", power: 370, peakFactor: 3, typicalHours: 2 },
  { id: "water-pump-1hp", name: "Pompe à eau 1CV", category: "Pompes", power: 750, peakFactor: 3, typicalHours: 2 },
  { id: "borehole-pump-1hp", name: "Pompe forage 1CV", category: "Pompes", power: 750, peakFactor: 4, typicalHours: 3 },
  { id: "pressure-pump", name: "Surpresseur", category: "Pompes", power: 550, peakFactor: 3, typicalHours: 1 },

  // Divertissement
  { id: "tv-32", name: "TV LED 32 pouces", category: "Divertissement", power: 60, peakFactor: 1, typicalHours: 6 },
  { id: "tv-55", name: "TV LED 55 pouces", category: "Divertissement", power: 120, peakFactor: 1, typicalHours: 6 },
  { id: "sound-system", name: "Chaîne Hi-Fi", category: "Divertissement", power: 80, peakFactor: 1.5, typicalHours: 4 },
  { id: "decoder", name: "Décodeur satellite", category: "Divertissement", power: 25, peakFactor: 1, typicalHours: 8 },

  // Sécurité
  { id: "cctv-camera", name: "Caméra CCTV", category: "Sécurité", power: 12, peakFactor: 1, typicalHours: 24 },
  { id: "dvr-4ch", name: "DVR 4 canaux", category: "Sécurité", power: 40, peakFactor: 1, typicalHours: 24 },
  { id: "alarm-system", name: "Système d'alarme", category: "Sécurité", power: 15, peakFactor: 1, typicalHours: 24 },
  {
    id: "electric-gate",
    name: "Portail électrique",
    category: "Sécurité",
    power: 300,
    peakFactor: 2,
    typicalHours: 0.2,
  },
]

export const BATTERIES: Battery[] = [
  // Lithium LiFePO4
  {
    id: "pylontech-us3000c",
    brand: "Pylontech",
    model: "US3000C",
    voltage: 48,
    capacity: 74,
    dod: 0.95,
    efficiency: 0.95,
    chemistry: "LiFePO4",
    description: "3.55kWh, modulaire, BMS intégré",
  },
  {
    id: "pylontech-us5000",
    brand: "Pylontech",
    model: "US5000",
    voltage: 48,
    capacity: 100,
    dod: 0.95,
    efficiency: 0.95,
    chemistry: "LiFePO4",
    description: "4.8kWh, haute capacité",
  },
  {
    id: "byd-battery-box-lv",
    brand: "BYD",
    model: "Battery-Box LV",
    voltage: 51.2,
    capacity: 200,
    dod: 0.9,
    efficiency: 0.95,
    chemistry: "LiFePO4",
    description: "10.24kWh, système modulaire",
  },
  {
    id: "hubble-am-5",
    brand: "Hubble",
    model: "AM-5",
    voltage: 51.2,
    capacity: 100,
    dod: 0.9,
    efficiency: 0.93,
    chemistry: "LiFePO4",
    description: "5.12kWh, compact",
  },

  // Gel/AGM
  {
    id: "victron-gel-12v-200ah",
    brand: "Victron",
    model: "Gel 12V 200Ah",
    voltage: 12,
    capacity: 200,
    dod: 0.5,
    efficiency: 0.85,
    chemistry: "Gel",
    description: "Batterie Gel longue durée",
  },
  {
    id: "trojan-t105",
    brand: "Trojan",
    model: "T-105",
    voltage: 6,
    capacity: 225,
    dod: 0.5,
    efficiency: 0.8,
    chemistry: "Plomb-acide",
    description: "Batterie à décharge profonde",
  },
  {
    id: "rolls-s550",
    brand: "Rolls",
    model: "S-550",
    voltage: 6,
    capacity: 428,
    dod: 0.5,
    efficiency: 0.8,
    chemistry: "Plomb-acide",
    description: "Haute capacité, robuste",
  },
]

export const SOLAR_PANELS: SolarPanel[] = [
  // Monocristallin haute efficacité
  {
    id: "jinko-tiger-neo-560w",
    brand: "Jinko Solar",
    model: "Tiger Neo 560W",
    power: 560,
    vmp: 41.8,
    voc: 50.3,
    imp: 13.4,
    isc: 14.1,
    efficiency: 0.217,
    description: "Monocristallin N-type, haute efficacité",
  },
  {
    id: "longi-himo6-585w",
    brand: "LONGi",
    model: "Hi-MO6 585W",
    power: 585,
    vmp: 44.5,
    voc: 53.4,
    imp: 13.15,
    isc: 13.9,
    efficiency: 0.223,
    description: "Technologie PERC+, performance élevée",
  },
  {
    id: "canadian-hiku7-670w",
    brand: "Canadian Solar",
    model: "HiKu7 670W",
    power: 670,
    vmp: 45.7,
    voc: 55.1,
    imp: 14.66,
    isc: 15.47,
    efficiency: 0.218,
    description: "Bifacial, technologie TOPCon",
  },
  {
    id: "trina-vertex-s-405w",
    brand: "Trina Solar",
    model: "Vertex S 405W",
    power: 405,
    vmp: 37.2,
    voc: 46.1,
    imp: 10.89,
    isc: 11.55,
    efficiency: 0.209,
    description: "Format standard, fiable",
  },

  // Panneaux résidentiels
  {
    id: "sunpower-maxeon-3-400w",
    brand: "SunPower",
    model: "Maxeon 3 400W",
    power: 400,
    vmp: 67.5,
    voc: 85.6,
    imp: 5.93,
    isc: 6.23,
    efficiency: 0.22,
    description: "Cellules IBC, garantie 25 ans",
  },
  {
    id: "lg-neon-r-380w",
    brand: "LG",
    model: "NeON R 380W",
    power: 380,
    vmp: 40.7,
    voc: 49.3,
    imp: 9.34,
    isc: 9.87,
    efficiency: 0.215,
    description: "Cellules CELLO, design élégant",
  },

  // Panneaux économiques
  {
    id: "ja-solar-jam72s30-540w",
    brand: "JA Solar",
    model: "JAM72S30 540W",
    power: 540,
    vmp: 41.76,
    voc: 50.35,
    imp: 12.93,
    isc: 13.64,
    efficiency: 0.209,
    description: "Rapport qualité-prix optimal",
  },
  {
    id: "risen-rsm144-6-450w",
    brand: "Risen Energy",
    model: "RSM144-6 450W",
    power: 450,
    vmp: 41.5,
    voc: 49.5,
    imp: 10.84,
    isc: 11.45,
    efficiency: 0.207,
    description: "Monocristallin PERC, économique",
  },
]

export const DEVICE_CATEGORIES = [
  "Tous",
  "Éclairage",
  "Informatique",
  "Électroménager",
  "Ventilation",
  "Climatisation",
  "Pompes",
  "Divertissement",
  "Sécurité",
]

export interface Material {
  id: string;
  name: string;
  brand: string;
  costPerKg: number;
}

export interface MaterialEntry {
  materialId: string;
  weightGrams: number;
}

export interface Recipe {
  id: string;
  name: string;
  materials: MaterialEntry[];
  printHours: number;
  printMinutes: number;
  notes: string;
  createdAt: number;
}

export interface CostBreakdown {
  materialCosts: { name: string; cost: number }[];
  totalMaterial: number;
  electricity: number;
  labor: number;
  subtotal: number;
  margin: number;
  marginPercent: number;
  total: number;
}

export const DEFAULT_MATERIALS: Material[] = [
  { id: "1", name: "PLA", brand: "eSUN", costPerKg: 12000 },
  { id: "2", name: "PLA+", brand: "eSUN", costPerKg: 13000 },
  { id: "3", name: "PLA+ HS", brand: "eSUN", costPerKg: 14000 },
  { id: "4", name: "PLA Silk", brand: "eSUN", costPerKg: 18000 },
  { id: "5", name: "PETG", brand: "eSUN", costPerKg: 15000 },
  { id: "6", name: "PETG HS", brand: "eSUN", costPerKg: 16000 },
  { id: "7", name: "PETG+ HS", brand: "eSUN", costPerKg: 17000 },
  { id: "8", name: "ASA", brand: "eSUN", costPerKg: 16000 },
  { id: "9", name: "ABS", brand: "eSUN", costPerKg: 14000 },
  { id: "10", name: "TPU", brand: "eSUN", costPerKg: 25000 },
];

export const formatCLP = (value: number) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(Math.round(value));

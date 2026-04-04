export interface Material {
  id: string;
  name: string;
  brand: string;
  details: string;
  colors: string[]; // hex color values, 1-15 colors
  costPerKg: number;
  spoolWeightG: number; // initial spool weight in grams (default 1000)
  weightUsedG: number; // total weight used across all fabricated projects
  spoolCount: number; // number of identical spools
}

export interface MaterialEntry {
  materialId: string;
  weightGrams: number;
}

export interface Project {
  id: string;
  name: string;
  materials: MaterialEntry[];
  printHours: number;
  printMinutes: number;
  notes: string;
  modelCost: number; // cost if model was purchased
  modelSource: string; // where the model came from
  photos: string[]; // base64 data URLs
  createdAt: number;
}

/** @deprecated Use Project instead */
export type Recipe = Project;

export interface FabricatedProject {
  id: string;
  projectId: string;
  salePrice: number;
  cost: number;
  date: number;
  isFree: boolean;
  useFixedPrice: boolean;
  fixedPrice: number;
  quantity: number; // how many units fabricated in this entry
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
  tags: string[]; // e.g. "3D", "Foto", "Frecuente"
  createdAt: number;
}

export interface Expense {
  id: string;
  description: string;
  category: "filamento" | "repuesto" | "otro";
  amount: number;
  date: number;
}

export interface CostBreakdown {
  materialCosts: { name: string; cost: number }[];
  totalMaterial: number;
  electricity: number;
  labor: number;
  modelCost: number;
  subtotal: number;
  margin: number;
  marginPercent: number;
  total: number;
}

export const DEFAULT_MATERIALS: Material[] = [
  { id: "1", name: "ABS", brand: "eSUN", details: "", colors: ["#222222"], costPerKg: 14000, spoolWeightG: 1000, weightUsedG: 0, spoolCount: 1 },
  { id: "2", name: "ASA", brand: "eSUN", details: "", colors: ["#333333"], costPerKg: 16000, spoolWeightG: 1000, weightUsedG: 0, spoolCount: 1 },
  { id: "3", name: "PETG", brand: "eSUN", details: "", colors: ["#4488cc"], costPerKg: 15000, spoolWeightG: 1000, weightUsedG: 0, spoolCount: 1 },
  { id: "4", name: "PETG HS", brand: "eSUN", details: "", colors: ["#5599dd"], costPerKg: 16000, spoolWeightG: 1000, weightUsedG: 0, spoolCount: 1 },
  { id: "5", name: "PETG+ HS", brand: "eSUN", details: "", colors: ["#66aaee"], costPerKg: 17000, spoolWeightG: 1000, weightUsedG: 0, spoolCount: 1 },
  { id: "6", name: "PLA", brand: "eSUN", details: "", colors: ["#eeeeee"], costPerKg: 12000, spoolWeightG: 1000, weightUsedG: 0, spoolCount: 1 },
  { id: "7", name: "PLA+", brand: "eSUN", details: "", colors: ["#dddddd"], costPerKg: 13000, spoolWeightG: 1000, weightUsedG: 0, spoolCount: 1 },
  { id: "8", name: "PLA+ HS", brand: "eSUN", details: "", colors: ["#cccccc"], costPerKg: 14000, spoolWeightG: 1000, weightUsedG: 0, spoolCount: 1 },
  { id: "9", name: "PLA Silk", brand: "eSUN", details: "Acabado metálico", colors: ["#c9a84c"], costPerKg: 18000, spoolWeightG: 1000, weightUsedG: 0, spoolCount: 1 },
  { id: "10", name: "TPU", brand: "eSUN", details: "Flexible", colors: ["#cc4444"], costPerKg: 25000, spoolWeightG: 1000, weightUsedG: 0, spoolCount: 1 },
];

export const formatCLP = (value: number) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(Math.round(value));

/** Group materials by base name (e.g. "PLA" groups PLA, PLA+, PLA+ HS, PLA Silk) */
export function groupMaterialsByType(materials: Material[]): Record<string, Material[]> {
  const groups: Record<string, Material[]> = {};
  const sorted = [...materials].sort((a, b) => a.name.localeCompare(b.name, "es"));

  for (const mat of sorted) {
    const base = mat.name.split(/[\s+]/)[0].toUpperCase();
    if (!groups[base]) groups[base] = [];
    groups[base].push(mat);
  }

  return Object.fromEntries(
    Object.entries(groups).sort(([a], [b]) => a.localeCompare(b, "es"))
  );
}

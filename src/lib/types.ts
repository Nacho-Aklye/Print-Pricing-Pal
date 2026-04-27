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
  unitsProduced: number; // how many units this project produces per print (default 1)
  createdAt: number;
}

/** @deprecated Use Project instead */
export type Recipe = Project;

export interface FabricatedProject {
  id: string;
  projectId: string;
  clientId?: string; // optional link to client
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

// ── Expanded expense categories ──

export type ExpenseSource = "3d" | "foto" | "personal";

export type ExpenseCategory =
  // 3D
  | "filamento" | "repuesto" | "herramienta_3d" | "mantenimiento_3d"
  // Foto
  | "equipo_foto" | "props" | "software_foto" | "edicion"
  // Personal / General
  | "transporte" | "alimentacion" | "arriendo" | "servicios" | "suscripciones" | "otro";

export interface Expense {
  id: string;
  description: string;
  category: ExpenseCategory;
  source: ExpenseSource;
  amount: number;
  date: number;
  notes?: string;
  paymentMethod?: "efectivo" | "tarjeta" | "transferencia" | "otro";
}

export const EXPENSE_SOURCE_LABELS: Record<ExpenseSource, string> = {
  "3d": "Impresión 3D",
  "foto": "Fotografía",
  "personal": "Personal",
};

export const EXPENSE_CATEGORIES_BY_SOURCE: Record<ExpenseSource, { value: ExpenseCategory; label: string; icon?: string }[]> = {
  "3d": [
    { value: "filamento", label: "Filamento" },
    { value: "repuesto", label: "Repuesto / Pieza" },
    { value: "herramienta_3d", label: "Herramienta" },
    { value: "mantenimiento_3d", label: "Mantenimiento" },
  ],
  "foto": [
    { value: "equipo_foto", label: "Equipo fotográfico" },
    { value: "props", label: "Props / Utilería" },
    { value: "software_foto", label: "Software / Licencia" },
    { value: "edicion", label: "Edición / Retoque" },
  ],
  "personal": [
    { value: "transporte", label: "Transporte" },
    { value: "alimentacion", label: "Alimentación" },
    { value: "arriendo", label: "Arriendo / Espacio" },
    { value: "servicios", label: "Servicios básicos" },
    { value: "suscripciones", label: "Suscripciones" },
    { value: "otro", label: "Otro" },
  ],
};

export const ALL_EXPENSE_CATEGORIES = Object.values(EXPENSE_CATEGORIES_BY_SOURCE).flat();

export const PAYMENT_METHODS: { value: NonNullable<Expense["paymentMethod"]>; label: string }[] = [
  { value: "efectivo", label: "Efectivo" },
  { value: "tarjeta", label: "Tarjeta" },
  { value: "transferencia", label: "Transferencia" },
  { value: "otro", label: "Otro" },
];

// ── Photography Quotation ──

export interface PhotoExtra {
  id: string;
  name: string;
  price: number;
}

export interface PhotoPackage {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  includedPhotos: number;
  includedEdits: number;
  extras: string[]; // what's included description lines
  createdAt: number;
}

export interface PhotoQuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface PhotoQuote {
  id: string;
  clientId?: string;
  type: "package" | "itemized";
  packageId?: string; // if type is package
  // Itemized fields
  baseRate: number; // tarifa base por hora/sesión
  baseRateUnit: "hora" | "sesion";
  baseRateQty: number;
  items: PhotoQuoteItem[]; // extras / additional items
  // Common
  title: string;
  notes: string;
  discount: number; // percentage
  status: "borrador" | "enviado" | "aceptado" | "rechazado";
  createdAt: number;
  updatedAt: number;
}

// ── Branding ──

export interface BrandSettings {
  businessName: string;
  logo: string; // base64
  primaryColor: string; // hex
  secondaryColor: string; // hex
  phone: string;
  email: string;
  website: string;
  socialMedia: string;
}

// ── Helpers ──

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

export function calcPhotoQuoteTotal(quote: PhotoQuote, packages: PhotoPackage[]): number {
  let subtotal = 0;
  if (quote.type === "package" && quote.packageId) {
    const pkg = packages.find(p => p.id === quote.packageId);
    if (pkg) subtotal = pkg.basePrice;
  } else {
    subtotal = quote.baseRate * quote.baseRateQty;
  }
  for (const item of quote.items) {
    subtotal += item.quantity * item.unitPrice;
  }
  if (quote.discount > 0) {
    subtotal = subtotal * (1 - quote.discount / 100);
  }
  return Math.round(subtotal);
}

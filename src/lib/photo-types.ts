import { formatCLP } from "./types";

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
  includes: string[]; // list of what's included
}

export interface PhotoQuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface PhotoQuote {
  id: string;
  clientId?: string;
  clientName: string;
  clientEmail: string;
  type: "package" | "itemized";
  packageId?: string;
  packageName?: string;
  baseRate: number; // tarifa base (por sesión/hora)
  extras: { extraId: string; name: string; price: number; quantity: number }[];
  items: PhotoQuoteItem[]; // for itemized quotes
  discount: number; // percentage
  notes: string;
  status: "draft" | "sent" | "accepted" | "rejected";
  createdAt: number;
}

export interface PhotoBranding {
  businessName: string;
  tagline: string;
  phone: string;
  email: string;
  website: string;
  socialMedia: string;
  logoDataUrl: string; // base64
  primaryColor: string; // hex
  secondaryColor: string; // hex
}

export const DEFAULT_EXTRAS: PhotoExtra[] = [
  { id: "1", name: "Retoque avanzado por foto", price: 5000 },
  { id: "2", name: "Entrega express (24h)", price: 15000 },
  { id: "3", name: "Fondo personalizado", price: 8000 },
  { id: "4", name: "Foto 360°", price: 12000 },
  { id: "5", name: "Video corto de producto", price: 20000 },
];

export const DEFAULT_PACKAGES: PhotoPackage[] = [
  {
    id: "1",
    name: "Básico",
    description: "Ideal para e-commerce y redes sociales",
    basePrice: 50000,
    includes: ["5 productos", "3 fotos por producto", "Fondo blanco", "Entrega en 3 días"],
  },
  {
    id: "2",
    name: "Profesional",
    description: "Para catálogos y publicidad",
    basePrice: 120000,
    includes: ["10 productos", "5 fotos por producto", "2 fondos", "Retoque básico", "Entrega en 5 días"],
  },
  {
    id: "3",
    name: "Premium",
    description: "Producción completa con estilismo",
    basePrice: 250000,
    includes: ["20 productos", "8 fotos por producto", "Fondos ilimitados", "Retoque avanzado", "Video corto", "Entrega en 7 días"],
  },
];

export const DEFAULT_BRANDING: PhotoBranding = {
  businessName: "",
  tagline: "",
  phone: "",
  email: "",
  website: "",
  socialMedia: "",
  logoDataUrl: "",
  primaryColor: "#2d8a6e",
  secondaryColor: "#1a1a2e",
};

export function calcQuoteTotal(quote: PhotoQuote): {
  subtotal: number;
  discountAmount: number;
  total: number;
} {
  let subtotal = quote.baseRate;

  if (quote.type === "package") {
    // baseRate is the package price in this case
  }

  for (const extra of quote.extras) {
    subtotal += extra.price * extra.quantity;
  }

  for (const item of quote.items) {
    subtotal += item.unitPrice * item.quantity;
  }

  const discountAmount = Math.round(subtotal * (quote.discount / 100));
  const total = subtotal - discountAmount;

  return { subtotal, discountAmount, total };
}

export { formatCLP };

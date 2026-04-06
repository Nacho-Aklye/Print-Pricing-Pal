import { useState, useMemo } from "react";
import { Camera, Plus, Package, FileText, ChevronRight, Trash2, Edit3, Check, X, Send, Clock, CheckCircle, XCircle, Download } from "lucide-react";
import { usePhotoPackages, usePhotoQuotes, useClients, useBrandSettings } from "@/lib/hooks";
import type { PhotoQuote, PhotoQuoteItem, PhotoPackage } from "@/lib/types";
import { formatCLP, calcPhotoQuoteTotal } from "@/lib/types";

type Tab = "cotizaciones" | "paquetes" | "branding";
type QuoteView = "list" | "create" | "detail";

const STATUS_CONFIG = {
  borrador: { label: "Borrador", icon: Edit3, color: "text-muted-foreground bg-muted" },
  enviado: { label: "Enviado", icon: Send, color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30" },
  aceptado: { label: "Aceptado", icon: CheckCircle, color: "text-accent bg-accent/15" },
  rechazado: { label: "Rechazado", icon: XCircle, color: "text-destructive bg-destructive/15" },
} as const;

const Photography = () => {
  const { packages, addPackage, updatePackage, deletePackage } = usePhotoPackages();
  const { quotes, addQuote, updateQuote, deleteQuote } = usePhotoQuotes();
  const { clients } = useClients();
  const { brand, updateBrand } = useBrandSettings();

  const [tab, setTab] = useState<Tab>("cotizaciones");
  const [quoteView, setQuoteView] = useState<QuoteView>("list");
  const [selectedQuote, setSelectedQuote] = useState<PhotoQuote | null>(null);
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);

  // ── Package form state ──
  const [pkgName, setPkgName] = useState("");
  const [pkgDesc, setPkgDesc] = useState("");
  const [pkgPrice, setPkgPrice] = useState("");
  const [pkgPhotos, setPkgPhotos] = useState("");
  const [pkgEdits, setPkgEdits] = useState("");
  const [pkgExtras, setPkgExtras] = useState("");

  // ── Quote form state ──
  const [qType, setQType] = useState<"package" | "itemized">("itemized");
  const [qTitle, setQTitle] = useState("");
  const [qClientId, setQClientId] = useState("");
  const [qPackageId, setQPackageId] = useState("");
  const [qBaseRate, setQBaseRate] = useState("");
  const [qBaseUnit, setQBaseUnit] = useState<"hora" | "sesion">("sesion");
  const [qBaseQty, setQBaseQty] = useState("1");
  const [qItems, setQItems] = useState<PhotoQuoteItem[]>([]);
  const [qDiscount, setQDiscount] = useState("");
  const [qNotes, setQNotes] = useState("");

  const resetPackageForm = () => {
    setPkgName(""); setPkgDesc(""); setPkgPrice(""); setPkgPhotos(""); setPkgEdits(""); setPkgExtras("");
    setShowAddPackage(false); setEditingPackageId(null);
  };

  const resetQuoteForm = () => {
    setQType("itemized"); setQTitle(""); setQClientId(""); setQPackageId("");
    setQBaseRate(""); setQBaseUnit("sesion"); setQBaseQty("1");
    setQItems([]); setQDiscount(""); setQNotes("");
    setQuoteView("list");
  };

  const handleSavePackage = () => {
    if (!pkgName.trim()) return;
    const data = {
      name: pkgName, description: pkgDesc, basePrice: Number(pkgPrice) || 0,
      includedPhotos: Number(pkgPhotos) || 0, includedEdits: Number(pkgEdits) || 0,
      extras: pkgExtras.split("\n").filter(Boolean),
    };
    if (editingPackageId) {
      updatePackage(editingPackageId, data);
    } else {
      addPackage(data);
    }
    resetPackageForm();
  };

  const editPackage = (pkg: PhotoPackage) => {
    setPkgName(pkg.name); setPkgDesc(pkg.description); setPkgPrice(String(pkg.basePrice));
    setPkgPhotos(String(pkg.includedPhotos)); setPkgEdits(String(pkg.includedEdits));
    setPkgExtras(pkg.extras.join("\n"));
    setEditingPackageId(pkg.id); setShowAddPackage(true);
  };

  const handleCreateQuote = () => {
    const quote: Omit<PhotoQuote, "id" | "createdAt" | "updatedAt"> = {
      type: qType,
      title: qTitle || (qType === "package" ? "Cotización de paquete" : "Cotización personalizada"),
      clientId: qClientId || undefined,
      packageId: qType === "package" ? qPackageId : undefined,
      baseRate: Number(qBaseRate) || 0,
      baseRateUnit: qBaseUnit,
      baseRateQty: Number(qBaseQty) || 1,
      items: qItems,
      discount: Number(qDiscount) || 0,
      notes: qNotes,
      status: "borrador",
    };
    addQuote(quote);
    resetQuoteForm();
  };

  const addItem = () => setQItems([...qItems, { description: "", quantity: 1, unitPrice: 0 }]);
  const updateItem = (i: number, field: keyof PhotoQuoteItem, value: string | number) => {
    const next = [...qItems];
    (next[i] as any)[field] = value;
    setQItems(next);
  };
  const removeItem = (i: number) => setQItems(qItems.filter((_, idx) => idx !== i));

  // Calculate quote preview total
  const previewQuote: PhotoQuote = {
    id: "", createdAt: 0, updatedAt: 0, status: "borrador",
    type: qType, title: qTitle, packageId: qPackageId,
    baseRate: Number(qBaseRate) || 0, baseRateUnit: qBaseUnit, baseRateQty: Number(qBaseQty) || 1,
    items: qItems, discount: Number(qDiscount) || 0, notes: qNotes,
  };
  const previewTotal = calcPhotoQuoteTotal(previewQuote, packages);

  const sortedQuotes = useMemo(() =>
    [...quotes].sort((a, b) => b.updatedAt - a.updatedAt), [quotes]
  );

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateBrand({ logo: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const tabs: { key: Tab; label: string; icon: typeof Camera }[] = [
    { key: "cotizaciones", label: "Cotizaciones", icon: FileText },
    { key: "paquetes", label: "Paquetes", icon: Package },
    { key: "branding", label: "Branding", icon: Camera },
  ];

  return (
    <div className="mx-auto max-w-xl px-4 py-6 space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Fotografía</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => { setTab(key); setQuoteView("list"); setSelectedQuote(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-colors ${
              tab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}>
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* ═══════ TAB: COTIZACIONES ═══════ */}
      {tab === "cotizaciones" && quoteView === "list" && (
        <div className="space-y-3">
          <button onClick={() => setQuoteView("create")} className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2.5 text-xs font-medium text-accent-foreground">
            <Plus className="h-3.5 w-3.5" /> Nueva cotización
          </button>

          {sortedQuotes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-40" />
              Aún no hay cotizaciones
            </div>
          ) : (
            sortedQuotes.map((q) => {
              const cfg = STATUS_CONFIG[q.status];
              const StatusIcon = cfg.icon;
              const client = q.clientId ? clients.find(c => c.id === q.clientId) : null;
              return (
                <button key={q.id} onClick={() => { setSelectedQuote(q); setQuoteView("detail"); }}
                  className="w-full text-left rounded-xl bg-card border p-3 flex items-center justify-between hover:bg-secondary/30 transition-colors active:scale-[0.99]">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{q.title}</p>
                      <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${cfg.color}`}>
                        <StatusIcon className="h-2.5 w-2.5" /> {cfg.label}
                      </span>
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      {client && <span>{client.name}</span>}
                      <span className="font-mono">{formatCLP(calcPhotoQuoteTotal(q, packages))}</span>
                      <span>{new Date(q.updatedAt).toLocaleDateString("es-CL")}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              );
            })
          )}
        </div>
      )}

      {/* ═══════ CREATE QUOTE ═══════ */}
      {tab === "cotizaciones" && quoteView === "create" && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Nueva cotización</h2>
            <button onClick={resetQuoteForm} className="text-xs text-muted-foreground hover:text-foreground">Cancelar</button>
          </div>

          <input placeholder="Título de la cotización" value={qTitle} onChange={e => setQTitle(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />

          <select value={qClientId} onChange={e => setQClientId(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
            <option value="">Sin cliente asignado</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>)}
          </select>

          {/* Type selector */}
          <div className="flex gap-2">
            <button onClick={() => setQType("itemized")}
              className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-colors ${qType === "itemized" ? "border-accent bg-accent/10 text-accent" : "text-muted-foreground"}`}>
              Personalizada
            </button>
            <button onClick={() => setQType("package")}
              className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-colors ${qType === "package" ? "border-accent bg-accent/10 text-accent" : "text-muted-foreground"}`}>
              Desde paquete
            </button>
          </div>

          {qType === "package" ? (
            <select value={qPackageId} onChange={e => setQPackageId(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
              <option value="">Seleccionar paquete...</option>
              {packages.map(p => <option key={p.id} value={p.id}>{p.name} — {formatCLP(p.basePrice)}</option>)}
            </select>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input type="number" placeholder="Tarifa base" value={qBaseRate} onChange={e => setQBaseRate(e.target.value)}
                  className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm font-mono" />
                <select value={qBaseUnit} onChange={e => setQBaseUnit(e.target.value as any)}
                  className="rounded-lg border bg-background px-3 py-2 text-sm">
                  <option value="sesion">por sesión</option>
                  <option value="hora">por hora</option>
                </select>
                <input type="number" min="1" value={qBaseQty} onChange={e => setQBaseQty(e.target.value)}
                  className="w-16 rounded-lg border bg-background px-2 py-2 text-sm font-mono text-center" />
              </div>
            </div>
          )}

          {/* Extra items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-muted-foreground">Extras / Items adicionales</h3>
              <button onClick={addItem} className="text-xs text-accent hover:underline flex items-center gap-1">
                <Plus className="h-3 w-3" /> Agregar
              </button>
            </div>
            {qItems.map((item, i) => (
              <div key={i} className="flex gap-2 items-start">
                <input placeholder="Descripción" value={item.description}
                  onChange={e => updateItem(i, "description", e.target.value)}
                  className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm" />
                <input type="number" min="1" placeholder="Cant" value={item.quantity}
                  onChange={e => updateItem(i, "quantity", Number(e.target.value) || 1)}
                  className="w-14 rounded-lg border bg-background px-2 py-2 text-sm font-mono text-center" />
                <input type="number" placeholder="Precio" value={item.unitPrice || ""}
                  onChange={e => updateItem(i, "unitPrice", Number(e.target.value) || 0)}
                  className="w-24 rounded-lg border bg-background px-2 py-2 text-sm font-mono" />
                <button onClick={() => removeItem(i)} className="mt-2 text-destructive hover:text-destructive/80">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <input type="number" placeholder="Descuento %" value={qDiscount} onChange={e => setQDiscount(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />

          <textarea placeholder="Notas adicionales..." value={qNotes} onChange={e => setQNotes(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[60px] resize-none" />

          {/* Preview total */}
          <div className="rounded-lg bg-muted/50 p-3 flex justify-between items-center">
            <span className="text-sm font-medium">Total estimado</span>
            <span className="text-lg font-bold font-mono">{formatCLP(previewTotal)}</span>
          </div>

          <button onClick={handleCreateQuote}
            className="w-full rounded-lg bg-accent py-2.5 text-xs font-medium text-accent-foreground">
            Crear cotización
          </button>
        </div>
      )}

      {/* ═══════ QUOTE DETAIL ═══════ */}
      {tab === "cotizaciones" && quoteView === "detail" && selectedQuote && (
        <QuoteDetail
          quote={selectedQuote}
          packages={packages}
          clients={clients}
          brand={brand}
          onBack={() => { setQuoteView("list"); setSelectedQuote(null); }}
          onUpdateStatus={(status) => { updateQuote(selectedQuote.id, { status }); setSelectedQuote({ ...selectedQuote, status }); }}
          onDelete={() => { deleteQuote(selectedQuote.id); setQuoteView("list"); setSelectedQuote(null); }}
        />
      )}

      {/* ═══════ TAB: PAQUETES ═══════ */}
      {tab === "paquetes" && (
        <div className="space-y-3">
          <button onClick={() => { resetPackageForm(); setShowAddPackage(true); }}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2.5 text-xs font-medium text-accent-foreground">
            <Plus className="h-3.5 w-3.5" /> Nuevo paquete
          </button>

          {showAddPackage && (
            <div className="rounded-xl bg-card border p-4 space-y-3 animate-fade-in-up">
              <h3 className="text-sm font-semibold">{editingPackageId ? "Editar" : "Nuevo"} paquete</h3>
              <input placeholder="Nombre del paquete" value={pkgName} onChange={e => setPkgName(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              <textarea placeholder="Descripción" value={pkgDesc} onChange={e => setPkgDesc(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[50px] resize-none" />
              <div className="grid grid-cols-3 gap-2">
                <input type="number" placeholder="Precio" value={pkgPrice} onChange={e => setPkgPrice(e.target.value)}
                  className="rounded-lg border bg-background px-3 py-2 text-sm font-mono" />
                <input type="number" placeholder="Fotos incl." value={pkgPhotos} onChange={e => setPkgPhotos(e.target.value)}
                  className="rounded-lg border bg-background px-3 py-2 text-sm" />
                <input type="number" placeholder="Ediciones" value={pkgEdits} onChange={e => setPkgEdits(e.target.value)}
                  className="rounded-lg border bg-background px-3 py-2 text-sm" />
              </div>
              <textarea placeholder="Incluye (uno por línea)..." value={pkgExtras} onChange={e => setPkgExtras(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[60px] resize-none" />
              <div className="flex gap-2">
                <button onClick={handleSavePackage} className="flex-1 rounded-lg bg-accent py-2 text-xs font-medium text-accent-foreground">
                  {editingPackageId ? "Guardar cambios" : "Crear paquete"}
                </button>
                <button onClick={resetPackageForm} className="rounded-lg border px-3 py-2 text-xs">Cancelar</button>
              </div>
            </div>
          )}

          {packages.length === 0 && !showAddPackage && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
              Aún no hay paquetes
            </div>
          )}

          {packages.map(pkg => (
            <div key={pkg.id} className="rounded-xl bg-card border p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold">{pkg.name}</p>
                  <p className="text-xs text-muted-foreground">{pkg.description}</p>
                </div>
                <span className="text-sm font-bold font-mono">{formatCLP(pkg.basePrice)}</span>
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>📷 {pkg.includedPhotos} fotos</span>
                <span>✏️ {pkg.includedEdits} ediciones</span>
              </div>
              {pkg.extras.length > 0 && (
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {pkg.extras.map((e, i) => <li key={i}>• {e}</li>)}
                </ul>
              )}
              <div className="flex gap-2 pt-1">
                <button onClick={() => editPackage(pkg)} className="text-xs text-accent hover:underline flex items-center gap-1">
                  <Edit3 className="h-3 w-3" /> Editar
                </button>
                <button onClick={() => deletePackage(pkg.id)} className="text-xs text-destructive hover:underline flex items-center gap-1">
                  <Trash2 className="h-3 w-3" /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════ TAB: BRANDING ═══════ */}
      {tab === "branding" && (
        <div className="space-y-4">
          <div className="rounded-xl bg-card border p-4 space-y-3">
            <h2 className="text-sm font-semibold">Identidad visual para PDFs</h2>

            <div className="flex items-center gap-4">
              {brand.logo ? (
                <img src={brand.logo} alt="Logo" className="h-16 w-16 rounded-lg object-contain bg-muted" />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                  <Camera className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <label className="text-xs text-accent hover:underline cursor-pointer">
                {brand.logo ? "Cambiar logo" : "Subir logo"}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
            </div>

            <input placeholder="Nombre del negocio" value={brand.businessName}
              onChange={e => updateBrand({ businessName: e.target.value })}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Color principal</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={brand.primaryColor}
                    onChange={e => updateBrand({ primaryColor: e.target.value })}
                    className="h-8 w-8 rounded cursor-pointer border-0" />
                  <span className="text-xs font-mono text-muted-foreground">{brand.primaryColor}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Color secundario</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={brand.secondaryColor}
                    onChange={e => updateBrand({ secondaryColor: e.target.value })}
                    className="h-8 w-8 rounded cursor-pointer border-0" />
                  <span className="text-xs font-mono text-muted-foreground">{brand.secondaryColor}</span>
                </div>
              </div>
            </div>

            <input placeholder="Teléfono" value={brand.phone}
              onChange={e => updateBrand({ phone: e.target.value })}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            <input placeholder="Email" value={brand.email}
              onChange={e => updateBrand({ email: e.target.value })}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            <input placeholder="Sitio web" value={brand.website}
              onChange={e => updateBrand({ website: e.target.value })}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            <input placeholder="Redes sociales (ej: @tunegocio)" value={brand.socialMedia}
              onChange={e => updateBrand({ socialMedia: e.target.value })}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />

            <p className="text-xs text-muted-foreground">Estos datos aparecerán en los PDFs de cotización que generes.</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Quote Detail Component ──

function QuoteDetail({ quote, packages, clients, brand, onBack, onUpdateStatus, onDelete }: {
  quote: PhotoQuote;
  packages: PhotoPackage[];
  clients: import("@/lib/types").Client[];
  brand: import("@/lib/types").BrandSettings;
  onBack: () => void;
  onUpdateStatus: (s: PhotoQuote["status"]) => void;
  onDelete: () => void;
}) {
  const total = calcPhotoQuoteTotal(quote, packages);
  const cfg = STATUS_CONFIG[quote.status];
  const StatusIcon = cfg.icon;
  const client = quote.clientId ? clients.find(c => c.id === quote.clientId) : null;
  const pkg = quote.packageId ? packages.find(p => p.id === quote.packageId) : null;

  const generatePDF = () => {
    // Build HTML for PDF
    const primaryColor = brand.primaryColor || "#339966";
    const secondaryColor = brand.secondaryColor || "#1a1a2e";

    const itemsHTML = quote.items.map(item => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.description}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-family:monospace;">${formatCLP(item.unitPrice)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-family:monospace;">${formatCLP(item.quantity * item.unitPrice)}</td>
      </tr>
    `).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      body{font-family:system-ui,sans-serif;margin:0;padding:40px;color:#333;}
      .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;padding-bottom:20px;border-bottom:3px solid ${primaryColor};}
      .brand{display:flex;align-items:center;gap:16px;}
      .brand img{height:60px;width:60px;object-fit:contain;}
      .brand h1{font-size:22px;color:${secondaryColor};margin:0;}
      .contact{text-align:right;font-size:12px;color:#666;line-height:1.8;}
      .title{font-size:18px;font-weight:700;color:${secondaryColor};margin:20px 0 10px;}
      .meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px;font-size:13px;}
      .meta span{color:#888;}
      table{width:100%;border-collapse:collapse;margin:16px 0;}
      thead th{background:${primaryColor};color:white;padding:10px 12px;text-align:left;font-size:12px;text-transform:uppercase;}
      thead th:last-child,thead th:nth-child(3),thead th:nth-child(2){text-align:center;}
      .total-row{font-size:18px;font-weight:bold;color:${secondaryColor};}
      .notes{background:#f7f7f7;padding:16px;border-radius:8px;font-size:13px;margin-top:16px;}
      .footer{margin-top:40px;padding-top:16px;border-top:2px solid ${primaryColor};text-align:center;font-size:11px;color:#999;}
    </style></head><body>
      <div class="header">
        <div class="brand">
          ${brand.logo ? `<img src="${brand.logo}" />` : ""}
          <h1>${brand.businessName || "Mi Negocio"}</h1>
        </div>
        <div class="contact">
          ${brand.phone ? `📱 ${brand.phone}<br>` : ""}
          ${brand.email ? `✉️ ${brand.email}<br>` : ""}
          ${brand.website ? `🌐 ${brand.website}<br>` : ""}
          ${brand.socialMedia ? `${brand.socialMedia}` : ""}
        </div>
      </div>

      <div class="title">COTIZACIÓN: ${quote.title}</div>
      <div class="meta">
        <div><span>Fecha:</span> ${new Date(quote.createdAt).toLocaleDateString("es-CL")}</div>
        <div><span>Estado:</span> ${STATUS_CONFIG[quote.status].label}</div>
        ${client ? `<div><span>Cliente:</span> ${client.name}</div>` : ""}
        ${client?.company ? `<div><span>Empresa:</span> ${client.company}</div>` : ""}
      </div>

      <table>
        <thead><tr><th>Descripción</th><th>Cant.</th><th>P. Unit.</th><th style="text-align:right">Subtotal</th></tr></thead>
        <tbody>
          ${quote.type === "package" && pkg ? `
            <tr>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;"><strong>${pkg.name}</strong><br><span style="font-size:11px;color:#888;">${pkg.description}</span></td>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">1</td>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-family:monospace;">${formatCLP(pkg.basePrice)}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-family:monospace;">${formatCLP(pkg.basePrice)}</td>
            </tr>
          ` : `
            <tr>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;">Tarifa base (${quote.baseRateUnit})</td>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${quote.baseRateQty}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-family:monospace;">${formatCLP(quote.baseRate)}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-family:monospace;">${formatCLP(quote.baseRate * quote.baseRateQty)}</td>
            </tr>
          `}
          ${itemsHTML}
        </tbody>
      </table>

      ${quote.discount > 0 ? `<p style="text-align:right;font-size:13px;color:#888;">Descuento: -${quote.discount}%</p>` : ""}
      <div style="text-align:right;margin-top:8px;" class="total-row">TOTAL: ${formatCLP(total)}</div>

      ${quote.notes ? `<div class="notes"><strong>Notas:</strong><br>${quote.notes}</div>` : ""}
      <div class="footer">Cotización generada por ${brand.businessName || "Mi Negocio"} • Válida por 15 días</div>
    </body></html>`;

    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      setTimeout(() => w.print(), 500);
    }
  };

  const statuses: PhotoQuote["status"][] = ["borrador", "enviado", "aceptado", "rechazado"];

  return (
    <div className="space-y-4 animate-fade-in-up">
      <button onClick={onBack} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
        ← Volver
      </button>

      <div className="rounded-xl bg-card border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{quote.title}</h2>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${cfg.color}`}>
            <StatusIcon className="h-3 w-3" /> {cfg.label}
          </span>
        </div>

        {client && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{client.name}</span>
            {client.company && <span> · {client.company}</span>}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <div>Creada: {new Date(quote.createdAt).toLocaleDateString("es-CL")}</div>
          {quote.type === "package" && pkg && <div>Paquete: {pkg.name}</div>}
          {quote.type === "itemized" && <div>Tarifa base: {formatCLP(quote.baseRate)} / {quote.baseRateUnit} × {quote.baseRateQty}</div>}
        </div>

        {quote.items.length > 0 && (
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-muted-foreground">Extras</h3>
            {quote.items.map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span>{item.description} ×{item.quantity}</span>
                <span className="font-mono">{formatCLP(item.quantity * item.unitPrice)}</span>
              </div>
            ))}
          </div>
        )}

        {quote.discount > 0 && <div className="text-xs text-muted-foreground">Descuento: -{quote.discount}%</div>}

        <div className="flex justify-between items-center border-t pt-3">
          <span className="text-sm font-semibold">Total</span>
          <span className="text-lg font-bold font-mono">{formatCLP(total)}</span>
        </div>

        {quote.notes && <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">{quote.notes}</p>}
      </div>

      {/* Status changer */}
      <div className="rounded-xl bg-card border p-4 space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground">Cambiar estado</h3>
        <div className="grid grid-cols-4 gap-1">
          {statuses.map(s => {
            const c = STATUS_CONFIG[s];
            const Icon = c.icon;
            return (
              <button key={s} onClick={() => onUpdateStatus(s)}
                className={`flex flex-col items-center gap-1 rounded-lg border py-2 text-[10px] font-medium transition-colors ${
                  quote.status === s ? "border-accent bg-accent/10" : "text-muted-foreground hover:text-foreground"
                }`}>
                <Icon className="h-3.5 w-3.5" /> {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={generatePDF}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-accent py-2.5 text-xs font-medium text-accent-foreground">
          <Download className="h-3.5 w-3.5" /> Generar PDF
        </button>
        <button onClick={onDelete}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-destructive/30 text-destructive px-4 py-2.5 text-xs font-medium hover:bg-destructive/10">
          <Trash2 className="h-3.5 w-3.5" /> Eliminar
        </button>
      </div>
    </div>
  );
}

export default Photography;

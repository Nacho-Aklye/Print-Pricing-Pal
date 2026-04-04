import { useState } from "react";
import {
  Camera, Package, FileText, Plus, Trash2, Edit2, Download, Eye,
  ChevronRight, Settings2, X, Check, Star
} from "lucide-react";
import { usePhotoPackages, usePhotoExtras, usePhotoQuotes, usePhotoBranding } from "@/lib/photo-hooks";
import { useClients } from "@/lib/hooks";
import type { PhotoQuote, PhotoQuoteItem } from "@/lib/photo-types";
import { calcQuoteTotal, formatCLP } from "@/lib/photo-types";
import { generateQuotePDF } from "@/lib/photo-pdf";

type Tab = "quotes" | "packages" | "branding";
type QuoteMode = null | "new-package" | "new-itemized";

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  draft: { label: "Borrador", cls: "bg-muted text-muted-foreground" },
  sent: { label: "Enviada", cls: "bg-accent/15 text-accent" },
  accepted: { label: "Aceptada", cls: "bg-accent text-accent-foreground" },
  rejected: { label: "Rechazada", cls: "bg-destructive/15 text-destructive" },
};

const Photography = () => {
  const { packages, addPackage, updatePackage, deletePackage } = usePhotoPackages();
  const { extras, addExtra, deleteExtra } = usePhotoExtras();
  const { quotes, addQuote, updateQuote, deleteQuote } = usePhotoQuotes();
  const { branding, updateBranding } = usePhotoBranding();
  const { clients } = useClients();

  const [tab, setTab] = useState<Tab>("quotes");
  const [quoteMode, setQuoteMode] = useState<QuoteMode>(null);
  const [viewQuote, setViewQuote] = useState<PhotoQuote | null>(null);

  // New quote form state
  const [selPkgId, setSelPkgId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientId, setClientId] = useState("");
  const [baseRate, setBaseRate] = useState("");
  const [discount, setDiscount] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedExtras, setSelectedExtras] = useState<{ extraId: string; name: string; price: number; quantity: number }[]>([]);
  const [customItems, setCustomItems] = useState<PhotoQuoteItem[]>([]);

  // Package form
  const [showPkgForm, setShowPkgForm] = useState(false);
  const [pkgName, setPkgName] = useState("");
  const [pkgDesc, setPkgDesc] = useState("");
  const [pkgPrice, setPkgPrice] = useState("");
  const [pkgIncludes, setPkgIncludes] = useState("");

  // Extra form
  const [showExtraForm, setShowExtraForm] = useState(false);
  const [extraName, setExtraName] = useState("");
  const [extraPrice, setExtraPrice] = useState("");

  const resetQuoteForm = () => {
    setSelPkgId("");
    setClientName("");
    setClientEmail("");
    setClientId("");
    setBaseRate("");
    setDiscount("");
    setNotes("");
    setSelectedExtras([]);
    setCustomItems([]);
    setQuoteMode(null);
  };

  const handleClientSelect = (id: string) => {
    setClientId(id);
    const c = clients.find((cl) => cl.id === id);
    if (c) {
      setClientName(c.name);
      setClientEmail(c.email);
    }
  };

  const toggleExtra = (extra: { id: string; name: string; price: number }) => {
    setSelectedExtras((prev) => {
      const exists = prev.find((e) => e.extraId === extra.id);
      if (exists) return prev.filter((e) => e.extraId !== extra.id);
      return [...prev, { extraId: extra.id, name: extra.name, price: extra.price, quantity: 1 }];
    });
  };

  const addCustomItem = () => {
    setCustomItems((prev) => [
      ...prev,
      { id: Date.now().toString(), description: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const updateCustomItem = (id: string, updates: Partial<PhotoQuoteItem>) => {
    setCustomItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const handleSaveQuote = () => {
    const pkg = packages.find((p) => p.id === selPkgId);
    const q: Omit<PhotoQuote, "id" | "createdAt"> = {
      clientId: clientId || undefined,
      clientName,
      clientEmail,
      type: quoteMode === "new-package" ? "package" : "itemized",
      packageId: selPkgId || undefined,
      packageName: pkg?.name,
      baseRate: quoteMode === "new-package" ? (pkg?.basePrice || 0) : (parseFloat(baseRate) || 0),
      extras: selectedExtras,
      items: customItems.filter((i) => i.description),
      discount: parseFloat(discount) || 0,
      notes,
      status: "draft",
    };
    addQuote(q);
    resetQuoteForm();
  };

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "quotes", label: "Cotizaciones", icon: FileText },
    { key: "packages", label: "Paquetes", icon: Package },
    { key: "branding", label: "Branding", icon: Settings2 },
  ];

  return (
    <div className="min-h-screen px-4 py-6 md:py-12">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Camera className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Fotografía</h1>
            <p className="text-xs text-muted-foreground">Cotizaciones y paquetes</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-muted p-1 mb-6">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-all ${
                tab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* --- QUOTES TAB --- */}
        {tab === "quotes" && !quoteMode && !viewQuote && (
          <div className="space-y-3 animate-fade-in-up">
            <div className="flex gap-2">
              <button
                onClick={() => setQuoteMode("new-package")}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-accent text-accent-foreground py-3 text-sm font-medium hover:bg-accent/90 active:scale-[0.97] transition-all"
              >
                <Package className="h-4 w-4" /> Desde paquete
              </button>
              <button
                onClick={() => setQuoteMode("new-itemized")}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border py-3 text-sm font-medium hover:bg-secondary/50 active:scale-[0.97] transition-all"
              >
                <Plus className="h-4 w-4" /> Itemizada
              </button>
            </div>

            {quotes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Aún no tienes cotizaciones</p>
              </div>
            ) : (
              quotes
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((q) => {
                  const { total } = calcQuoteTotal(q);
                  const st = STATUS_LABELS[q.status];
                  return (
                    <button
                      key={q.id}
                      onClick={() => setViewQuote(q)}
                      className="w-full text-left rounded-xl bg-card border p-4 hover:bg-secondary/30 active:scale-[0.99] transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{q.clientName || "Sin cliente"}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {q.type === "package" ? q.packageName : "Itemizada"} · {new Date(q.createdAt).toLocaleDateString("es-CL")}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold">{formatCLP(total)}</p>
                          <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 ${st.cls}`}>
                            {st.label}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
            )}
          </div>
        )}

        {/* --- QUOTE DETAIL VIEW --- */}
        {tab === "quotes" && viewQuote && (
          <div className="space-y-4 animate-fade-in-up">
            <button onClick={() => setViewQuote(null)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              ← Volver
            </button>
            <div className="rounded-xl bg-card border p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold">{viewQuote.clientName || "Sin cliente"}</p>
                  {viewQuote.clientEmail && <p className="text-xs text-muted-foreground">{viewQuote.clientEmail}</p>}
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_LABELS[viewQuote.status].cls}`}>
                  {STATUS_LABELS[viewQuote.status].label}
                </span>
              </div>

              {viewQuote.type === "package" && viewQuote.packageName && (
                <div className="rounded-lg bg-accent/5 border border-accent/20 p-3">
                  <p className="text-xs font-semibold text-accent">{viewQuote.packageName}</p>
                  <p className="text-sm font-bold mt-1">{formatCLP(viewQuote.baseRate)}</p>
                </div>
              )}

              {viewQuote.type === "itemized" && viewQuote.baseRate > 0 && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Tarifa base:</span>{" "}
                  <span className="font-semibold">{formatCLP(viewQuote.baseRate)}</span>
                </div>
              )}

              {viewQuote.extras.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Extras</p>
                  {viewQuote.extras.map((e, i) => (
                    <div key={i} className="flex justify-between text-sm py-1">
                      <span>{e.name} ×{e.quantity}</span>
                      <span className="font-medium">{formatCLP(e.price * e.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}

              {viewQuote.items.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Items</p>
                  {viewQuote.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm py-1">
                      <span>{item.description} ×{item.quantity}</span>
                      <span className="font-medium">{formatCLP(item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-3">
                {(() => {
                  const { subtotal, discountAmount, total } = calcQuoteTotal(viewQuote);
                  return (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCLP(subtotal)}</span>
                      </div>
                      {viewQuote.discount > 0 && (
                        <div className="flex justify-between text-sm text-accent">
                          <span>Descuento ({viewQuote.discount}%)</span>
                          <span>-{formatCLP(discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold mt-1">
                        <span>Total</span>
                        <span className="text-accent">{formatCLP(total)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>

              {viewQuote.notes && (
                <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">{viewQuote.notes}</div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => generateQuotePDF(viewQuote, branding)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-accent text-accent-foreground py-2.5 text-xs font-medium hover:bg-accent/90 active:scale-[0.97] transition-all"
                >
                  <Download className="h-3.5 w-3.5" /> Descargar PDF
                </button>
                <select
                  value={viewQuote.status}
                  onChange={(e) => {
                    updateQuote(viewQuote.id, { status: e.target.value as any });
                    setViewQuote({ ...viewQuote, status: e.target.value as any });
                  }}
                  className="rounded-lg border bg-background px-3 py-2 text-xs"
                >
                  <option value="draft">Borrador</option>
                  <option value="sent">Enviada</option>
                  <option value="accepted">Aceptada</option>
                  <option value="rejected">Rechazada</option>
                </select>
                <button
                  onClick={() => {
                    deleteQuote(viewQuote.id);
                    setViewQuote(null);
                  }}
                  className="rounded-lg border px-3 py-2 text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- NEW QUOTE FORM --- */}
        {tab === "quotes" && quoteMode && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                {quoteMode === "new-package" ? "Cotización desde paquete" : "Cotización itemizada"}
              </h2>
              <button onClick={resetQuoteForm} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Client */}
            <div className="rounded-xl bg-card border p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cliente</p>
              {clients.length > 0 && (
                <select
                  value={clientId}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar cliente...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Nombre" value={clientName} onChange={(e) => setClientName(e.target.value)} className="rounded-lg border bg-background px-3 py-2 text-sm" />
                <input placeholder="Email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="rounded-lg border bg-background px-3 py-2 text-sm" />
              </div>
            </div>

            {/* Package selection */}
            {quoteMode === "new-package" && (
              <div className="rounded-xl bg-card border p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Paquete</p>
                <div className="space-y-2">
                  {packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelPkgId(pkg.id)}
                      className={`w-full text-left rounded-lg border p-3 transition-all ${
                        selPkgId === pkg.id ? "border-accent bg-accent/5" : "hover:bg-secondary/30"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold">{pkg.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{pkg.description}</p>
                        </div>
                        <span className="text-sm font-bold text-accent">{formatCLP(pkg.basePrice)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {pkg.includes.map((inc, i) => (
                          <span key={i} className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{inc}</span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Base rate for itemized */}
            {quoteMode === "new-itemized" && (
              <div className="rounded-xl bg-card border p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tarifa base</p>
                <input
                  type="number"
                  placeholder="Ej: 30000"
                  value={baseRate}
                  onChange={(e) => setBaseRate(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono"
                />
              </div>
            )}

            {/* Custom items for itemized */}
            {quoteMode === "new-itemized" && (
              <div className="rounded-xl bg-card border p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Items</p>
                  <button onClick={addCustomItem} className="text-xs text-accent font-medium flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Agregar
                  </button>
                </div>
                {customItems.map((item) => (
                  <div key={item.id} className="flex gap-2 items-start">
                    <input
                      placeholder="Descripción"
                      value={item.description}
                      onChange={(e) => updateCustomItem(item.id, { description: e.target.value })}
                      className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Cant."
                      value={item.quantity || ""}
                      onChange={(e) => updateCustomItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                      className="w-16 rounded-lg border bg-background px-2 py-2 text-sm font-mono text-center"
                    />
                    <input
                      type="number"
                      placeholder="Precio"
                      value={item.unitPrice || ""}
                      onChange={(e) => updateCustomItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                      className="w-24 rounded-lg border bg-background px-2 py-2 text-sm font-mono text-right"
                    />
                    <button onClick={() => setCustomItems((prev) => prev.filter((i) => i.id !== item.id))} className="text-destructive p-2">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Extras */}
            <div className="rounded-xl bg-card border p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Extras opcionales</p>
              <div className="space-y-2">
                {extras.map((extra) => {
                  const selected = selectedExtras.find((e) => e.extraId === extra.id);
                  return (
                    <button
                      key={extra.id}
                      onClick={() => toggleExtra(extra)}
                      className={`w-full text-left rounded-lg border p-3 flex justify-between items-center transition-all ${
                        selected ? "border-accent bg-accent/5" : "hover:bg-secondary/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`h-4 w-4 rounded border flex items-center justify-center ${selected ? "bg-accent border-accent" : ""}`}>
                          {selected && <Check className="h-3 w-3 text-accent-foreground" />}
                        </div>
                        <span className="text-sm">{extra.name}</span>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">{formatCLP(extra.price)}</span>
                    </button>
                  );
                })}
              </div>
              {selectedExtras.length > 0 && (
                <div className="space-y-2 pt-2">
                  {selectedExtras.map((se) => (
                    <div key={se.extraId} className="flex items-center gap-2 text-xs">
                      <span className="flex-1 text-muted-foreground">{se.name}</span>
                      <span className="text-muted-foreground">×</span>
                      <input
                        type="number"
                        min="1"
                        value={se.quantity}
                        onChange={(e) =>
                          setSelectedExtras((prev) =>
                            prev.map((ex) => (ex.extraId === se.extraId ? { ...ex, quantity: parseInt(e.target.value) || 1 } : ex))
                          )
                        }
                        className="w-12 rounded border bg-background px-2 py-1 text-center text-xs font-mono"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Discount + Notes */}
            <div className="rounded-xl bg-card border p-4 space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">Descuento (%)</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono mt-1"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Notas</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm mt-1 resize-none"
                  placeholder="Condiciones, detalles..."
                />
              </div>
            </div>

            {/* Preview total & Save */}
            {(() => {
              const pkg = packages.find((p) => p.id === selPkgId);
              const preview: PhotoQuote = {
                id: "",
                clientName,
                clientEmail,
                type: quoteMode === "new-package" ? "package" : "itemized",
                baseRate: quoteMode === "new-package" ? (pkg?.basePrice || 0) : (parseFloat(baseRate) || 0),
                extras: selectedExtras,
                items: customItems,
                discount: parseFloat(discount) || 0,
                notes,
                status: "draft",
                createdAt: 0,
              };
              const { total } = calcQuoteTotal(preview);
              return (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Total estimado</p>
                    <p className="text-xl font-bold text-accent">{formatCLP(total)}</p>
                  </div>
                  <button
                    onClick={handleSaveQuote}
                    disabled={quoteMode === "new-package" ? !selPkgId : !baseRate}
                    className="rounded-xl bg-accent text-accent-foreground px-6 py-3 text-sm font-medium hover:bg-accent/90 active:scale-[0.97] transition-all disabled:opacity-40"
                  >
                    Guardar cotización
                  </button>
                </div>
              );
            })()}
          </div>
        )}

        {/* --- PACKAGES TAB --- */}
        {tab === "packages" && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Paquetes predefinidos</h2>
              <button
                onClick={() => setShowPkgForm(true)}
                className="text-xs text-accent font-medium flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Nuevo
              </button>
            </div>

            {showPkgForm && (
              <div className="rounded-xl bg-card border p-4 space-y-3">
                <input placeholder="Nombre del paquete" value={pkgName} onChange={(e) => setPkgName(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                <input placeholder="Descripción" value={pkgDesc} onChange={(e) => setPkgDesc(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                <input type="number" placeholder="Precio base" value={pkgPrice} onChange={(e) => setPkgPrice(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono" />
                <textarea placeholder="Qué incluye (uno por línea)" value={pkgIncludes} onChange={(e) => setPkgIncludes(e.target.value)} rows={3} className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none" />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (pkgName && pkgPrice) {
                        addPackage({
                          name: pkgName,
                          description: pkgDesc,
                          basePrice: parseFloat(pkgPrice) || 0,
                          includes: pkgIncludes.split("\n").filter(Boolean),
                        });
                        setPkgName("");
                        setPkgDesc("");
                        setPkgPrice("");
                        setPkgIncludes("");
                        setShowPkgForm(false);
                      }
                    }}
                    className="flex-1 rounded-lg bg-accent text-accent-foreground py-2 text-xs font-medium"
                  >
                    Guardar
                  </button>
                  <button onClick={() => setShowPkgForm(false)} className="rounded-lg border px-4 py-2 text-xs">
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {packages.map((pkg) => (
              <div key={pkg.id} className="rounded-xl bg-card border p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold">{pkg.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{pkg.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-accent">{formatCLP(pkg.basePrice)}</span>
                    <button onClick={() => deletePackage(pkg.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {pkg.includes.map((inc, i) => (
                    <span key={i} className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{inc}</span>
                  ))}
                </div>
              </div>
            ))}

            {/* Extras section */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold">Servicios extras</h2>
                <button
                  onClick={() => setShowExtraForm(true)}
                  className="text-xs text-accent font-medium flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Nuevo
                </button>
              </div>

              {showExtraForm && (
                <div className="rounded-xl bg-card border p-4 space-y-3 mb-3">
                  <input placeholder="Nombre del extra" value={extraName} onChange={(e) => setExtraName(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                  <input type="number" placeholder="Precio" value={extraPrice} onChange={(e) => setExtraPrice(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono" />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (extraName && extraPrice) {
                          addExtra({ name: extraName, price: parseFloat(extraPrice) || 0 });
                          setExtraName("");
                          setExtraPrice("");
                          setShowExtraForm(false);
                        }
                      }}
                      className="flex-1 rounded-lg bg-accent text-accent-foreground py-2 text-xs font-medium"
                    >
                      Guardar
                    </button>
                    <button onClick={() => setShowExtraForm(false)} className="rounded-lg border px-4 py-2 text-xs">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {extras.map((extra) => (
                <div key={extra.id} className="flex items-center justify-between rounded-lg border p-3 mb-2">
                  <span className="text-sm">{extra.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">{formatCLP(extra.price)}</span>
                    <button onClick={() => deleteExtra(extra.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- BRANDING TAB --- */}
        {tab === "branding" && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="rounded-xl bg-card border p-4 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Datos del negocio</p>
              <input placeholder="Nombre del negocio" value={branding.businessName} onChange={(e) => updateBranding({ businessName: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              <input placeholder="Slogan / Tagline" value={branding.tagline} onChange={(e) => updateBranding({ tagline: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Teléfono" value={branding.phone} onChange={(e) => updateBranding({ phone: e.target.value })} className="rounded-lg border bg-background px-3 py-2 text-sm" />
                <input placeholder="Email" value={branding.email} onChange={(e) => updateBranding({ email: e.target.value })} className="rounded-lg border bg-background px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Sitio web" value={branding.website} onChange={(e) => updateBranding({ website: e.target.value })} className="rounded-lg border bg-background px-3 py-2 text-sm" />
                <input placeholder="Redes sociales" value={branding.socialMedia} onChange={(e) => updateBranding({ socialMedia: e.target.value })} className="rounded-lg border bg-background px-3 py-2 text-sm" />
              </div>
            </div>

            <div className="rounded-xl bg-card border p-4 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Logo</p>
              <div className="flex items-center gap-4">
                {branding.logoDataUrl ? (
                  <img src={branding.logoDataUrl} alt="Logo" className="h-14 w-auto max-w-[160px] object-contain rounded-lg border p-1" />
                ) : (
                  <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center">
                    <Camera className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex gap-2">
                  <label className="cursor-pointer rounded-lg bg-accent text-accent-foreground px-3 py-2 text-xs font-medium hover:bg-accent/90 transition-colors">
                    Subir logo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => updateBranding({ logoDataUrl: ev.target?.result as string });
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  {branding.logoDataUrl && (
                    <button onClick={() => updateBranding({ logoDataUrl: "" })} className="rounded-lg border px-3 py-2 text-xs text-destructive">
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-card border p-4 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Colores</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Color principal</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) => updateBranding({ primaryColor: e.target.value })}
                      className="h-9 w-9 rounded-lg border cursor-pointer"
                    />
                    <input
                      value={branding.primaryColor}
                      onChange={(e) => updateBranding({ primaryColor: e.target.value })}
                      className="flex-1 rounded-lg border bg-background px-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Color secundario</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.secondaryColor}
                      onChange={(e) => updateBranding({ secondaryColor: e.target.value })}
                      className="h-9 w-9 rounded-lg border cursor-pointer"
                    />
                    <input
                      value={branding.secondaryColor}
                      onChange={(e) => updateBranding({ secondaryColor: e.target.value })}
                      className="flex-1 rounded-lg border bg-background px-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="rounded-xl bg-card border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Vista previa del PDF</p>
              <div className="rounded-lg border bg-background p-4 shadow-inner">
                <div className="flex justify-between items-start pb-3 mb-3" style={{ borderBottom: `2px solid ${branding.primaryColor}` }}>
                  <div>
                    {branding.logoDataUrl ? (
                      <img src={branding.logoDataUrl} alt="" className="h-8 w-auto" />
                    ) : (
                      <p className="text-sm font-bold" style={{ color: branding.primaryColor }}>{branding.businessName || "Tu Negocio"}</p>
                    )}
                    {branding.tagline && <p className="text-[10px] text-muted-foreground">{branding.tagline}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold" style={{ color: branding.secondaryColor }}>COTIZACIÓN</p>
                    <p className="text-[9px] text-muted-foreground">
                      {new Date().toLocaleDateString("es-CL")}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="h-2 bg-muted rounded w-3/4"></div>
                  <div className="h-2 bg-muted rounded w-1/2"></div>
                  <div className="h-2 bg-muted rounded w-2/3"></div>
                </div>
                <div className="mt-3 pt-2 border-t flex justify-end">
                  <p className="text-xs font-bold" style={{ color: branding.primaryColor }}>
                    Total: $000.000
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Photography;

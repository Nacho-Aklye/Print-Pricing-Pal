import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { TrendingUp, TrendingDown, Target, Plus, Trash2, DollarSign, Package, Gift, ChevronDown, ChevronRight, Receipt, ShoppingCart } from "lucide-react";
import { useProjects, useMaterials, useSettings, useFabricatedProjects, useInvestmentGoal, useExpenses, useClients } from "@/lib/hooks";
import type { FabricatedProject, Expense } from "@/lib/types";
import { formatCLP } from "@/lib/types";

type DetailView = { type: "sale"; item: FabricatedProject } | { type: "expense"; item: Expense } | null;

const EXPENSE_CATEGORIES: { value: Expense["category"]; label: string }[] = [
  { value: "filamento", label: "Filamento" },
  { value: "repuesto", label: "Repuesto" },
  { value: "otro", label: "Otro" },
];

const Finances = () => {
  const { projects } = useProjects();
  const { materials, updateMaterial } = useMaterials();
  const { settings } = useSettings();
  const { fabricated, addFabricated, deleteFabricated } = useFabricatedProjects();
  const { goal, setGoal } = useInvestmentGoal();
  const { expenses, addExpense, deleteExpense } = useExpenses();

  const [searchParams, setSearchParams] = useSearchParams();

  const [showAddSale, setShowAddSale] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [isFree, setIsFree] = useState(false);
  const [useFixedPrice, setUseFixedPrice] = useState(false);
  const [fixedPrice, setFixedPrice] = useState("");
  const [goalInput, setGoalInput] = useState(goal > 0 ? String(goal) : "");
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  const [detailView, setDetailView] = useState<DetailView>(null);

  // Expense form
  const [expDesc, setExpDesc] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expCategory, setExpCategory] = useState<Expense["category"]>("filamento");

  // Auto-open from dashboard quick actions
  useEffect(() => {
    const accion = searchParams.get("accion");
    if (accion === "venta") { setShowAddSale(true); setShowAddExpense(false); }
    if (accion === "gasto") { setShowAddExpense(true); setShowAddSale(false); }
    if (accion) setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const calcCostBreakdown = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return { materialCost: 0, electricity: 0, labor: 0, modelCost: 0, total: 0 };
    let materialCost = 0;
    for (const entry of project.materials) {
      const mat = materials.find((m) => m.id === entry.materialId);
      if (mat) materialCost += (entry.weightGrams / 1000) * mat.costPerKg;
    }
    const totalHours = project.printHours + project.printMinutes / 60;
    const electricity = (settings.printerWatts / 1000) * totalHours * settings.electricityCostKwh;
    const labor = totalHours * settings.hourlyRate;
    const modelCost = project.modelCost;
    return { materialCost, electricity, labor, modelCost, total: materialCost + electricity + labor + modelCost };
  };

  const handleAddSale = () => {
    if (!selectedProjectId) return;
    const qty = Math.max(1, parseInt(quantity) || 1);
    const breakdown = calcCostBreakdown(selectedProjectId);
    let finalSalePrice: number;
    let finalCost: number;

    if (isFree) {
      finalSalePrice = 0;
      finalCost = breakdown.total * qty;
    } else if (useFixedPrice) {
      finalSalePrice = (Number(fixedPrice) || 0) * qty;
      finalCost = (breakdown.materialCost + breakdown.electricity + breakdown.modelCost) * qty;
    } else {
      finalSalePrice = (Number(salePrice) || 0) * qty;
      finalCost = breakdown.total * qty;
    }

    // Update material usage
    const project = projects.find((p) => p.id === selectedProjectId);
    if (project) {
      for (const entry of project.materials) {
        const mat = materials.find((m) => m.id === entry.materialId);
        if (mat) {
          updateMaterial(mat.id, { weightUsedG: (mat.weightUsedG ?? 0) + entry.weightGrams * qty });
        }
      }
    }

    addFabricated({
      projectId: selectedProjectId,
      salePrice: finalSalePrice,
      cost: finalCost,
      date: Date.now(),
      isFree,
      useFixedPrice: !isFree && useFixedPrice,
      fixedPrice: useFixedPrice ? Number(fixedPrice) || 0 : 0,
      quantity: qty,
    });

    setSelectedProjectId("");
    setSalePrice("");
    setFixedPrice("");
    setQuantity("1");
    setIsFree(false);
    setUseFixedPrice(false);
    setShowAddSale(false);
  };

  const handleAddExpense = () => {
    if (!expDesc.trim() || !expAmount) return;
    addExpense({ description: expDesc, category: expCategory, amount: Number(expAmount) || 0, date: Date.now() });
    setExpDesc("");
    setExpAmount("");
    setExpCategory("filamento");
    setShowAddExpense(false);
  };

  const totals = useMemo(() => {
    let totalRevenue = 0;
    let totalCost = 0;
    let paidCount = 0;
    let freeCount = 0;
    for (const f of fabricated) {
      totalRevenue += f.salePrice;
      totalCost += f.cost;
      if (f.isFree) freeCount++;
      else paidCount++;
    }
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    return { totalRevenue, totalCost: totalCost + totalExpenses, totalProductionCost: totalCost, totalExpenses, profit: totalRevenue - totalCost - totalExpenses, paidCount, freeCount };
  }, [fabricated, expenses]);

  const goalProgress = goal > 0 ? Math.min((totals.profit / goal) * 100, 100) : 0;

  // Combined timeline
  const timeline = useMemo(() => {
    const sales = fabricated.map((f) => ({ ...f, _type: "sale" as const }));
    const exps = expenses.map((e) => ({ ...e, _type: "expense" as const }));
    return [...sales, ...exps].sort((a, b) => b.date - a.date);
  }, [fabricated, expenses]);

  const selectedBreakdown = selectedProjectId ? calcCostBreakdown(selectedProjectId) : null;

  return (
    <div className="mx-auto max-w-xl px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Finanzas</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-card border p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
            <TrendingUp className="h-3.5 w-3.5" /> Ingresos
          </div>
          <p className="text-sm font-bold text-accent">{formatCLP(totals.totalRevenue)}</p>
        </div>
        <div className="rounded-xl bg-card border p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
            <TrendingDown className="h-3.5 w-3.5" /> Gastos
          </div>
          <p className="text-sm font-bold text-destructive">{formatCLP(totals.totalCost)}</p>
        </div>
        <div className="rounded-xl bg-card border p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
            <DollarSign className="h-3.5 w-3.5" /> Ganancia
          </div>
          <p className={`text-sm font-bold ${totals.profit >= 0 ? "text-accent" : "text-destructive"}`}>
            {formatCLP(totals.profit)}
          </p>
        </div>
      </div>

      {/* Stats */}
      {fabricated.length > 0 && (
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {totals.paidCount} pagados</span>
          <span className="flex items-center gap-1"><Gift className="h-3 w-3" /> {totals.freeCount} gratis</span>
          {totals.totalExpenses > 0 && <span className="flex items-center gap-1"><Receipt className="h-3 w-3" /> {formatCLP(totals.totalExpenses)} en gastos</span>}
        </div>
      )}

      {/* Investment Goal */}
      <div className="rounded-xl bg-card border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <Target className="h-4 w-4 text-accent" /> Meta de inversión
          </div>
          <button onClick={() => setShowGoalEdit(!showGoalEdit)} className="text-xs text-accent hover:underline">
            {goal > 0 ? "Editar" : "Configurar"}
          </button>
        </div>
        {showGoalEdit && (
          <div className="flex gap-2">
            <input type="number" placeholder="Ej: 350000" value={goalInput} onChange={(e) => setGoalInput(e.target.value)} className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm" />
            <button onClick={() => { setGoal(Number(goalInput) || 0); setShowGoalEdit(false); }} className="rounded-lg bg-accent px-3 py-2 text-xs font-medium text-accent-foreground">Guardar</button>
          </div>
        )}
        {goal > 0 && (
          <>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCLP(totals.profit)} de {formatCLP(goal)}</span>
              <span>{goalProgress.toFixed(1)}%</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${goalProgress}%` }} />
            </div>
            {goalProgress >= 100 && <p className="text-xs text-accent font-medium text-center">🎉 ¡Meta alcanzada!</p>}
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button onClick={() => { setShowAddSale(!showAddSale); setShowAddExpense(false); }} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-accent-foreground">
          <Plus className="h-3.5 w-3.5" /> Registrar venta
        </button>
        <button onClick={() => { setShowAddExpense(!showAddExpense); setShowAddSale(false); }} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary/50 transition-colors">
          <ShoppingCart className="h-3.5 w-3.5" /> Registrar gasto
        </button>
      </div>

      {/* Add sale form */}
      {showAddSale && (
        <div className="rounded-xl bg-card border p-4 space-y-3 animate-fade-in-up">
          <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
            <option value="">Seleccionar proyecto...</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          {/* Quantity */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground">Cantidad</label>
            <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-20 rounded-lg border bg-background px-3 py-2 text-sm font-mono text-center" />
          </div>

          {selectedProjectId && selectedBreakdown && (
            <div className="rounded-lg bg-muted/50 p-3 space-y-1 text-xs text-muted-foreground">
              <p className="font-medium text-foreground text-xs mb-1">Costo unitario:</p>
              <div className="flex justify-between"><span>Material</span><span className="font-mono">{formatCLP(selectedBreakdown.materialCost)}</span></div>
              <div className="flex justify-between"><span>Electricidad</span><span className="font-mono">{formatCLP(selectedBreakdown.electricity)}</span></div>
              <div className="flex justify-between"><span>Mano de obra</span><span className="font-mono">{formatCLP(selectedBreakdown.labor)}</span></div>
              {selectedBreakdown.modelCost > 0 && <div className="flex justify-between"><span>Modelo</span><span className="font-mono">{formatCLP(selectedBreakdown.modelCost)}</span></div>}
              <div className="flex justify-between font-semibold text-foreground border-t border-border pt-1 mt-1">
                <span>Total {parseInt(quantity) > 1 ? `(×${quantity})` : ""}</span>
                <span className="font-mono">{formatCLP(selectedBreakdown.total * (parseInt(quantity) || 1))}</span>
              </div>
            </div>
          )}

          {/* Free toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => { setIsFree(!isFree); if (!isFree) setUseFixedPrice(false); }} className={`relative w-10 h-5 rounded-full transition-colors ${isFree ? "bg-accent" : "bg-muted"}`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isFree ? "translate-x-5" : ""}`} />
            </div>
            <div className="flex items-center gap-1.5 text-sm"><Gift className="h-3.5 w-3.5 text-muted-foreground" /> Gratis / Muestra</div>
          </label>

          {!isFree && (
            <>
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setUseFixedPrice(!useFixedPrice)} className={`relative w-10 h-5 rounded-full transition-colors ${useFixedPrice ? "bg-accent" : "bg-muted"}`}>
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${useFixedPrice ? "translate-x-5" : ""}`} />
                </div>
                <span className="text-sm">Precio fijo personalizado</span>
              </label>

              {useFixedPrice ? (
                <input type="number" placeholder="Precio fijo unitario" value={fixedPrice} onChange={(e) => setFixedPrice(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              ) : (
                <input type="number" placeholder="Precio de venta unitario" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              )}
            </>
          )}

          <div className="flex gap-2">
            <button onClick={handleAddSale} disabled={!selectedProjectId || (!isFree && !useFixedPrice && !salePrice) || (!isFree && useFixedPrice && !fixedPrice)} className="flex-1 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-accent-foreground disabled:opacity-50">
              {isFree ? "Registrar muestra" : "Registrar venta"}
            </button>
            <button onClick={() => setShowAddSale(false)} className="rounded-lg border px-3 py-2 text-xs">Cancelar</button>
          </div>
        </div>
      )}

      {/* Add expense form */}
      {showAddExpense && (
        <div className="rounded-xl bg-card border p-4 space-y-3 animate-fade-in-up">
          <h3 className="text-sm font-semibold">Nuevo gasto</h3>
          <input placeholder="Descripción (ej: Rollo PLA+ eSUN)" value={expDesc} onChange={(e) => setExpDesc(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <select value={expCategory} onChange={(e) => setExpCategory(e.target.value as Expense["category"])} className="rounded-lg border bg-background px-3 py-2 text-sm">
              {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <input type="number" placeholder="Monto CLP" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm font-mono" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddExpense} disabled={!expDesc.trim() || !expAmount} className="flex-1 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-accent-foreground disabled:opacity-50">Registrar gasto</button>
            <button onClick={() => setShowAddExpense(false)} className="rounded-lg border px-3 py-2 text-xs">Cancelar</button>
          </div>
        </div>
      )}

      {/* Timeline list */}
      {timeline.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
          Aún no hay registros
        </div>
      ) : (
        <div className="space-y-2">
          {timeline.map((item) => {
            if (item._type === "sale") {
              const f = item as FabricatedProject & { _type: string };
              const project = projects.find((p) => p.id === f.projectId);
              const profit = f.salePrice - f.cost;
              return (
                <button
                  key={`s-${f.id}`}
                  onClick={() => setDetailView({ type: "sale", item: f })}
                  className="w-full text-left rounded-xl bg-card border p-3 flex items-center justify-between hover:bg-secondary/30 transition-colors active:scale-[0.99]"
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-accent shrink-0" />
                      <p className="text-sm font-medium truncate">{project?.name || "Proyecto eliminado"}</p>
                      {(f.quantity ?? 1) > 1 && <span className="text-[9px] font-mono bg-accent/20 text-accent rounded px-1">×{f.quantity}</span>}
                      {f.isFree && <span className="inline-flex items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground"><Gift className="h-2.5 w-2.5" /> Gratis</span>}
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground pl-5">
                      <span>{formatCLP(f.salePrice)}</span>
                      <span className={profit >= 0 ? "text-accent" : "text-destructive"}>{profit >= 0 ? "+" : ""}{formatCLP(profit)}</span>
                      <span>{new Date(f.date).toLocaleDateString("es-CL")}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              );
            } else {
              const e = item as Expense & { _type: string };
              return (
                <button
                  key={`e-${e.id}`}
                  onClick={() => setDetailView({ type: "expense", item: e })}
                  className="w-full text-left rounded-xl bg-card border p-3 flex items-center justify-between hover:bg-secondary/30 transition-colors active:scale-[0.99]"
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-3 w-3 text-destructive shrink-0" />
                      <p className="text-sm font-medium truncate">{e.description}</p>
                      <span className="text-[9px] rounded-full bg-muted px-1.5 py-0.5 text-muted-foreground">{EXPENSE_CATEGORIES.find((c) => c.value === e.category)?.label}</span>
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground pl-5">
                      <span className="text-destructive">-{formatCLP(e.amount)}</span>
                      <span>{new Date(e.date).toLocaleDateString("es-CL")}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              );
            }
          })}
        </div>
      )}

      {/* Detail overlay */}
      {detailView && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-end sm:items-center justify-center" onClick={() => setDetailView(null)}>
          <div className="w-full max-w-lg bg-card rounded-t-2xl sm:rounded-2xl p-5 space-y-4 animate-fade-in-up max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {detailView.type === "sale" ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Detalle de venta</h3>
                  <button onClick={() => setDetailView(null)} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
                </div>
                {(() => {
                  const f = detailView.item as FabricatedProject;
                  const project = projects.find((p) => p.id === f.projectId);
                  const bd = calcCostBreakdown(f.projectId);
                  const qty = f.quantity ?? 1;
                  return (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Proyecto</span><span className="font-medium">{project?.name || "Eliminado"}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Cantidad</span><span className="font-mono">{qty}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Fecha</span><span>{new Date(f.date).toLocaleDateString("es-CL")}</span></div>
                      {f.isFree && <div className="flex justify-between"><span className="text-muted-foreground">Tipo</span><span className="text-accent">Gratis / Muestra</span></div>}
                      {f.useFixedPrice && <div className="flex justify-between"><span className="text-muted-foreground">Precio fijo</span><span className="font-mono">{formatCLP(f.fixedPrice)}/u</span></div>}
                      <div className="border-t pt-3 space-y-1 text-xs">
                        <p className="font-semibold text-sm mb-1">Desglose unitario</p>
                        <div className="flex justify-between"><span>Material</span><span className="font-mono">{formatCLP(bd.materialCost)}</span></div>
                        <div className="flex justify-between"><span>Electricidad</span><span className="font-mono">{formatCLP(bd.electricity)}</span></div>
                        <div className="flex justify-between"><span>Mano de obra</span><span className="font-mono">{formatCLP(bd.labor)}</span></div>
                        {bd.modelCost > 0 && <div className="flex justify-between"><span>Modelo</span><span className="font-mono">{formatCLP(bd.modelCost)}</span></div>}
                      </div>
                      <div className="border-t pt-3 space-y-1">
                        <div className="flex justify-between font-semibold"><span>Venta total</span><span className="text-accent font-mono">{formatCLP(f.salePrice)}</span></div>
                        <div className="flex justify-between font-semibold"><span>Costo total</span><span className="text-destructive font-mono">{formatCLP(f.cost)}</span></div>
                        <div className="flex justify-between font-bold text-base"><span>Ganancia</span><span className={f.salePrice - f.cost >= 0 ? "text-accent" : "text-destructive"}>{formatCLP(f.salePrice - f.cost)}</span></div>
                      </div>
                      <button onClick={() => { deleteFabricated(f.id); setDetailView(null); }} className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-destructive/30 text-destructive py-2 text-xs font-medium hover:bg-destructive/10 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" /> Eliminar registro
                      </button>
                    </div>
                  );
                })()}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Detalle de gasto</h3>
                  <button onClick={() => setDetailView(null)} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
                </div>
                {(() => {
                  const e = detailView.item as Expense;
                  return (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Descripción</span><span className="font-medium">{e.description}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Categoría</span><span>{EXPENSE_CATEGORIES.find((c) => c.value === e.category)?.label}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Monto</span><span className="font-mono font-bold text-destructive">{formatCLP(e.amount)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Fecha</span><span>{new Date(e.date).toLocaleDateString("es-CL")}</span></div>
                      <button onClick={() => { deleteExpense(e.id); setDetailView(null); }} className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-destructive/30 text-destructive py-2 text-xs font-medium hover:bg-destructive/10 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" /> Eliminar registro
                      </button>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Finances;

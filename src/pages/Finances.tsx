import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Target, Plus, Trash2, DollarSign, Package, Gift } from "lucide-react";
import { useProjects, useMaterials, useSettings, useFabricatedProjects, useInvestmentGoal } from "@/lib/hooks";
import type { FabricatedProject } from "@/lib/types";
import { formatCLP } from "@/lib/types";

const Finances = () => {
  const { projects } = useProjects();
  const { materials, updateMaterial } = useMaterials();
  const { settings } = useSettings();
  const { fabricated, addFabricated, deleteFabricated } = useFabricatedProjects();
  const { goal, setGoal } = useInvestmentGoal();

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [useFixedPrice, setUseFixedPrice] = useState(false);
  const [fixedPrice, setFixedPrice] = useState("");
  const [goalInput, setGoalInput] = useState(goal > 0 ? String(goal) : "");
  const [showGoalEdit, setShowGoalEdit] = useState(false);

  // Calculate cost breakdown for a project
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

    return {
      materialCost,
      electricity,
      labor,
      modelCost,
      total: materialCost + electricity + labor + modelCost,
    };
  };

  // When using fixed price, recalculate the breakdown keeping fixed costs constant
  const getAdjustedBreakdown = (projectId: string, targetPrice: number) => {
    const bd = calcCostBreakdown(projectId);
    // Fixed costs: material, electricity, modelCost
    const fixedCosts = bd.materialCost + bd.electricity + bd.modelCost;
    // Remaining goes to labor + margin
    const remaining = targetPrice - fixedCosts;
    return {
      ...bd,
      labor: Math.max(0, remaining * 0.4), // 40% labor
      margin: Math.max(0, remaining * 0.6), // 60% margin
      fixedCosts,
      adjustedTotal: targetPrice,
    };
  };

  const handleAdd = () => {
    if (!selectedProjectId) return;

    const breakdown = calcCostBreakdown(selectedProjectId);
    let finalSalePrice: number;
    let finalCost: number;

    if (isFree) {
      finalSalePrice = 0;
      finalCost = breakdown.total;
    } else if (useFixedPrice) {
      finalSalePrice = Number(fixedPrice) || 0;
      finalCost = breakdown.materialCost + breakdown.electricity + breakdown.modelCost;
    } else {
      finalSalePrice = Number(salePrice) || 0;
      finalCost = breakdown.total;
    }

    // Update material usage tracking
    const project = projects.find((p) => p.id === selectedProjectId);
    if (project) {
      for (const entry of project.materials) {
        const mat = materials.find((m) => m.id === entry.materialId);
        if (mat) {
          updateMaterial(mat.id, {
            weightUsedG: (mat.weightUsedG ?? 0) + entry.weightGrams,
          });
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
    });

    setSelectedProjectId("");
    setSalePrice("");
    setFixedPrice("");
    setIsFree(false);
    setUseFixedPrice(false);
    setShowAddForm(false);
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
    return { totalRevenue, totalCost, profit: totalRevenue - totalCost, paidCount, freeCount };
  }, [fabricated]);

  const goalProgress = goal > 0 ? Math.min((totals.profit / goal) * 100, 100) : 0;

  const sorted = [...fabricated].sort((a, b) => b.date - a.date);

  const selectedBreakdown = selectedProjectId ? calcCostBreakdown(selectedProjectId) : null;
  const adjustedBreakdown = selectedProjectId && useFixedPrice && fixedPrice
    ? getAdjustedBreakdown(selectedProjectId, Number(fixedPrice))
    : null;

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
            <TrendingDown className="h-3.5 w-3.5" /> Costos
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

      {/* Paid vs Free summary */}
      {fabricated.length > 0 && (
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {totals.paidCount} pagados</span>
          <span className="flex items-center gap-1"><Gift className="h-3 w-3" /> {totals.freeCount} gratis/muestras</span>
        </div>
      )}

      {/* Investment Goal */}
      <div className="rounded-xl bg-card border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <Target className="h-4 w-4 text-accent" /> Meta de inversión
          </div>
          <button
            onClick={() => setShowGoalEdit(!showGoalEdit)}
            className="text-xs text-accent hover:underline"
          >
            {goal > 0 ? "Editar" : "Configurar"}
          </button>
        </div>

        {showGoalEdit && (
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Ej: 350000"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
            />
            <button
              onClick={() => {
                setGoal(Number(goalInput) || 0);
                setShowGoalEdit(false);
              }}
              className="rounded-lg bg-accent px-3 py-2 text-xs font-medium text-accent-foreground"
            >
              Guardar
            </button>
          </div>
        )}

        {goal > 0 && (
          <>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCLP(totals.profit)} de {formatCLP(goal)}</span>
              <span>{goalProgress.toFixed(1)}%</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
            {goalProgress >= 100 && (
              <p className="text-xs text-accent font-medium text-center">🎉 ¡Meta alcanzada!</p>
            )}
          </>
        )}
      </div>

      {/* Add fabricated project */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">Proyectos fabricados</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar
          </button>
        </div>

        {showAddForm && (
          <div className="rounded-xl bg-card border p-4 space-y-3">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="">Seleccionar proyecto...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            {selectedProjectId && selectedBreakdown && (
              <div className="rounded-lg bg-muted/50 p-3 space-y-1 text-xs text-muted-foreground">
                <p className="font-medium text-foreground text-xs mb-1">Desglose de costo:</p>
                <div className="flex justify-between"><span>Material</span><span className="font-mono">{formatCLP(selectedBreakdown.materialCost)}</span></div>
                <div className="flex justify-between"><span>Electricidad</span><span className="font-mono">{formatCLP(selectedBreakdown.electricity)}</span></div>
                <div className="flex justify-between"><span>Mano de obra</span><span className="font-mono">{formatCLP(selectedBreakdown.labor)}</span></div>
                {selectedBreakdown.modelCost > 0 && (
                  <div className="flex justify-between"><span>Modelo</span><span className="font-mono">{formatCLP(selectedBreakdown.modelCost)}</span></div>
                )}
                <div className="flex justify-between font-semibold text-foreground border-t border-border pt-1 mt-1">
                  <span>Total costo</span><span className="font-mono">{formatCLP(selectedBreakdown.total)}</span>
                </div>
              </div>
            )}

            {/* Free toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => { setIsFree(!isFree); if (!isFree) setUseFixedPrice(false); }}
                className={`relative w-10 h-5 rounded-full transition-colors ${isFree ? "bg-accent" : "bg-muted"}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isFree ? "translate-x-5" : ""}`} />
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Gift className="h-3.5 w-3.5 text-muted-foreground" />
                Gratis / Muestra
              </div>
            </label>

            {!isFree && (
              <>
                {/* Fixed price toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setUseFixedPrice(!useFixedPrice)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${useFixedPrice ? "bg-accent" : "bg-muted"}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${useFixedPrice ? "translate-x-5" : ""}`} />
                  </div>
                  <span className="text-sm">Precio fijo personalizado</span>
                </label>

                {useFixedPrice ? (
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Precio fijo de venta"
                      value={fixedPrice}
                      onChange={(e) => setFixedPrice(e.target.value)}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                    {adjustedBreakdown && (
                      <div className="rounded-lg bg-muted/50 p-3 space-y-1 text-xs text-muted-foreground">
                        <p className="font-medium text-foreground text-xs mb-1">Desglose ajustado:</p>
                        <div className="flex justify-between"><span>Material (fijo)</span><span className="font-mono">{formatCLP(adjustedBreakdown.materialCost)}</span></div>
                        <div className="flex justify-between"><span>Electricidad (fijo)</span><span className="font-mono">{formatCLP(adjustedBreakdown.electricity)}</span></div>
                        {adjustedBreakdown.modelCost > 0 && (
                          <div className="flex justify-between"><span>Modelo (fijo)</span><span className="font-mono">{formatCLP(adjustedBreakdown.modelCost)}</span></div>
                        )}
                        <div className="flex justify-between"><span>Mano de obra (ajust.)</span><span className="font-mono">{formatCLP(adjustedBreakdown.labor)}</span></div>
                        <div className="flex justify-between"><span>Margen (ajust.)</span><span className="font-mono">{formatCLP(adjustedBreakdown.margin)}</span></div>
                        <div className="flex justify-between font-semibold text-foreground border-t border-border pt-1 mt-1">
                          <span>Precio final</span><span className="font-mono">{formatCLP(adjustedBreakdown.adjustedTotal)}</span>
                        </div>
                        {Number(fixedPrice) < adjustedBreakdown.fixedCosts && (
                          <p className="text-destructive font-medium mt-1">⚠️ El precio no cubre los costos fijos</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="number"
                    placeholder="Precio de venta"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                )}
              </>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={!selectedProjectId || (!isFree && !useFixedPrice && !salePrice) || (!isFree && useFixedPrice && !fixedPrice)}
                className="flex-1 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-accent-foreground disabled:opacity-50"
              >
                {isFree ? "Registrar muestra" : "Registrar venta"}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="rounded-lg border px-3 py-2 text-xs"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fabricated list */}
      {sorted.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
          Aún no has registrado proyectos fabricados
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((f) => {
            const project = projects.find((p) => p.id === f.projectId);
            const profit = f.salePrice - f.cost;
            return (
              <div key={f.id} className="rounded-xl bg-card border p-3 flex items-center justify-between">
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{project?.name || "Proyecto eliminado"}</p>
                    {f.isFree && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                        <Gift className="h-2.5 w-2.5" /> Gratis
                      </span>
                    )}
                    {f.useFixedPrice && !f.isFree && (
                      <span className="inline-flex rounded-full bg-accent/20 px-1.5 py-0.5 text-[9px] font-medium text-accent">
                        Precio fijo
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>Venta: {formatCLP(f.salePrice)}</span>
                    <span>Costo: {formatCLP(f.cost)}</span>
                    <span className={profit >= 0 ? "text-accent" : "text-destructive"}>
                      {profit >= 0 ? "+" : ""}{formatCLP(profit)}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(f.date).toLocaleDateString("es-CL")}
                  </p>
                </div>
                <button
                  onClick={() => deleteFabricated(f.id)}
                  className="p-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Finances;

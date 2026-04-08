import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, TrendingDown, DollarSign, Target, Plus,
  Calculator, ShoppingCart, AlertTriangle, Printer, Camera,
  ChevronRight, Package, Gift, Receipt, Settings, Users,
  BarChart3, Percent
} from "lucide-react";
import { useMaterials, useProjects, useFabricatedProjects, useInvestmentGoal, useExpenses, useSettings, useClients } from "@/lib/hooks";
import type { FabricatedProject, Expense } from "@/lib/types";
import { formatCLP } from "@/lib/types";
import { PeriodFilter, filterByPeriod, type Period } from "@/components/PeriodFilter";
import { EvolutionChart, ProfitLineChart, ExpenseBreakdownChart } from "@/components/FinanceCharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const { materials } = useMaterials();
  const { projects } = useProjects();
  const { fabricated } = useFabricatedProjects();
  const { expenses } = useExpenses();
  const { goal } = useInvestmentGoal();
  const { settings } = useSettings();
  const { clients } = useClients();
  const [period, setPeriod] = useState<Period>("month");
  const [showCharts, setShowCharts] = useState(true);

  const filteredFabricated = useMemo(() => filterByPeriod(fabricated, period), [fabricated, period]);
  const filteredExpenses = useMemo(() => filterByPeriod(expenses, period), [expenses, period]);

  const totals = useMemo(() => {
    let totalRevenue = 0;
    let totalCost = 0;
    let paidCount = 0;
    let freeCount = 0;
    for (const f of filteredFabricated) {
      totalRevenue += f.salePrice;
      totalCost += f.cost;
      if (f.isFree) freeCount++;
      else paidCount++;
    }
    const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
    const profit = totalRevenue - totalCost - totalExpenses;
    const totalInvested = totalCost + totalExpenses;
    const roi = totalInvested > 0 ? ((totalRevenue - totalInvested) / totalInvested) * 100 : 0;
    return { totalRevenue, totalCost: totalInvested, profit, paidCount, freeCount, totalExpenses, roi };
  }, [filteredFabricated, filteredExpenses]);

  const goalProgress = goal > 0 ? Math.min((totals.profit / goal) * 100, 100) : 0;

  const lowStockMaterials = useMemo(() => {
    return materials.filter((mat) => {
      const totalCapacity = (mat.spoolWeightG ?? 1000) * (mat.spoolCount ?? 1);
      const remaining = totalCapacity - (mat.weightUsedG ?? 0);
      return remaining / totalCapacity < 0.2 && totalCapacity > 0;
    });
  }, [materials]);

  const recentActivity = useMemo(() => {
    const sales = filteredFabricated.map((f) => ({ ...f, _type: "sale" as const }));
    const exps = filteredExpenses.map((e) => ({ ...e, _type: "expense" as const }));
    return [...sales, ...exps].sort((a, b) => b.date - a.date).slice(0, 5);
  }, [filteredFabricated, filteredExpenses]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 19) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  return (
    <div className="min-h-screen px-4 py-6 md:py-12">
      <div className="mx-auto max-w-xl space-y-5">
        {/* Header */}
        <div className="animate-fade-in-up flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{greeting} 👋</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <button onClick={() => navigate("/ajustes")} className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
            <Settings className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Period filter */}
        <div className="animate-fade-in-up flex items-center justify-between" style={{ animationDelay: "40ms" }}>
          <PeriodFilter value={period} onChange={setPeriod} />
          <button
            onClick={() => setShowCharts(!showCharts)}
            className={`p-1.5 rounded-lg transition-colors ${showCharts ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-foreground"}`}
          >
            <BarChart3 className="h-4 w-4" />
          </button>
        </div>

        {/* Financial summary */}
        <div className="grid grid-cols-3 gap-2.5 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <SummaryCard icon={TrendingUp} label="Ingresos" value={formatCLP(totals.totalRevenue)} color="text-accent" />
          <SummaryCard icon={TrendingDown} label="Gastos" value={formatCLP(totals.totalCost)} color="text-destructive" />
          <SummaryCard icon={DollarSign} label="Ganancia" value={formatCLP(totals.profit)} color={totals.profit >= 0 ? "text-accent" : "text-destructive"} />
        </div>

        {/* ROI indicator */}
        {(filteredFabricated.length > 0 || filteredExpenses.length > 0) && (
          <div className="flex gap-2.5 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
            <div className="flex-1 rounded-xl bg-card border p-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Percent className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">ROI</p>
                <p className={`text-sm font-bold font-mono ${totals.roi >= 0 ? "text-accent" : "text-destructive"}`}>
                  {totals.roi.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="flex-1 rounded-xl bg-card border p-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Package className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Ventas</p>
                <p className="text-sm font-bold font-mono">{totals.paidCount} <span className="text-muted-foreground text-[10px] font-normal">+ {totals.freeCount} gratis</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Charts section */}
        {showCharts && (fabricated.length > 0 || expenses.length > 0) && (
          <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <EvolutionChart fabricated={filteredFabricated} expenses={filteredExpenses} />
            <ProfitLineChart fabricated={filteredFabricated} expenses={filteredExpenses} />
            <ExpenseBreakdownChart expenses={filteredExpenses} />
          </div>
        )}

        {/* Investment goal */}
        {goal > 0 && (
          <div className="rounded-xl bg-card border p-4 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-accent" />
              <span className="text-xs font-semibold">Meta de inversión</span>
              <span className="ml-auto text-xs text-muted-foreground font-mono">{goalProgress.toFixed(0)}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-accent/70 transition-all duration-700"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground font-mono">
              <span>{formatCLP(totals.profit)}</span>
              <span>{formatCLP(goal)}</span>
            </div>
            {goalProgress >= 100 && (
              <p className="text-xs text-accent font-medium text-center mt-2">🎉 ¡Meta alcanzada!</p>
            )}
          </div>
        )}

        {/* Quick actions */}
        <div className="animate-fade-in-up" style={{ animationDelay: "140ms" }}>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">Acciones rápidas</h2>
          <div className="grid grid-cols-2 gap-2">
            <QuickAction icon={Calculator} label="Calcular proyecto" onClick={() => navigate("/3d")} />
            <QuickAction icon={Plus} label="Registrar venta" onClick={() => navigate("/finanzas?accion=venta")} />
            <QuickAction icon={ShoppingCart} label="Registrar gasto" onClick={() => navigate("/finanzas?accion=gasto")} />
            <QuickAction icon={Camera} label="Fotografía" onClick={() => navigate("/foto")} />
          </div>
        </div>

        {/* Low stock alerts */}
        {lowStockMaterials.length > 0 && (
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 animate-fade-in-up" style={{ animationDelay: "180ms" }}>
            <div className="flex items-center gap-2 mb-2.5">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-xs font-semibold">Stock bajo</span>
            </div>
            <div className="space-y-1.5">
              {lowStockMaterials.map((mat) => {
                const remaining = Math.max(0, (mat.spoolWeightG ?? 1000) * (mat.spoolCount ?? 1) - (mat.weightUsedG ?? 0));
                return (
                  <div key={mat.id} className="flex items-center justify-between text-xs">
                    <span className="font-medium">{mat.name} <span className="text-muted-foreground">({mat.brand})</span></span>
                    <span className="font-mono text-warning">{remaining}g</span>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => navigate("/3d/materiales")}
              className="mt-2.5 text-[11px] text-accent hover:underline flex items-center gap-1"
            >
              Ver materiales <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Stats row */}
        {(fabricated.length > 0 || expenses.length > 0) && (
          <div className="flex gap-3 text-[11px] text-muted-foreground flex-wrap animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {projects.length} proyectos</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {clients.length} clientes</span>
            {totals.totalExpenses > 0 && (
              <span className="flex items-center gap-1"><Receipt className="h-3 w-3" /> {formatCLP(totals.totalExpenses)} gastos</span>
            )}
          </div>
        )}

        {/* Recent activity */}
        {recentActivity.length > 0 && (
          <div className="animate-fade-in-up" style={{ animationDelay: "220ms" }}>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actividad reciente</h2>
              <button onClick={() => navigate("/finanzas")} className="text-[11px] text-accent hover:underline flex items-center gap-0.5">
                Ver todo <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-1.5">
              {recentActivity.map((item) => {
                if (item._type === "sale") {
                  const f = item as FabricatedProject & { _type: string };
                  const project = projects.find((p) => p.id === f.projectId);
                  return (
                    <div key={`s-${f.id}`} className="flex items-center gap-3 rounded-lg bg-card border px-3 py-2.5">
                      <div className="h-7 w-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        <TrendingUp className="h-3.5 w-3.5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{project?.name || "Eliminado"}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(f.date).toLocaleDateString("es-CL")}</p>
                      </div>
                      <span className="text-xs font-mono font-medium text-accent">{f.isFree ? "Gratis" : `+${formatCLP(f.salePrice)}`}</span>
                    </div>
                  );
                } else {
                  const e = item as Expense & { _type: string };
                  return (
                    <div key={`e-${e.id}`} className="flex items-center gap-3 rounded-lg bg-card border px-3 py-2.5">
                      <div className="h-7 w-7 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                        <ShoppingCart className="h-3.5 w-3.5 text-destructive" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{e.description}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(e.date).toLocaleDateString("es-CL")}</p>
                      </div>
                      <span className="text-xs font-mono font-medium text-destructive">-{formatCLP(e.amount)}</span>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {fabricated.length === 0 && expenses.length === 0 && (
          <div className="rounded-xl border-2 border-dashed py-10 text-center animate-fade-in-up" style={{ animationDelay: "160ms" }}>
            <Printer className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-medium">¡Empieza a registrar!</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Calcula un proyecto, regístralo y lleva tus finanzas al día.</p>
            <button
              onClick={() => navigate("/3d")}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-accent text-accent-foreground px-4 py-2 text-xs font-medium hover:bg-accent/90 active:scale-[0.97] transition-all"
            >
              <Calculator className="h-3.5 w-3.5" /> Ir a calcular
            </button>
          </div>
        )}

        {/* Modules */}
        <div className="animate-fade-in-up" style={{ animationDelay: "260ms" }}>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">Módulos</h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => navigate("/3d")}
              className="rounded-xl bg-card border p-4 text-left hover:bg-secondary/30 transition-colors active:scale-[0.98] group"
            >
              <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center mb-2.5 group-hover:bg-accent/20 transition-colors">
                <Printer className="h-4.5 w-4.5 text-accent" />
              </div>
              <p className="text-sm font-semibold">Impresión 3D</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{projects.length} proyectos · {materials.length} materiales</p>
            </button>
            <button
              onClick={() => navigate("/foto")}
              className="rounded-xl bg-card border p-4 text-left hover:bg-secondary/30 transition-colors active:scale-[0.98] group"
            >
              <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center mb-2.5 group-hover:bg-accent/20 transition-colors">
                <Camera className="h-4.5 w-4.5 text-accent" />
              </div>
              <p className="text-sm font-semibold">Fotografía</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Cotizaciones y paquetes</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) => (
  <div className="rounded-xl bg-card border p-3 space-y-1.5">
    <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-medium uppercase tracking-wider">
      <Icon className="h-3 w-3" /> {label}
    </div>
    <p className={`text-sm font-bold font-mono ${color}`}>{value}</p>
  </div>
);

const QuickAction = ({ icon: Icon, label, onClick, badge }: { icon: any; label: string; onClick: () => void; badge?: string }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2.5 rounded-xl bg-card border px-3.5 py-3 text-left hover:bg-secondary/30 transition-colors active:scale-[0.97] group"
  >
    <Icon className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
    <span className="text-xs font-medium flex-1">{label}</span>
    {badge && <span className="text-[8px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{badge}</span>}
  </button>
);

export default Dashboard;

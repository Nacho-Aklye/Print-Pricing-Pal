import { useMemo, useState } from "react";
import { Printer, Zap, Clock, Calculator, TrendingUp, Info } from "lucide-react";
import { useMaterials, useRecipes, useSettings } from "@/lib/hooks";
import type { MaterialEntry, Recipe, CostBreakdown } from "@/lib/types";
import { formatCLP } from "@/lib/types";
import { MaterialManager } from "@/components/MaterialManager";
import { MaterialSelector } from "@/components/MaterialSelector";
import { RecipeBook } from "@/components/RecipeBook";

const MARGIN_TIPS = [
  { range: "20–30%", label: "Básico", desc: "Cubre desgaste y algo de ganancia. Para amigos/familia." },
  { range: "35–50%", label: "Recomendado", desc: "Margen justo para hobby. Cubre tu tiempo real y desgaste." },
  { range: "50–80%", label: "Competitivo", desc: "Para piezas con diseño propio, detalle o acabado especial." },
  { range: "80–150%+", label: "Premium", desc: "Diseños exclusivos, piezas artísticas o urgencia." },
];

const Index = () => {
  const { materials, addMaterial, updateMaterial, deleteMaterial } = useMaterials();
  const { recipes, addRecipe, deleteRecipe } = useRecipes();
  const { settings, updateSetting } = useSettings();

  const [entries, setEntries] = useState<MaterialEntry[]>([]);
  const [printHours, setPrintHours] = useState("");
  const [printMinutes, setPrintMinutes] = useState("");
  const [showMaterials, setShowMaterials] = useState(false);
  const [showMarginTips, setShowMarginTips] = useState(false);

  const costs: CostBreakdown = useMemo(() => {
    const hours = (parseFloat(printHours) || 0) + (parseFloat(printMinutes) || 0) / 60;

    const materialCosts = entries
      .filter((e) => e.weightGrams > 0)
      .map((e) => {
        const mat = materials.find((m) => m.id === e.materialId);
        return {
          name: mat?.name || "?",
          cost: mat ? (e.weightGrams / 1000) * mat.costPerKg : 0,
        };
      });

    const totalMaterial = materialCosts.reduce((s, c) => s + c.cost, 0);
    const electricity = (settings.printerWatts / 1000) * hours * settings.electricityCostKwh;
    const labor = hours * settings.hourlyRate;
    const subtotal = totalMaterial + electricity + labor;
    const margin = subtotal * (settings.marginPercent / 100);
    const total = subtotal + margin;

    return { materialCosts, totalMaterial, electricity, labor, subtotal, margin, marginPercent: settings.marginPercent, total };
  }, [entries, printHours, printMinutes, materials, settings]);

  const hasInput = entries.some((e) => e.weightGrams > 0) || parseFloat(printHours) > 0 || parseFloat(printMinutes) > 0;

  const loadRecipe = (recipe: Recipe) => {
    setEntries(recipe.materials);
    setPrintHours(recipe.printHours ? String(recipe.printHours) : "");
    setPrintMinutes(recipe.printMinutes ? String(recipe.printMinutes) : "");
  };

  return (
    <div className="min-h-screen px-4 py-8 md:py-16">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Printer className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight leading-none">Calculadora 3D</h1>
              <span className="text-[10px] text-muted-foreground font-mono">Bambu Lab P1S + AMS</span>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">
            Costea impresiones multicolor de forma rápida. Guarda recetas para trabajos recurrentes.
          </p>
        </div>

        {/* Material manager toggle */}
        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <button
            onClick={() => setShowMaterials(!showMaterials)}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            {showMaterials ? "Ocultar" : "Gestionar"} materiales ({materials.length})
          </button>
          {showMaterials && (
            <div className="mt-3 animate-fade-in-up">
              <MaterialManager materials={materials} onAdd={addMaterial} onUpdate={updateMaterial} onDelete={deleteMaterial} />
            </div>
          )}
        </div>

        {/* Recipe Book */}
        <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <RecipeBook
            recipes={recipes}
            materials={materials}
            onDelete={deleteRecipe}
            onLoad={loadRecipe}
            onSave={addRecipe}
            currentEntries={entries}
            currentHours={printHours}
            currentMinutes={printMinutes}
          />
        </div>

        {/* Material selector (multi) */}
        <section className="mb-6 animate-fade-in-up" style={{ animationDelay: "140ms" }}>
          <MaterialSelector entries={entries} materials={materials} onChange={setEntries} />
        </section>

        {/* Print time */}
        <section className="mb-6 animate-fade-in-up" style={{ animationDelay: "180ms" }}>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Tiempo de impresión</label>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex items-center gap-2 ml-auto">
                <input type="number" min="0" placeholder="0" value={printHours} onChange={(e) => setPrintHours(e.target.value)} className="w-16 bg-transparent font-mono text-right text-lg focus:outline-none" />
                <span className="text-xs text-muted-foreground">hrs</span>
                <input type="number" min="0" max="59" placeholder="0" value={printMinutes} onChange={(e) => setPrintMinutes(e.target.value)} className="w-16 bg-transparent font-mono text-right text-lg focus:outline-none" />
                <span className="text-xs text-muted-foreground">min</span>
              </div>
            </div>
          </div>
        </section>

        {/* Cost parameters */}
        <section className="mb-6 animate-fade-in-up" style={{ animationDelay: "220ms" }}>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Parámetros de costo</label>
          <div className="rounded-xl border bg-card p-4 shadow-sm space-y-4">
            <InputRow icon={<Zap className="h-4 w-4" />} label="Electricidad" suffix="CLP/kWh">
              <input type="number" min="0" value={settings.electricityCostKwh || ""} onChange={(e) => updateSetting("electricityCostKwh", parseFloat(e.target.value) || 0)} className="w-full bg-transparent font-mono text-right text-lg focus:outline-none" />
            </InputRow>
            <div className="border-t" />
            <InputRow icon={<Printer className="h-4 w-4" />} label="Consumo" suffix="watts">
              <input type="number" min="0" value={settings.printerWatts || ""} onChange={(e) => updateSetting("printerWatts", parseFloat(e.target.value) || 0)} className="w-full bg-transparent font-mono text-right text-lg focus:outline-none" />
            </InputRow>
            <div className="border-t" />
            <InputRow icon={<Clock className="h-4 w-4" />} label="Tarifa hora" suffix="CLP/hr">
              <input type="number" min="0" value={settings.hourlyRate || ""} onChange={(e) => updateSetting("hourlyRate", parseFloat(e.target.value) || 0)} className="w-full bg-transparent font-mono text-right text-lg focus:outline-none" />
            </InputRow>
          </div>
        </section>

        {/* Margin */}
        <section className="mb-8 animate-fade-in-up" style={{ animationDelay: "260ms" }}>
          <div className="flex items-center gap-2 mb-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Margen de ganancia</label>
            <button onClick={() => setShowMarginTips(!showMarginTips)} className="text-muted-foreground hover:text-foreground transition-colors">
              <Info className="h-3.5 w-3.5" />
            </button>
          </div>

          {showMarginTips && (
            <div className="rounded-lg border bg-card p-3 mb-3 animate-fade-in-up">
              <p className="text-xs text-muted-foreground mb-2">
                Como hobbyista que imprime en su tiempo libre, estos son los márgenes recomendados:
              </p>
              <div className="space-y-1.5">
                {MARGIN_TIPS.map((tip) => (
                  <div key={tip.label} className="flex items-start gap-2 text-[11px]">
                    <span className="font-mono font-semibold text-accent min-w-[60px] shrink-0">{tip.range}</span>
                    <div>
                      <span className="font-semibold">{tip.label}</span>
                      <span className="text-muted-foreground"> — {tip.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground min-w-[80px]">Margen</span>
              <input
                type="number"
                min="0"
                max="300"
                value={settings.marginPercent || ""}
                onChange={(e) => updateSetting("marginPercent", parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent font-mono text-right text-lg focus:outline-none"
              />
              <span className="text-xs text-muted-foreground shrink-0">%</span>
            </div>
          </div>
        </section>

        {/* Results */}
        {hasInput && (
          <section className="animate-fade-in-up">
            <div className="rounded-xl border-2 border-accent/30 bg-card p-5 shadow-lg shadow-accent/5">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="h-4 w-4 text-accent" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Desglose de costos</span>
              </div>
              <div className="space-y-1.5 text-sm">
                {costs.materialCosts.map((mc, i) => (
                  <CostLine key={i} label={`Material: ${mc.name}`} value={mc.cost} />
                ))}
                {costs.materialCosts.length > 1 && (
                  <CostLine label="Subtotal materiales" value={costs.totalMaterial} bold />
                )}
                <CostLine label="Electricidad" value={costs.electricity} />
                <CostLine label="Mano de obra" value={costs.labor} />
                <div className="border-t my-2" />
                <CostLine label="Costo base" value={costs.subtotal} />
                <CostLine label={`Margen (${costs.marginPercent}%)`} value={costs.margin} accent />
                <div className="border-t my-2" />
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-base">Precio final</span>
                  <span className="font-bold text-xl font-mono text-accent">{formatCLP(costs.total)}</span>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

const InputRow = ({ icon, label, suffix, children }: { icon: React.ReactNode; label: string; suffix: string; children: React.ReactNode }) => (
  <div className="flex items-center gap-3">
    <span className="text-muted-foreground shrink-0">{icon}</span>
    <span className="text-sm text-muted-foreground min-w-[80px]">{label}</span>
    <div className="flex-1">{children}</div>
    <span className="text-xs text-muted-foreground shrink-0">{suffix}</span>
  </div>
);

const CostLine = ({ label, value, bold, accent }: { label: string; value: number; bold?: boolean; accent?: boolean }) => (
  <div className="flex items-center justify-between">
    <span className={`${bold ? "font-semibold" : "text-muted-foreground"}`}>{label}</span>
    <span className={`font-mono ${accent ? "text-accent font-medium" : ""} ${bold ? "font-semibold" : ""}`}>{formatCLP(value)}</span>
  </div>
);

export default Index;

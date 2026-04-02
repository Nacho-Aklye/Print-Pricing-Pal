import { useMemo, useState, useEffect } from "react";
import { Printer, Zap, Clock, Calculator, TrendingUp, Info, ShoppingBag, Save } from "lucide-react";
import { useMaterials, useProjects, useSettings } from "@/lib/hooks";
import type { MaterialEntry, CostBreakdown } from "@/lib/types";
import { formatCLP } from "@/lib/types";
import { MaterialSelector } from "@/components/MaterialSelector";
import { Print3DNav } from "@/components/Print3DNav";
import { useSearchParams } from "react-router-dom";

const MARGIN_TIPS = [
  { range: "20–30%", label: "Básico", desc: "Cubre desgaste y algo de ganancia. Para amigos/familia." },
  { range: "35–50%", label: "Recomendado", desc: "Margen justo para hobby. Cubre tu tiempo real y desgaste." },
  { range: "50–80%", label: "Competitivo", desc: "Para piezas con diseño propio, detalle o acabado especial." },
  { range: "80–150%+", label: "Premium", desc: "Diseños exclusivos, piezas artísticas o urgencia." },
];

const Index = () => {
  const { materials } = useMaterials();
  const { projects, addProject } = useProjects();
  const { settings, updateSetting } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();

  const [entries, setEntries] = useState<MaterialEntry[]>([]);
  const [printHours, setPrintHours] = useState("");
  const [printMinutes, setPrintMinutes] = useState("");
  const [modelCost, setModelCost] = useState("");
  const [modelSource, setModelSource] = useState("");
  const [showMarginTips, setShowMarginTips] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveNotes, setSaveNotes] = useState("");
  const [loadedProjectName, setLoadedProjectName] = useState("");

  // Load project from URL param
  useEffect(() => {
    const projectId = searchParams.get("proyecto");
    if (!projectId) return;
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    setEntries(project.materials);
    setPrintHours(project.printHours ? String(project.printHours) : "");
    setPrintMinutes(project.printMinutes ? String(project.printMinutes) : "");
    setModelCost(project.modelCost ? String(project.modelCost) : "");
    setModelSource(project.modelSource || "");
    setSaveName(project.name);
    setSaveNotes(project.notes || "");
    setLoadedProjectName(project.name);
    // Clear the param so it doesn't re-load on re-render
    setSearchParams({}, { replace: true });
  }, [searchParams]);

  const costs: CostBreakdown = useMemo(() => {
    const hours = (parseFloat(printHours) || 0) + (parseFloat(printMinutes) || 0) / 60;
    const materialCosts = entries
      .filter((e) => e.weightGrams > 0)
      .map((e) => {
        const mat = materials.find((m) => m.id === e.materialId);
        return { name: mat?.name || "?", cost: mat ? (e.weightGrams / 1000) * mat.costPerKg : 0 };
      });
    const totalMaterial = materialCosts.reduce((s, c) => s + c.cost, 0);
    const electricity = (settings.printerWatts / 1000) * hours * settings.electricityCostKwh;
    const labor = hours * settings.hourlyRate;
    const mc = parseFloat(modelCost) || 0;
    const subtotal = totalMaterial + electricity + labor + mc;
    const margin = subtotal * (settings.marginPercent / 100);
    const total = subtotal + margin;
    return { materialCosts, totalMaterial, electricity, labor, modelCost: mc, subtotal, margin, marginPercent: settings.marginPercent, total };
  }, [entries, printHours, printMinutes, modelCost, materials, settings]);

  const hasInput = entries.some((e) => e.weightGrams > 0) || parseFloat(printHours) > 0 || parseFloat(printMinutes) > 0;
  const canSave = entries.some((e) => e.weightGrams > 0);

  const handleSave = () => {
    if (!saveName.trim()) return;
    addProject({
      name: saveName,
      materials: entries.filter((e) => e.weightGrams > 0),
      printHours: parseFloat(printHours) || 0,
      printMinutes: parseFloat(printMinutes) || 0,
      modelCost: parseFloat(modelCost) || 0,
      modelSource,
      notes: saveNotes,
      photos: [],
    });
    setSaveName("");
    setSaveNotes("");
    setShowSave(false);
    setLoadedProjectName("");
  };

  return (
    <div className="min-h-screen px-4 py-8 md:py-16">
      <div className="mx-auto max-w-xl">
        <Print3DNav />
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-xl font-bold tracking-tight">Calculadora 3D</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Costea impresiones multicolor de forma rápida</p>
        </div>

        {/* Loaded project indicator */}
        {loadedProjectName && (
          <div className="mb-4 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 animate-fade-in-up">
            <span className="text-xs text-accent font-medium">📂 Proyecto cargado: {loadedProjectName}</span>
          </div>
        )}

        {/* Save as project */}
        {canSave && (
          <div className="mb-6 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
            <button
              onClick={() => setShowSave(!showSave)}
              className="flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80 transition-colors active:scale-[0.97]"
            >
              <Save className="h-3.5 w-3.5" /> Guardar como proyecto
            </button>
            {showSave && (
              <div className="rounded-lg border bg-card p-3 mt-2 space-y-2 animate-fade-in-up">
                <input
                  placeholder="Nombre del proyecto (ej: Benchy bicolor)"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="w-full rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <textarea
                  placeholder="Notas (opcional)"
                  value={saveNotes}
                  onChange={(e) => setSaveNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border bg-background px-2 py-1.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowSave(false)} className="text-xs text-muted-foreground hover:text-foreground px-2 py-1">Cancelar</button>
                  <button onClick={handleSave} className="text-xs font-medium bg-accent text-accent-foreground rounded-md px-3 py-1 hover:bg-accent/90 active:scale-[0.97]">Guardar</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Material selector */}
        <section className="mb-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <MaterialSelector entries={entries} materials={materials} onChange={setEntries} />
        </section>

        {/* Print time */}
        <section className="mb-6 animate-fade-in-up" style={{ animationDelay: "140ms" }}>
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

        {/* Model cost */}
        <section className="mb-6 animate-fade-in-up" style={{ animationDelay: "160ms" }}>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Modelo 3D</label>
          <div className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground min-w-[80px]">Costo</span>
              <input type="number" min="0" placeholder="0" value={modelCost} onChange={(e) => setModelCost(e.target.value)} className="w-full bg-transparent font-mono text-right text-lg focus:outline-none" />
              <span className="text-xs text-muted-foreground shrink-0">CLP</span>
            </div>
            <div className="border-t" />
            <input
              placeholder="Fuente (ej: Thingiverse, diseño propio, Cults3D)"
              value={modelSource}
              onChange={(e) => setModelSource(e.target.value)}
              className="w-full bg-transparent text-sm text-muted-foreground focus:outline-none placeholder:text-muted-foreground/50"
            />
          </div>
        </section>

        {/* Cost parameters */}
        <section className="mb-6 animate-fade-in-up" style={{ animationDelay: "180ms" }}>
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
        <section className="mb-8 animate-fade-in-up" style={{ animationDelay: "220ms" }}>
          <div className="flex items-center gap-2 mb-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Margen de ganancia</label>
            <button onClick={() => setShowMarginTips(!showMarginTips)} className="text-muted-foreground hover:text-foreground transition-colors">
              <Info className="h-3.5 w-3.5" />
            </button>
          </div>
          {showMarginTips && (
            <div className="rounded-lg border bg-card p-3 mb-3 animate-fade-in-up">
              <p className="text-xs text-muted-foreground mb-2">Como hobbyista que imprime en su tiempo libre, estos son los márgenes recomendados:</p>
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
              <input type="number" min="0" max="300" value={settings.marginPercent || ""} onChange={(e) => updateSetting("marginPercent", parseFloat(e.target.value) || 0)} className="w-full bg-transparent font-mono text-right text-lg focus:outline-none" />
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
                {costs.materialCosts.length > 1 && <CostLine label="Subtotal materiales" value={costs.totalMaterial} bold />}
                <CostLine label="Electricidad" value={costs.electricity} />
                <CostLine label="Mano de obra" value={costs.labor} />
                {costs.modelCost > 0 && <CostLine label="Modelo 3D" value={costs.modelCost} />}
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

import { useState, useMemo } from "react";
import { Printer, Zap, Clock, Calculator, Plus, Trash2, Pencil, Check, X } from "lucide-react";

interface Material {
  id: string;
  name: string;
  brand: string;
  costPerKg: number;
}

const DEFAULT_MATERIALS: Material[] = [
  { id: "1", name: "PLA", brand: "eSUN", costPerKg: 12000 },
  { id: "2", name: "PLA+", brand: "eSUN", costPerKg: 13000 },
  { id: "3", name: "PLA+ HS", brand: "eSUN", costPerKg: 14000 },
  { id: "4", name: "PLA Silk", brand: "eSUN", costPerKg: 18000 },
  { id: "5", name: "PETG", brand: "eSUN", costPerKg: 15000 },
  { id: "6", name: "PETG HS", brand: "eSUN", costPerKg: 16000 },
  { id: "7", name: "PETG+ HS", brand: "eSUN", costPerKg: 17000 },
  { id: "8", name: "ASA", brand: "eSUN", costPerKg: 16000 },
  { id: "9", name: "ABS", brand: "eSUN", costPerKg: 14000 },
  { id: "10", name: "TPU", brand: "eSUN", costPerKg: 25000 },
];

const formatCLP = (value: number) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(Math.round(value));

const Index = () => {
  const [materials, setMaterials] = useState<Material[]>(DEFAULT_MATERIALS);
  const [selectedId, setSelectedId] = useState(DEFAULT_MATERIALS[0].id);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", brand: "", costPerKg: "" });
  const [showAdd, setShowAdd] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", brand: "", costPerKg: "" });

  const [weightGrams, setWeightGrams] = useState("");
  const [printHours, setPrintHours] = useState("");
  const [printMinutes, setPrintMinutes] = useState("");
  const [electricityCostKwh, setElectricityCostKwh] = useState("150");
  const [printerWatts, setPrinterWatts] = useState("200");
  const [hourlyRate, setHourlyRate] = useState("3000");

  const selectedMaterial = materials.find((m) => m.id === selectedId) || materials[0];

  const costs = useMemo(() => {
    const weight = parseFloat(weightGrams) || 0;
    const hours = (parseFloat(printHours) || 0) + (parseFloat(printMinutes) || 0) / 60;
    const elecCost = parseFloat(electricityCostKwh) || 0;
    const watts = parseFloat(printerWatts) || 0;
    const labor = parseFloat(hourlyRate) || 0;

    const materialCost = (weight / 1000) * selectedMaterial.costPerKg;
    const electricityCost = (watts / 1000) * hours * elecCost;
    const laborCost = hours * labor;
    const total = materialCost + electricityCost + laborCost;

    return { materialCost, electricityCost, laborCost, total, hours, weight };
  }, [selectedMaterial, weightGrams, printHours, printMinutes, electricityCostKwh, printerWatts, hourlyRate]);

  const hasInput = costs.weight > 0 || costs.hours > 0;

  const startEdit = (mat: Material) => {
    setEditingId(mat.id);
    setEditForm({ name: mat.name, brand: mat.brand, costPerKg: String(mat.costPerKg) });
  };

  const saveEdit = () => {
    if (!editingId) return;
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === editingId
          ? { ...m, name: editForm.name || m.name, brand: editForm.brand || m.brand, costPerKg: parseFloat(editForm.costPerKg) || m.costPerKg }
          : m
      )
    );
    setEditingId(null);
  };

  const deleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    if (selectedId === id) setSelectedId(materials[0]?.id || "");
  };

  const addMaterial = () => {
    if (!newForm.name || !newForm.costPerKg) return;
    const mat: Material = {
      id: Date.now().toString(),
      name: newForm.name,
      brand: newForm.brand || "—",
      costPerKg: parseFloat(newForm.costPerKg) || 0,
    };
    setMaterials((prev) => [...prev, mat]);
    setNewForm({ name: "", brand: "", costPerKg: "" });
    setShowAdd(false);
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
            <h1 className="text-2xl font-bold tracking-tight">Calculadora 3D</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Calcula el costo de tus impresiones 3D de forma rápida y precisa.
          </p>
        </div>

        {/* Material Selection */}
        <section className="mb-6 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Material</label>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80 transition-colors active:scale-[0.97]"
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar
            </button>
          </div>

          {/* Add form */}
          {showAdd && (
            <div className="rounded-lg border bg-card p-3 mb-3 space-y-2 animate-fade-in-up">
              <div className="grid grid-cols-3 gap-2">
                <input
                  placeholder="Nombre"
                  value={newForm.name}
                  onChange={(e) => setNewForm((p) => ({ ...p, name: e.target.value }))}
                  className="rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <input
                  placeholder="Marca"
                  value={newForm.brand}
                  onChange={(e) => setNewForm((p) => ({ ...p, brand: e.target.value }))}
                  className="rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <input
                  type="number"
                  placeholder="CLP/kg"
                  value={newForm.costPerKg}
                  onChange={(e) => setNewForm((p) => ({ ...p, costPerKg: e.target.value }))}
                  className="rounded-md border bg-background px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowAdd(false)} className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1">Cancelar</button>
                <button onClick={addMaterial} className="text-xs font-medium bg-accent text-accent-foreground rounded-md px-3 py-1 hover:bg-accent/90 transition-colors active:scale-[0.97]">Agregar</button>
              </div>
            </div>
          )}

          {/* Material grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {materials.map((mat) => (
              <div key={mat.id} className="relative group">
                {editingId === mat.id ? (
                  <div className="rounded-lg border-2 border-accent bg-card p-2 space-y-1.5">
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full rounded border bg-background px-1.5 py-0.5 text-xs font-semibold focus:outline-none"
                    />
                    <input
                      value={editForm.brand}
                      onChange={(e) => setEditForm((p) => ({ ...p, brand: e.target.value }))}
                      className="w-full rounded border bg-background px-1.5 py-0.5 text-[10px] focus:outline-none"
                    />
                    <input
                      type="number"
                      value={editForm.costPerKg}
                      onChange={(e) => setEditForm((p) => ({ ...p, costPerKg: e.target.value }))}
                      className="w-full rounded border bg-background px-1.5 py-0.5 text-[10px] font-mono focus:outline-none"
                    />
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => setEditingId(null)} className="p-0.5 text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
                      <button onClick={saveEdit} className="p-0.5 text-accent hover:text-accent/80"><Check className="h-3 w-3" /></button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedId(mat.id)}
                    className={`w-full rounded-lg border-2 px-3 py-3 text-left transition-all duration-150 active:scale-[0.97] ${
                      selectedId === mat.id
                        ? "border-accent bg-accent text-accent-foreground shadow-md shadow-accent/20"
                        : "border-border bg-card hover:border-muted-foreground/30"
                    }`}
                  >
                    <span className="block text-sm font-semibold leading-tight">{mat.name}</span>
                    <span className={`block text-[10px] mt-0.5 ${selectedId === mat.id ? "opacity-80" : "text-muted-foreground"}`}>
                      {mat.brand}
                    </span>
                    <span className={`block text-[10px] mt-0.5 font-mono ${selectedId === mat.id ? "opacity-70" : "text-muted-foreground"}`}>
                      {formatCLP(mat.costPerKg)}/kg
                    </span>
                  </button>
                )}
                {/* Action buttons */}
                {editingId !== mat.id && (
                  <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); startEdit(mat); }}
                      className="rounded p-1 bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil className="h-2.5 w-2.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteMaterial(mat.id); }}
                      className="rounded p-1 bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Print Details */}
        <section className="mb-6 animate-fade-in-up" style={{ animationDelay: "160ms" }}>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
            Detalles de impresión
          </label>
          <div className="rounded-xl border bg-card p-4 shadow-sm space-y-4">
            <InputRow icon={<Printer className="h-4 w-4" />} label="Peso" suffix="gramos">
              <input type="number" min="0" placeholder="0" value={weightGrams} onChange={(e) => setWeightGrams(e.target.value)} className="w-full bg-transparent font-mono text-right text-lg focus:outline-none" />
            </InputRow>
            <div className="border-t" />
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground min-w-[80px]">Tiempo</span>
              <div className="flex items-center gap-2 ml-auto">
                <input type="number" min="0" placeholder="0" value={printHours} onChange={(e) => setPrintHours(e.target.value)} className="w-16 bg-transparent font-mono text-right text-lg focus:outline-none" />
                <span className="text-xs text-muted-foreground">hrs</span>
                <input type="number" min="0" max="59" placeholder="0" value={printMinutes} onChange={(e) => setPrintMinutes(e.target.value)} className="w-16 bg-transparent font-mono text-right text-lg focus:outline-none" />
                <span className="text-xs text-muted-foreground">min</span>
              </div>
            </div>
          </div>
        </section>

        {/* Cost Parameters */}
        <section className="mb-8 animate-fade-in-up" style={{ animationDelay: "240ms" }}>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
            Parámetros de costo
          </label>
          <div className="rounded-xl border bg-card p-4 shadow-sm space-y-4">
            <InputRow icon={<Zap className="h-4 w-4" />} label="Electricidad" suffix="CLP/kWh">
              <input type="number" min="0" value={electricityCostKwh} onChange={(e) => setElectricityCostKwh(e.target.value)} className="w-full bg-transparent font-mono text-right text-lg focus:outline-none" />
            </InputRow>
            <div className="border-t" />
            <InputRow icon={<Printer className="h-4 w-4" />} label="Consumo" suffix="watts">
              <input type="number" min="0" value={printerWatts} onChange={(e) => setPrinterWatts(e.target.value)} className="w-full bg-transparent font-mono text-right text-lg focus:outline-none" />
            </InputRow>
            <div className="border-t" />
            <InputRow icon={<Clock className="h-4 w-4" />} label="Tarifa hora" suffix="CLP/hr">
              <input type="number" min="0" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className="w-full bg-transparent font-mono text-right text-lg focus:outline-none" />
            </InputRow>
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
              <div className="space-y-2 text-sm">
                <CostLine label={`Material (${selectedMaterial.name})`} value={costs.materialCost} />
                <CostLine label="Electricidad" value={costs.electricityCost} />
                <CostLine label="Mano de obra" value={costs.laborCost} />
                <div className="border-t my-3" />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base">Total</span>
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

const CostLine = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-mono">{formatCLP(value)}</span>
  </div>
);

export default Index;

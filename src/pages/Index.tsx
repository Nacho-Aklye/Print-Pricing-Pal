import { useState, useMemo } from "react";
import { Printer, Zap, Clock, Calculator } from "lucide-react";

interface Material {
  name: string;
  costPerKg: number; // CLP per kg
}

const DEFAULT_MATERIALS: Material[] = [
  { name: "PLA", costPerKg: 12000 },
  { name: "PETG", costPerKg: 15000 },
  { name: "ABS", costPerKg: 14000 },
  { name: "TPU", costPerKg: 25000 },
];

const formatCLP = (value: number) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(
    Math.round(value)
  );

const Index = () => {
  const [selectedMaterial, setSelectedMaterial] = useState(0);
  const [weightGrams, setWeightGrams] = useState<string>("");
  const [printHours, setPrintHours] = useState<string>("");
  const [printMinutes, setPrintMinutes] = useState<string>("");
  const [electricityCostKwh, setElectricityCostKwh] = useState<string>("150");
  const [printerWatts, setPrinterWatts] = useState<string>("200");
  const [hourlyRate, setHourlyRate] = useState<string>("3000");

  const costs = useMemo(() => {
    const weight = parseFloat(weightGrams) || 0;
    const hours = (parseFloat(printHours) || 0) + (parseFloat(printMinutes) || 0) / 60;
    const elecCost = parseFloat(electricityCostKwh) || 0;
    const watts = parseFloat(printerWatts) || 0;
    const labor = parseFloat(hourlyRate) || 0;
    const material = DEFAULT_MATERIALS[selectedMaterial];

    const materialCost = (weight / 1000) * material.costPerKg;
    const electricityCost = (watts / 1000) * hours * elecCost;
    const laborCost = hours * labor;
    const total = materialCost + electricityCost + laborCost;

    return { materialCost, electricityCost, laborCost, total, hours, weight };
  }, [selectedMaterial, weightGrams, printHours, printMinutes, electricityCostKwh, printerWatts, hourlyRate]);

  const hasInput = costs.weight > 0 || costs.hours > 0;

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
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
            Material
          </label>
          <div className="grid grid-cols-4 gap-2">
            {DEFAULT_MATERIALS.map((mat, i) => (
              <button
                key={mat.name}
                onClick={() => setSelectedMaterial(i)}
                className={`rounded-lg border-2 px-3 py-3 text-sm font-medium transition-all duration-150 active:scale-[0.97] ${
                  selectedMaterial === i
                    ? "border-accent bg-accent text-accent-foreground shadow-md shadow-accent/20"
                    : "border-border bg-card hover:border-muted-foreground/30"
                }`}
              >
                <span className="block font-semibold">{mat.name}</span>
                <span className="block text-[10px] mt-0.5 opacity-70 font-mono">
                  {formatCLP(mat.costPerKg)}/kg
                </span>
              </button>
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
              <input
                type="number"
                min="0"
                placeholder="0"
                value={weightGrams}
                onChange={(e) => setWeightGrams(e.target.value)}
                className="w-full bg-transparent font-mono text-right text-lg focus:outline-none"
              />
            </InputRow>
            <div className="border-t" />
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground min-w-[80px]">Tiempo</span>
              <div className="flex items-center gap-2 ml-auto">
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={printHours}
                  onChange={(e) => setPrintHours(e.target.value)}
                  className="w-16 bg-transparent font-mono text-right text-lg focus:outline-none"
                />
                <span className="text-xs text-muted-foreground">hrs</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="0"
                  value={printMinutes}
                  onChange={(e) => setPrintMinutes(e.target.value)}
                  className="w-16 bg-transparent font-mono text-right text-lg focus:outline-none"
                />
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
              <input
                type="number"
                min="0"
                value={electricityCostKwh}
                onChange={(e) => setElectricityCostKwh(e.target.value)}
                className="w-full bg-transparent font-mono text-right text-lg focus:outline-none"
              />
            </InputRow>
            <div className="border-t" />
            <InputRow icon={<Printer className="h-4 w-4" />} label="Consumo" suffix="watts">
              <input
                type="number"
                min="0"
                value={printerWatts}
                onChange={(e) => setPrinterWatts(e.target.value)}
                className="w-full bg-transparent font-mono text-right text-lg focus:outline-none"
              />
            </InputRow>
            <div className="border-t" />
            <InputRow icon={<Clock className="h-4 w-4" />} label="Tarifa hora" suffix="CLP/hr">
              <input
                type="number"
                min="0"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full bg-transparent font-mono text-right text-lg focus:outline-none"
              />
            </InputRow>
          </div>
        </section>

        {/* Results */}
        {hasInput && (
          <section className="animate-fade-in-up">
            <div className="rounded-xl border-2 border-accent/30 bg-card p-5 shadow-lg shadow-accent/5">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="h-4 w-4 text-accent" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Desglose de costos
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <CostLine label="Material" value={costs.materialCost} />
                <CostLine label="Electricidad" value={costs.electricityCost} />
                <CostLine label="Mano de obra" value={costs.laborCost} />
                <div className="border-t my-3" />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base">Total</span>
                  <span className="font-bold text-xl font-mono text-accent">
                    {formatCLP(costs.total)}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

const InputRow = ({
  icon,
  label,
  suffix,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  suffix: string;
  children: React.ReactNode;
}) => (
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

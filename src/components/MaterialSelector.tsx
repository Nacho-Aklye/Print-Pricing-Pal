import { Plus, Trash2 } from "lucide-react";
import type { Material, MaterialEntry } from "@/lib/types";
import { formatCLP } from "@/lib/types";
import { MaterialColorDots } from "@/components/MaterialColorDots";

interface Props {
  entries: MaterialEntry[];
  materials: Material[];
  onChange: (entries: MaterialEntry[]) => void;
}

export const MaterialSelector = ({ entries, materials, onChange }: Props) => {
  const addEntry = () => {
    const unused = materials.find((m) => !entries.some((e) => e.materialId === m.id));
    if (unused) {
      onChange([...entries, { materialId: unused.id, weightGrams: 0 }]);
    }
  };

  const updateEntry = (index: number, updates: Partial<MaterialEntry>) => {
    onChange(entries.map((e, i) => (i === index ? { ...e, ...updates } : e)));
  };

  const removeEntry = (index: number) => {
    onChange(entries.filter((_, i) => i !== index));
  };

  const getMaterial = (id: string) => materials.find((m) => m.id === id);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Materiales del print
        </label>
        <button
          onClick={addEntry}
          disabled={entries.length >= materials.length}
          className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80 transition-colors active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="h-3.5 w-3.5" /> Color/Material
        </button>
      </div>

      {entries.length === 0 && (
        <button
          onClick={addEntry}
          className="w-full rounded-lg border-2 border-dashed border-border py-6 text-sm text-muted-foreground hover:border-accent/50 hover:text-accent transition-colors"
        >
          + Agregar material
        </button>
      )}

      {entries.map((entry, index) => {
        const mat = getMaterial(entry.materialId);
        const materialCost = mat ? (entry.weightGrams / 1000) * mat.costPerKg : 0;
        return (
          <div key={index} className="rounded-lg border bg-card p-3 flex items-center gap-3 animate-fade-in-up">
            {mat && <MaterialColorDots colors={mat.colors?.length ? mat.colors : ["#888"]} size="xs" />}
            <div className="flex-1 min-w-0">
              <select
                value={entry.materialId}
                onChange={(e) => updateEntry(index, { materialId: e.target.value })}
                className="w-full bg-transparent text-sm font-semibold focus:outline-none cursor-pointer mb-1"
              >
                {materials.map((m) => (
                  <option key={m.id} value={m.id} disabled={entries.some((e, i) => i !== index && e.materialId === m.id)}>
                    {m.name} — {m.brand}{m.details ? ` (${m.details})` : ""}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-muted-foreground font-mono">
                {mat ? `${formatCLP(mat.costPerKg)}/kg` : ""}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <input
                type="number"
                min="0"
                placeholder="0"
                value={entry.weightGrams || ""}
                onChange={(e) => updateEntry(index, { weightGrams: parseFloat(e.target.value) || 0 })}
                className="w-16 bg-transparent font-mono text-right text-base focus:outline-none"
              />
              <span className="text-xs text-muted-foreground">g</span>
            </div>
            {materialCost > 0 && (
              <span className="text-xs font-mono text-accent shrink-0 min-w-[70px] text-right">
                {formatCLP(materialCost)}
              </span>
            )}
            <button onClick={() => removeEntry(index)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0 active:scale-[0.95]">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

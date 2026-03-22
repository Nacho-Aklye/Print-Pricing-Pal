import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import type { Material } from "@/lib/types";
import { formatCLP } from "@/lib/types";

interface Props {
  materials: Material[];
  onAdd: (mat: Omit<Material, "id">) => void;
  onUpdate: (id: string, updates: Partial<Material>) => void;
  onDelete: (id: string) => void;
}

export const MaterialManager = ({ materials, onAdd, onUpdate, onDelete }: Props) => {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", brand: "", details: "", costPerKg: "" });
  const [newForm, setNewForm] = useState({ name: "", brand: "", details: "", costPerKg: "" });

  const startEdit = (mat: Material) => {
    setEditingId(mat.id);
    setEditForm({ name: mat.name, brand: mat.brand, costPerKg: String(mat.costPerKg) });
  };

  const saveEdit = () => {
    if (!editingId) return;
    onUpdate(editingId, {
      name: editForm.name,
      brand: editForm.brand,
      costPerKg: parseFloat(editForm.costPerKg) || 0,
    });
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!newForm.name || !newForm.costPerKg) return;
    onAdd({ name: newForm.name, brand: newForm.brand || "—", costPerKg: parseFloat(newForm.costPerKg) || 0 });
    setNewForm({ name: "", brand: "", costPerKg: "" });
    setShowAdd(false);
  };

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Materiales disponibles</label>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80 transition-colors active:scale-[0.97]">
          <Plus className="h-3.5 w-3.5" /> Agregar
        </button>
      </div>

      {showAdd && (
        <div className="rounded-lg border bg-card p-3 mb-3 space-y-2 animate-fade-in-up">
          <div className="grid grid-cols-3 gap-2">
            <input placeholder="Nombre" value={newForm.name} onChange={(e) => setNewForm((p) => ({ ...p, name: e.target.value }))} className="rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
            <input placeholder="Marca" value={newForm.brand} onChange={(e) => setNewForm((p) => ({ ...p, brand: e.target.value }))} className="rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
            <input type="number" placeholder="CLP/kg" value={newForm.costPerKg} onChange={(e) => setNewForm((p) => ({ ...p, costPerKg: e.target.value }))} className="rounded-md border bg-background px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="text-xs text-muted-foreground hover:text-foreground px-2 py-1">Cancelar</button>
            <button onClick={handleAdd} className="text-xs font-medium bg-accent text-accent-foreground rounded-md px-3 py-1 hover:bg-accent/90 active:scale-[0.97]">Agregar</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[280px] overflow-y-auto pr-1">
        {materials.map((mat) => (
          <div key={mat.id} className="relative group">
            {editingId === mat.id ? (
              <div className="rounded-lg border-2 border-accent bg-card p-2 space-y-1.5">
                <input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} className="w-full rounded border bg-background px-1.5 py-0.5 text-xs font-semibold focus:outline-none" />
                <input value={editForm.brand} onChange={(e) => setEditForm((p) => ({ ...p, brand: e.target.value }))} className="w-full rounded border bg-background px-1.5 py-0.5 text-[10px] focus:outline-none" />
                <input type="number" value={editForm.costPerKg} onChange={(e) => setEditForm((p) => ({ ...p, costPerKg: e.target.value }))} className="w-full rounded border bg-background px-1.5 py-0.5 text-[10px] font-mono focus:outline-none" />
                <div className="flex gap-1 justify-end">
                  <button onClick={() => setEditingId(null)} className="p-0.5 text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
                  <button onClick={saveEdit} className="p-0.5 text-accent hover:text-accent/80"><Check className="h-3 w-3" /></button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border bg-card px-3 py-2.5 text-left">
                <span className="block text-sm font-semibold leading-tight">{mat.name}</span>
                <span className="block text-[10px] mt-0.5 text-muted-foreground">{mat.brand}</span>
                <span className="block text-[10px] mt-0.5 font-mono text-muted-foreground">{formatCLP(mat.costPerKg)}/kg</span>
              </div>
            )}
            {editingId !== mat.id && (
              <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(mat)} className="rounded p-1 bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-foreground"><Pencil className="h-2.5 w-2.5" /></button>
                <button onClick={() => onDelete(mat.id)} className="rounded p-1 bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-destructive"><Trash2 className="h-2.5 w-2.5" /></button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

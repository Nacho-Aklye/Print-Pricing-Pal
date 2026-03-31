import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, ChevronDown, ChevronRight } from "lucide-react";
import { useMaterials } from "@/lib/hooks";
import type { Material } from "@/lib/types";
import { formatCLP, groupMaterialsByType } from "@/lib/types";
import { ColorPicker } from "@/components/ColorPicker";
import { MaterialColorDots } from "@/components/MaterialColorDots";

const Materials = () => {
  const { materials, addMaterial, updateMaterial, deleteMaterial } = useMaterials();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", brand: "", details: "", costPerKg: "", colors: ["#888888"] as string[], spoolWeightG: "1000", weightUsedG: "0" });
  const [newForm, setNewForm] = useState({ name: "", brand: "", details: "", costPerKg: "", colors: ["#888888"] as string[], spoolWeightG: "1000" });
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const grouped = groupMaterialsByType(materials);

  const toggleGroup = (group: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      next.has(group) ? next.delete(group) : next.add(group);
      return next;
    });
  };

  const startEdit = (mat: Material) => {
    setEditingId(mat.id);
    setEditForm({
      name: mat.name,
      brand: mat.brand,
      details: mat.details,
      costPerKg: String(mat.costPerKg),
      colors: mat.colors?.length ? mat.colors : ["#888888"],
      spoolWeightG: String(mat.spoolWeightG ?? 1000),
      weightUsedG: String(mat.weightUsedG ?? 0),
    });
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateMaterial(editingId, {
      name: editForm.name,
      brand: editForm.brand,
      details: editForm.details,
      costPerKg: parseFloat(editForm.costPerKg) || 0,
      colors: editForm.colors,
      spoolWeightG: parseFloat(editForm.spoolWeightG) || 1000,
      weightUsedG: parseFloat(editForm.weightUsedG) || 0,
    });
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!newForm.name || !newForm.costPerKg) return;
    addMaterial({
      name: newForm.name,
      brand: newForm.brand || "—",
      details: newForm.details,
      costPerKg: parseFloat(newForm.costPerKg) || 0,
      colors: newForm.colors,
      spoolWeightG: parseFloat(newForm.spoolWeightG) || 1000,
      weightUsedG: 0,
    });
    setNewForm({ name: "", brand: "", details: "", costPerKg: "", colors: ["#888888"], spoolWeightG: "1000" });
    setShowAdd(false);
  };

  const getRemainingG = (mat: Material) => {
    const spool = mat.spoolWeightG ?? 1000;
    const used = mat.weightUsedG ?? 0;
    return Math.max(0, spool - used);
  };

  const getRemainingPercent = (mat: Material) => {
    const spool = mat.spoolWeightG ?? 1000;
    if (spool <= 0) return 0;
    return Math.max(0, Math.min(100, (getRemainingG(mat) / spool) * 100));
  };

  return (
    <div className="min-h-screen px-4 py-8 md:py-16">
      <div className="mx-auto max-w-xl">
        <div className="flex items-center justify-between mb-6 animate-fade-in-up">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Materiales</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{materials.length} filamentos registrados</p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 text-sm font-medium bg-accent text-accent-foreground rounded-lg px-3 py-1.5 hover:bg-accent/90 active:scale-[0.97] transition-all"
          >
            <Plus className="h-4 w-4" /> Agregar
          </button>
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="rounded-xl border bg-card p-4 mb-6 space-y-3 animate-fade-in-up shadow-sm">
            <h3 className="text-sm font-semibold">Nuevo material</h3>
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Nombre (ej: PLA+)" value={newForm.name} onChange={(e) => setNewForm((p) => ({ ...p, name: e.target.value }))} className="rounded-md border bg-background px-2.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
              <input placeholder="Marca" value={newForm.brand} onChange={(e) => setNewForm((p) => ({ ...p, brand: e.target.value }))} className="rounded-md border bg-background px-2.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
              <input placeholder="Detalles (opcional)" value={newForm.details} onChange={(e) => setNewForm((p) => ({ ...p, details: e.target.value }))} className="rounded-md border bg-background px-2.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
              <input type="number" placeholder="CLP/kg" value={newForm.costPerKg} onChange={(e) => setNewForm((p) => ({ ...p, costPerKg: e.target.value }))} className="rounded-md border bg-background px-2.5 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-accent" />
              <input type="number" placeholder="Peso rollo (g)" value={newForm.spoolWeightG} onChange={(e) => setNewForm((p) => ({ ...p, spoolWeightG: e.target.value }))} className="rounded-md border bg-background px-2.5 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Colores</label>
              <ColorPicker colors={newForm.colors} onChange={(colors) => setNewForm((p) => ({ ...p, colors }))} />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setShowAdd(false)} className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5">Cancelar</button>
              <button onClick={handleAdd} className="text-xs font-medium bg-accent text-accent-foreground rounded-md px-4 py-1.5 hover:bg-accent/90 active:scale-[0.97]">Agregar</button>
            </div>
          </div>
        )}

        {/* Grouped materials */}
        <div className="space-y-4">
          {Object.entries(grouped).map(([group, mats], gi) => (
            <div key={group} className="animate-fade-in-up" style={{ animationDelay: `${gi * 60}ms` }}>
              <button
                onClick={() => toggleGroup(group)}
                className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors w-full text-left"
              >
                {collapsedGroups.has(group) ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                {group}
                <span className="text-[10px] font-normal">({mats.length})</span>
              </button>

              {!collapsedGroups.has(group) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {mats.map((mat) => {
                    const remaining = getRemainingG(mat);
                    const pct = getRemainingPercent(mat);
                    const barColor = pct > 30 ? "bg-accent" : pct > 10 ? "bg-yellow-500" : "bg-destructive";

                    return (
                      <div key={mat.id} className="relative group">
                        {editingId === mat.id ? (
                          <div className="rounded-lg border-2 border-accent bg-card p-3 space-y-2">
                            <input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} className="w-full rounded border bg-background px-2 py-1 text-sm font-semibold focus:outline-none" />
                            <input value={editForm.brand} onChange={(e) => setEditForm((p) => ({ ...p, brand: e.target.value }))} className="w-full rounded border bg-background px-2 py-1 text-xs focus:outline-none" />
                            <input placeholder="Detalles" value={editForm.details} onChange={(e) => setEditForm((p) => ({ ...p, details: e.target.value }))} className="w-full rounded border bg-background px-2 py-1 text-xs focus:outline-none" />
                            <input type="number" value={editForm.costPerKg} onChange={(e) => setEditForm((p) => ({ ...p, costPerKg: e.target.value }))} placeholder="CLP/kg" className="w-full rounded border bg-background px-2 py-1 text-xs font-mono focus:outline-none" />
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[9px] text-muted-foreground">Peso rollo (g)</label>
                                <input type="number" value={editForm.spoolWeightG} onChange={(e) => setEditForm((p) => ({ ...p, spoolWeightG: e.target.value }))} className="w-full rounded border bg-background px-2 py-1 text-xs font-mono focus:outline-none" />
                              </div>
                              <div>
                                <label className="text-[9px] text-muted-foreground">Usado (g)</label>
                                <input type="number" value={editForm.weightUsedG} onChange={(e) => setEditForm((p) => ({ ...p, weightUsedG: e.target.value }))} className="w-full rounded border bg-background px-2 py-1 text-xs font-mono focus:outline-none" />
                              </div>
                            </div>
                            <ColorPicker colors={editForm.colors} onChange={(colors) => setEditForm((p) => ({ ...p, colors }))} />
                            <div className="flex gap-1 justify-end">
                              <button onClick={() => setEditingId(null)} className="p-1 text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
                              <button onClick={saveEdit} className="p-1 text-accent hover:text-accent/80"><Check className="h-3.5 w-3.5" /></button>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-lg border bg-card px-3 py-2.5 text-left">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <span className="block text-sm font-semibold leading-tight">{mat.name}</span>
                                <span className="block text-[10px] mt-0.5 text-muted-foreground">{mat.brand}</span>
                                {mat.details && <span className="block text-[10px] mt-0.5 text-muted-foreground/70 italic">{mat.details}</span>}
                                <span className="block text-[10px] mt-1 font-mono text-muted-foreground">{formatCLP(mat.costPerKg)}/kg</span>
                              </div>
                              <MaterialColorDots colors={mat.colors?.length ? mat.colors : ["#888888"]} />
                            </div>
                            {/* Remaining weight bar */}
                            <div className="mt-2">
                              <div className="flex justify-between text-[9px] text-muted-foreground mb-0.5">
                                <span>{remaining}g restantes</span>
                                <span>{pct.toFixed(0)}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </div>
                        )}
                        {editingId !== mat.id && (
                          <div className="absolute top-1.5 right-12 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(mat)} className="rounded p-1 bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-foreground"><Pencil className="h-2.5 w-2.5" /></button>
                            <button onClick={() => deleteMaterial(mat.id)} className="rounded p-1 bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-destructive"><Trash2 className="h-2.5 w-2.5" /></button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Materials;
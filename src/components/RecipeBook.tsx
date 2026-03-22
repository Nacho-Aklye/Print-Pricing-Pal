import { useState } from "react";
import { BookOpen, Trash2, ArrowRight, Save, X, StickyNote } from "lucide-react";
import type { Recipe, Material, MaterialEntry } from "@/lib/types";

interface Props {
  recipes: Recipe[];
  materials: Material[];
  onDelete: (id: string) => void;
  onLoad: (recipe: Recipe) => void;
  onSave: (recipe: Omit<Recipe, "id" | "createdAt">) => void;
  currentEntries: MaterialEntry[];
  currentHours: string;
  currentMinutes: string;
}

export const RecipeBook = ({ recipes, materials, onDelete, onLoad, onSave, currentEntries, currentHours, currentMinutes }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveNotes, setSaveNotes] = useState("");

  const getMaterialName = (id: string) => {
    const mat = materials.find((m) => m.id === id);
    return mat ? `${mat.name}` : "?";
  };

  const handleSave = () => {
    if (!saveName.trim()) return;
    onSave({
      name: saveName,
      materials: currentEntries.filter((e) => e.weightGrams > 0),
      printHours: parseFloat(currentHours) || 0,
      printMinutes: parseFloat(currentMinutes) || 0,
      notes: saveNotes,
    });
    setSaveName("");
    setSaveNotes("");
    setShowSave(false);
  };

  const canSave = currentEntries.some((e) => e.weightGrams > 0);

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          <BookOpen className="h-4 w-4" />
          Recetario ({recipes.length})
        </button>
        {canSave && (
          <button
            onClick={() => setShowSave(!showSave)}
            className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80 transition-colors active:scale-[0.97]"
          >
            <Save className="h-3.5 w-3.5" /> Guardar receta
          </button>
        )}
      </div>

      {/* Save form */}
      {showSave && (
        <div className="rounded-lg border bg-card p-3 mb-3 space-y-2 animate-fade-in-up">
          <input
            placeholder="Nombre de la receta (ej: Benchy bicolor)"
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

      {/* Recipe list */}
      {isOpen && (
        <div className="space-y-2 animate-fade-in-up">
          {recipes.length === 0 ? (
            <div className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
              No hay recetas guardadas. Configura un print y guárdalo.
            </div>
          ) : (
            recipes.map((recipe) => (
              <div key={recipe.id} className="rounded-lg border bg-card p-3 group">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate">{recipe.name}</h3>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {recipe.materials.map((entry, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                          {getMaterialName(entry.materialId)} · {entry.weightGrams}g
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground font-mono">
                      <span>{recipe.printHours}h {recipe.printMinutes}m</span>
                      <span>Total: {recipe.materials.reduce((s, e) => s + e.weightGrams, 0)}g</span>
                    </div>
                    {recipe.notes && (
                      <div className="flex items-start gap-1 mt-1.5 text-[10px] text-muted-foreground">
                        <StickyNote className="h-2.5 w-2.5 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{recipe.notes}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onLoad(recipe)} className="rounded p-1.5 text-accent hover:bg-accent/10 transition-colors" title="Cargar receta">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => onDelete(recipe.id)} className="rounded p-1.5 text-muted-foreground hover:text-destructive transition-colors" title="Eliminar">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
};

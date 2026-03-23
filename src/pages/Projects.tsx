import { useState } from "react";
import { Trash2, ArrowRight, ChevronDown, ChevronRight, StickyNote, ShoppingBag, Clock, Layers } from "lucide-react";
import { useProjects, useMaterials } from "@/lib/hooks";
import type { Project } from "@/lib/types";
import { formatCLP } from "@/lib/types";
import { MaterialColorDots } from "@/components/MaterialColorDots";

const Projects = () => {
  const { projects, deleteProject } = useProjects();
  const { materials } = useMaterials();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getMaterial = (id: string) => materials.find((m) => m.id === id);
  const getMaterialName = (id: string) => {
    const mat = getMaterial(id);
    return mat ? `${mat.name} (${mat.brand})` : "?";
  };

  const sorted = [...projects].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="min-h-screen px-4 py-8 md:py-16">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 animate-fade-in-up">
          <h1 className="text-xl font-bold tracking-tight">Proyectos</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{projects.length} proyectos guardados</p>
        </div>

        {sorted.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed py-12 text-center animate-fade-in-up">
            <Layers className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No hay proyectos guardados.</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Ve a Calcular, configura un print y guárdalo como proyecto.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((project, i) => {
              const isExpanded = expandedId === project.id;
              const totalWeight = project.materials.reduce((s, e) => s + e.weightGrams, 0);
              const date = new Date(project.createdAt);

              return (
                <div
                  key={project.id}
                  className="rounded-xl border bg-card shadow-sm overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* Header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : project.id)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-secondary/30 transition-colors active:scale-[0.99]"
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold truncate">{project.name}</h3>
                      <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground font-mono">
                        <span>{project.printHours}h {project.printMinutes}m</span>
                        <span>{totalWeight}g</span>
                        <span>{date.toLocaleDateString("es-CL")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {project.materials.slice(0, 4).map((entry, j) => {
                        const mat = getMaterial(entry.materialId);
                        if (!mat) return null;
                        return <MaterialColorDots key={j} colors={mat.colors?.length ? mat.colors : ["#888"]} size="xs" />;
                      })}
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 border-t animate-fade-in-up">
                      {/* Materials */}
                      <div className="pt-3">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Materiales</span>
                        <div className="space-y-1.5">
                          {project.materials.map((entry, j) => {
                            const mat = getMaterial(entry.materialId);
                            const cost = mat ? (entry.weightGrams / 1000) * mat.costPerKg : 0;
                            return (
                              <div key={j} className="flex items-center gap-2 text-sm">
                                {mat && <MaterialColorDots colors={mat.colors?.length ? mat.colors : ["#888"]} size="xs" />}
                                <span className="flex-1 min-w-0 truncate">{getMaterialName(entry.materialId)}</span>
                                <span className="font-mono text-xs text-muted-foreground">{entry.weightGrams}g</span>
                                <span className="font-mono text-xs text-accent">{formatCLP(cost)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Print time */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Tiempo: {project.printHours}h {project.printMinutes}m</span>
                      </div>

                      {/* Model cost */}
                      {(project.modelCost > 0 || project.modelSource) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ShoppingBag className="h-3.5 w-3.5" />
                          <span>
                            Modelo: {project.modelCost > 0 ? formatCLP(project.modelCost) : "Gratis"}
                            {project.modelSource ? ` — ${project.modelSource}` : ""}
                          </span>
                        </div>
                      )}

                      {/* Notes */}
                      {project.notes && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <StickyNote className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <p className="whitespace-pre-wrap">{project.notes}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors active:scale-[0.97]"
                        >
                          <Trash2 className="h-3 w-3" /> Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;

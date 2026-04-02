import { useState, useRef } from "react";
import { Trash2, ChevronDown, ChevronRight, StickyNote, ShoppingBag, Clock, Layers, Calculator, ImagePlus, X } from "lucide-react";
import { useProjects, useMaterials } from "@/lib/hooks";
import type { Project } from "@/lib/types";
import { formatCLP } from "@/lib/types";
import { MaterialColorDots } from "@/components/MaterialColorDots";
import { Print3DNav } from "@/components/Print3DNav";
import { useNavigate } from "react-router-dom";

const MAX_PHOTOS = 5;
const MAX_PHOTO_SIZE = 800; // max dimension in px for compression

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > MAX_PHOTO_SIZE || height > MAX_PHOTO_SIZE) {
          if (width > height) {
            height = (height / width) * MAX_PHOTO_SIZE;
            width = MAX_PHOTO_SIZE;
          } else {
            width = (width / height) * MAX_PHOTO_SIZE;
            height = MAX_PHOTO_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const Projects = () => {
  const { projects, deleteProject, updateProject } = useProjects();
  const { materials } = useMaterials();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const navigate = useNavigate();

  const getMaterial = (id: string) => materials.find((m) => m.id === id);
  const getMaterialName = (id: string) => {
    const mat = getMaterial(id);
    return mat ? `${mat.name} (${mat.brand})` : "?";
  };

  const sorted = [...projects].sort((a, b) => b.createdAt - a.createdAt);

  const handleAddPhotos = async (projectId: string, files: FileList) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    const currentPhotos = project.photos || [];
    const remaining = MAX_PHOTOS - currentPhotos.length;
    if (remaining <= 0) return;

    const newFiles = Array.from(files).slice(0, remaining);
    const compressed = await Promise.all(newFiles.map(compressImage));
    updateProject(projectId, { photos: [...currentPhotos, ...compressed] });
    setUploadingFor(null);
  };

  const handleRemovePhoto = (projectId: string, photoIndex: number) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    const photos = (project.photos || []).filter((_, i) => i !== photoIndex);
    updateProject(projectId, { photos });
  };

  const loadInCalculator = (project: Project) => {
    navigate(`/?proyecto=${project.id}`);
  };

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
              const photos = project.photos || [];

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
                      {photos.length > 0 && (
                        <span className="text-[9px] text-muted-foreground mr-1">📷{photos.length}</span>
                      )}
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
                      {/* Photos */}
                      <div className="pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Fotos</span>
                          {photos.length < MAX_PHOTOS && (
                            <button
                              onClick={() => {
                                setUploadingFor(project.id);
                                fileInputRef.current?.click();
                              }}
                              className="flex items-center gap-1 text-[11px] text-accent hover:text-accent/80 transition-colors active:scale-[0.97]"
                            >
                              <ImagePlus className="h-3 w-3" /> Agregar foto
                            </button>
                          )}
                        </div>
                        {photos.length > 0 ? (
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {photos.map((photo, pi) => (
                              <div key={pi} className="relative shrink-0 group/photo">
                                <img
                                  src={photo}
                                  alt={`Foto ${pi + 1}`}
                                  className="h-20 w-20 rounded-lg object-cover border border-border cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => setViewingPhoto(photo)}
                                />
                                <button
                                  onClick={() => handleRemovePhoto(project.id, pi)}
                                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity"
                                >
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-muted-foreground/60 italic">Sin fotos aún</p>
                        )}
                      </div>

                      {/* Materials */}
                      <div>
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
                      <div className="flex items-center justify-between pt-1 border-t">
                        <button
                          onClick={() => loadInCalculator(project)}
                          className="flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80 transition-colors active:scale-[0.97]"
                        >
                          <Calculator className="h-3.5 w-3.5" /> Cargar en calculadora
                        </button>
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

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && uploadingFor) {
              handleAddPhotos(uploadingFor, e.target.files);
            }
            e.target.value = "";
          }}
        />

        {/* Photo lightbox */}
        {viewingPhoto && (
          <div
            className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-4"
            onClick={() => setViewingPhoto(null)}
          >
            <img
              src={viewingPhoto}
              alt="Foto del proyecto"
              className="max-h-[80vh] max-w-full rounded-lg object-contain"
            />
            <button
              onClick={() => setViewingPhoto(null)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;

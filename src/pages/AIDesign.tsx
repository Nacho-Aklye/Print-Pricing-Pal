import { useState, useRef } from "react";
import { Image, Type, Box, UploadCloud, Sparkles, Download, Calculator, X } from "lucide-react";

type Tab = "photo" | "text" | "models";
type Style = "Realista" | "Geométrico" | "Low-poly" | "Artístico";

const STYLES: Style[] = ["Realista", "Geométrico", "Low-poly", "Artístico"];

const AIDesign = () => {
  const [tab, setTab] = useState<Tab>("photo");
  const [style, setStyle] = useState<Style>("Realista");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const tabs: { id: Tab; label: string; icon: typeof Image }[] = [
    { id: "photo", label: "Foto → 3D", icon: Image },
    { id: "text", label: "Texto → 3D", icon: Type },
    { id: "models", label: "Mis modelos", icon: Box },
  ];

  return (
    <div className="min-h-screen px-4 py-8 md:py-16">
      <div className="mx-auto max-w-xl space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">IA Diseño 3D</h1>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-xl bg-card-secondary border border-border">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                tab === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {tab === "photo" && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
            className={`relative rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors ${
              dragging ? "border-primary bg-sidebar-accent" : "border-border hover:border-primary/50"
            }`}
          >
            {image ? (
              <>
                <img src={image} alt="Referencia" className="mx-auto max-h-48 rounded-lg" />
                <button
                  onClick={(e) => { e.stopPropagation(); setImage(null); }}
                  className="absolute top-2 right-2 rounded-full bg-card border border-border p-1 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <UploadCloud className="h-8 w-8" />
                <p className="text-sm font-medium text-foreground">Arrastra una imagen de referencia</p>
                <p className="text-xs">o haz clic para seleccionar</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ""; }} />
          </div>
        )}

        {tab === "models" ? (
          <ModelsGrid />
        ) : (
          <>
            {/* Style selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estilo</label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                      style === s ? "border-primary bg-sidebar-accent text-primary" : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {tab === "text" ? "Describe el modelo" : "Descripción adicional"}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder={tab === "text" ? "Ej: un llavero con forma de gato geométrico..." : "Detalles, dimensiones, acabado..."}
                className="w-full rounded-lg border border-border bg-card-secondary px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            {/* Generate button */}
            <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground py-3 text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all">
              <Sparkles className="h-4 w-4" /> Generar modelo 3D
            </button>

            <ModelsGrid />
          </>
        )}
      </div>
    </div>
  );
};

const ModelsGrid = () => (
  <div className="space-y-3">
    <h2 className="text-sm font-semibold">Modelos generados</h2>
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="aspect-square rounded-xl border border-border bg-card-secondary flex items-center justify-center">
            <Box className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1.5">
            <button className="flex items-center justify-center gap-1 rounded-lg bg-primary text-primary-foreground py-1.5 text-[11px] font-medium hover:bg-primary/90 transition-colors">
              <Download className="h-3 w-3" /> STL
            </button>
            <button className="flex items-center justify-center gap-1 rounded-lg border border-primary/30 bg-transparent text-primary py-1.5 text-[11px] font-medium hover:bg-sidebar-accent transition-colors">
              <Calculator className="h-3 w-3" /> Costo
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AIDesign;

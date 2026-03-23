import { Plus, X, Star, StarOff } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useFavoriteColors } from "@/lib/hooks";

interface Props {
  colors: string[];
  onChange: (colors: string[]) => void;
  max?: number;
}

const PRESET_COLORS = [
  "#ffffff", "#f5f5f4", "#a1a1aa", "#525252", "#000000",
  "#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e",
  "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899",
  "#92400e", "#c9a84c", "#16a34a", "#1e3a5f", "#be185d",
];

export const ColorPicker = ({ colors, onChange, max = 15 }: Props) => {
  const [showPicker, setShowPicker] = useState<number | null>(null);
  const { favorites, addFavorite, removeFavorite } = useFavoriteColors();
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker on outside click
  useEffect(() => {
    if (showPicker === null) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPicker]);

  const addColor = () => {
    if (colors.length >= max) return;
    // Pick a color not already used, starting from lighter presets
    const unused = PRESET_COLORS.find((c) => !colors.includes(c)) || "#888888";
    onChange([...colors, unused]);
  };

  const updateColor = (index: number, color: string) => {
    onChange(colors.map((c, i) => (i === index ? color : c)));
  };

  const removeColor = (index: number) => {
    if (colors.length <= 1) return;
    onChange(colors.filter((_, i) => i !== index));
    setShowPicker(null);
  };

  const isFavorite = (color: string) => favorites.includes(color.toLowerCase());

  const toggleFavorite = (color: string) => {
    const c = color.toLowerCase();
    if (isFavorite(c)) removeFavorite(c);
    else addFavorite(c);
  };

  const colorLabel =
    colors.length === 1 ? "Un color" :
    colors.length === 2 ? "Bicolor" :
    colors.length === 3 ? "Tricolor" :
    `Arcoíris (${colors.length})`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 flex-wrap">
          {colors.map((color, i) => (
            <div key={i} className="relative" ref={showPicker === i ? pickerRef : undefined}>
              <button
                onClick={() => setShowPicker(showPicker === i ? null : i)}
                className="h-6 w-6 rounded-full border-2 border-border shadow-sm transition-transform hover:scale-110 active:scale-95"
                style={{ backgroundColor: color }}
                title={`Color ${i + 1}`}
              />
              {showPicker === i && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowPicker(null)} />
                  <div className="absolute top-8 left-0 z-[100] rounded-lg border bg-card p-2.5 shadow-xl animate-fade-in-up min-w-[220px]" style={{ position: 'absolute' }}>
                    {/* Presets */}
                    <div className="grid grid-cols-5 gap-1.5 mb-2">
                      {PRESET_COLORS.map((preset) => (
                        <button
                          key={preset}
                          onClick={() => { updateColor(i, preset); setShowPicker(null); }}
                          className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 ${
                            color === preset ? "border-accent ring-2 ring-accent/30" : "border-border"
                          }`}
                          style={{ backgroundColor: preset }}
                        />
                      ))}
                    </div>

                    {/* Favorites */}
                    {favorites.length > 0 && (
                      <div className="mb-2">
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Favoritos</span>
                        <div className="flex flex-wrap gap-1">
                          {favorites.map((fav) => (
                            <button
                              key={fav}
                              onClick={() => { updateColor(i, fav); setShowPicker(null); }}
                              className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 ${
                                color === fav ? "border-accent ring-2 ring-accent/30" : "border-border"
                              }`}
                              style={{ backgroundColor: fav }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Custom color */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => updateColor(i, e.target.value)}
                        className="h-7 w-7 rounded cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => updateColor(i, e.target.value)}
                        className="flex-1 rounded border bg-background px-1.5 py-1 text-[10px] font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                      <button
                        onClick={() => toggleFavorite(color)}
                        className="text-muted-foreground hover:text-accent transition-colors"
                        title={isFavorite(color) ? "Quitar de favoritos" : "Guardar como favorito"}
                      >
                        {isFavorite(color) ? <Star className="h-3.5 w-3.5 fill-accent text-accent" /> : <StarOff className="h-3.5 w-3.5" />}
                      </button>
                      {colors.length > 1 && (
                        <button onClick={() => removeColor(i)} className="text-muted-foreground hover:text-destructive transition-colors" title="Eliminar color">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
          {colors.length < max && (
            <button
              onClick={addColor}
              className="h-6 w-6 rounded-full border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-accent hover:text-accent transition-colors active:scale-95"
              title="Agregar color"
            >
              <Plus className="h-3 w-3" />
            </button>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{colorLabel}</span>
      </div>
    </div>
  );
};

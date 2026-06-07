import { Plus, X, Star, Trash2, Check, RotateCcw } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
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
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pickerPos, setPickerPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [customHex, setCustomHex] = useState("");
  // The color the swatch had when the picker was opened — used to revert on Cancel.
  const [originalColor, setOriginalColor] = useState<string>("");

  const updatePosition = useCallback(() => {
    if (showPicker === null) return;
    const btn = buttonRefs.current[showPicker];
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const pickerWidth = 280;
    const pickerHeight = 420;
    let left = rect.left;
    let top = rect.bottom + 6;
    if (left + pickerWidth > window.innerWidth - 8) {
      left = window.innerWidth - pickerWidth - 8;
    }
    if (left < 8) left = 8;
    // If it would go below viewport, show above
    if (top + pickerHeight > window.innerHeight - 8) {
      top = rect.top - pickerHeight - 6;
    }
    setPickerPos({ top, left });
  }, [showPicker]);

  useEffect(() => {
    updatePosition();
    if (showPicker !== null) {
      setCustomHex(colors[showPicker] || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPicker, updatePosition]);

  useEffect(() => {
    if (showPicker === null) return;
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showPicker, updatePosition]);

  const openPicker = (index: number) => {
    if (showPicker === index) {
      setShowPicker(null);
      return;
    }
    setOriginalColor(colors[index]);
    setShowPicker(index);
  };

  const addColor = () => {
    if (colors.length >= max) return;
    const unused = PRESET_COLORS.find((c) => !colors.includes(c)) || "#888888";
    onChange([...colors, unused]);
  };

  // Live preview — applies the color immediately so it's visible on the swatch,
  // but the picker stays open so the user can keep adjusting before confirming.
  const previewColor = (index: number, color: string) => {
    onChange(colors.map((c, i) => (i === index ? color : c)));
    setCustomHex(color);
  };

  const removeColor = (index: number) => {
    if (colors.length <= 1) return;
    onChange(colors.filter((_, i) => i !== index));
    setShowPicker(null);
  };

  // Revert to the color the swatch had when the picker opened, then close.
  const cancelEdit = (index: number) => {
    previewColor(index, originalColor);
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

  const hexValid = (h: string) => /^#[0-9a-fA-F]{6}$/.test(h);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {colors.map((color, i) => (
            <div key={i} className="relative group">
              <button
                ref={(el) => { buttonRefs.current[i] = el; }}
                onClick={() => openPicker(i)}
                className={`h-7 w-7 rounded-full border-2 shadow-sm transition-all hover:scale-110 active:scale-95 ${
                  showPicker === i ? "border-accent ring-2 ring-accent/30 scale-110" : "border-border"
                }`}
                style={{ backgroundColor: color }}
                title={`Color ${i + 1}`}
              />
              {colors.length > 1 && showPicker !== i && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeColor(i); }}
                  className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
                  title="Eliminar este color"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          ))}
          {colors.length < max && (
            <button
              onClick={addColor}
              className="h-7 w-7 rounded-full border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-accent hover:text-accent transition-colors active:scale-95"
              title="Agregar color"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{colorLabel}</span>
      </div>

      {showPicker !== null && createPortal(
        <>
          <div className="fixed inset-0 z-[200]" onClick={() => cancelEdit(showPicker)} />
          <div
            ref={pickerRef}
            className="fixed z-[201] rounded-xl border bg-card p-3 shadow-2xl animate-fade-in-up"
            style={{ top: pickerPos.top, left: pickerPos.left, width: 280 }}
          >
            {/* Large live preview */}
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div
                  className="h-14 w-14 rounded-xl border-2 border-border shadow-inner"
                  style={{ backgroundColor: colors[showPicker] }}
                />
                {originalColor !== colors[showPicker] && (
                  <div
                    className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg border-2 border-card shadow"
                    style={{ backgroundColor: originalColor }}
                    title="Color original"
                  />
                )}
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Vista previa</div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={customHex}
                    onChange={(e) => {
                      setCustomHex(e.target.value);
                      if (hexValid(e.target.value)) {
                        previewColor(showPicker, e.target.value);
                      }
                    }}
                    onBlur={() => {
                      if (hexValid(customHex)) {
                        previewColor(showPicker, customHex);
                      } else {
                        setCustomHex(colors[showPicker]);
                      }
                    }}
                    className="flex-1 rounded-md border bg-background px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                    placeholder="#000000"
                  />
                  <button
                    onClick={() => toggleFavorite(colors[showPicker])}
                    className="p-1 text-muted-foreground hover:text-accent transition-colors"
                    title={isFavorite(colors[showPicker]) ? "Quitar de favoritos" : "Guardar como favorito"}
                  >
                    {isFavorite(colors[showPicker]) ? <Star className="h-4 w-4 fill-accent text-accent" /> : <Star className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Native fine color picker for exact selection */}
            <div className="mb-3">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Selector preciso</div>
              <input
                type="color"
                value={hexValid(colors[showPicker]) ? colors[showPicker] : "#888888"}
                onChange={(e) => previewColor(showPicker, e.target.value)}
                className="h-9 w-full cursor-pointer rounded-lg border bg-background p-1"
              />
            </div>

            {/* Preset grid */}
            <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Colores</div>
            <div className="grid grid-cols-10 gap-1 mb-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => previewColor(showPicker, preset)}
                  className={`h-5.5 w-5.5 aspect-square rounded-full border transition-all hover:scale-125 active:scale-95 ${
                    colors[showPicker]?.toLowerCase() === preset ? "border-accent ring-2 ring-accent/40 scale-110" : "border-border/60"
                  }`}
                  style={{ backgroundColor: preset }}
                />
              ))}
            </div>

            {/* Favorites */}
            {favorites.length > 0 && (
              <div className="mb-2">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Favoritos</div>
                <div className="flex flex-wrap gap-1">
                  {favorites.map((fav) => (
                    <button
                      key={fav}
                      onClick={() => previewColor(showPicker, fav)}
                      className={`h-5.5 w-5.5 aspect-square rounded-full border transition-all hover:scale-125 active:scale-95 ${
                        colors[showPicker]?.toLowerCase() === fav ? "border-accent ring-2 ring-accent/40 scale-110" : "border-border/60"
                      }`}
                      style={{ backgroundColor: fav }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Hue gradient slider */}
            <div className="mb-3">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Tono rápido</div>
              <div className="relative h-6 rounded-full overflow-hidden cursor-pointer"
                style={{ background: "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)" }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rect.left) / rect.width;
                  const hue = Math.round(x * 360);
                  const hex = hslToHex(hue, 80, 50);
                  previewColor(showPicker, hex);
                }}
              >
                <div className="absolute inset-0 rounded-full border border-border/30" />
              </div>
            </div>

            {/* Delete color */}
            {colors.length > 1 && (
              <button
                onClick={() => removeColor(showPicker)}
                className="flex items-center gap-1.5 w-full justify-center text-[11px] text-destructive hover:bg-destructive/10 transition-colors py-1.5 rounded-lg border border-destructive/30 mb-2"
              >
                <Trash2 className="h-3.5 w-3.5" /> Eliminar color del filamento
              </button>
            )}

            {/* Confirm / Cancel actions */}
            <div className="flex items-center gap-2 pt-1 border-t">
              <button
                onClick={() => cancelEdit(showPicker)}
                className="flex items-center justify-center gap-1.5 flex-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5 rounded-lg border"
              >
                <RotateCcw className="h-3 w-3" /> Cancelar
              </button>
              <button
                onClick={() => setShowPicker(null)}
                className="flex items-center justify-center gap-1.5 flex-1 text-[11px] font-semibold text-accent-foreground bg-accent hover:bg-accent/90 transition-colors py-1.5 rounded-lg"
              >
                <Check className="h-3.5 w-3.5" /> Aceptar
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

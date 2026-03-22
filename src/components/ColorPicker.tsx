import { Plus, X } from "lucide-react";
import { useState } from "react";

interface Props {
  colors: string[];
  onChange: (colors: string[]) => void;
  max?: number;
}

const PRESET_COLORS = [
  "#ffffff", "#000000", "#ee4444", "#f97316", "#eab308",
  "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
  "#a1a1aa", "#92400e", "#c9a84c", "#16a34a", "#1e3a5f",
];

export const ColorPicker = ({ colors, onChange, max = 15 }: Props) => {
  const [showPicker, setShowPicker] = useState<number | null>(null);

  const addColor = () => {
    if (colors.length >= max) return;
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
            <div key={i} className="relative">
              <button
                onClick={() => setShowPicker(showPicker === i ? null : i)}
                className="h-6 w-6 rounded-full border-2 border-border shadow-sm transition-transform hover:scale-110 active:scale-95"
                style={{ backgroundColor: color }}
                title={`Color ${i + 1}`}
              />
              {showPicker === i && (
                <div className="absolute top-8 left-0 z-50 rounded-lg border bg-card p-2 shadow-lg animate-fade-in-up">
                  <div className="grid grid-cols-5 gap-1 mb-2">
                    {PRESET_COLORS.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => { updateColor(i, preset); setShowPicker(null); }}
                        className={`h-6 w-6 rounded-full border transition-transform hover:scale-110 ${
                          color === preset ? "border-accent ring-1 ring-accent" : "border-border"
                        }`}
                        style={{ backgroundColor: preset }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => updateColor(i, e.target.value)}
                      className="h-6 w-6 rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => updateColor(i, e.target.value)}
                      className="flex-1 rounded border bg-background px-1.5 py-0.5 text-[10px] font-mono focus:outline-none"
                    />
                    {colors.length > 1 && (
                      <button onClick={() => removeColor(i)} className="text-muted-foreground hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
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

import { useState, useRef } from "react";
import { Download, Upload, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useSettings } from "@/lib/hooks";

const BACKUP_KEYS = [
  "calc3d_version",
  "calc3d_materials",
  "calc3d_projects",
  "calc3d_fabricated",
  "calc3d_settings",
  "calc3d_goal",
  "calc3d_fav_colors",
  "calc3d_expenses",
  "calc3d_clients",
  "photo_packages",
  "photo_extras",
  "photo_quotes",
  "photo_branding",
];

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { settings, updateSetting } = useSettings();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState("");

  const handleExport = () => {
    const data: Record<string, any> = {};
    for (const key of BACKUP_KEYS) {
      const val = localStorage.getItem(key);
      if (val) data[key] = JSON.parse(val);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calc3d_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        for (const key of BACKUP_KEYS) {
          if (data[key] !== undefined) {
            localStorage.setItem(key, JSON.stringify(data[key]));
          }
        }
        setImportMsg("✅ Respaldo restaurado. Recarga la app para ver los cambios.");
      } catch {
        setImportMsg("❌ Error: archivo inválido.");
      }
    };
    reader.readAsText(file);
  };

  const themes = [
    { value: "light", icon: Sun, label: "Claro" },
    { value: "dark", icon: Moon, label: "Oscuro" },
    { value: "system", icon: Monitor, label: "Sistema" },
  ];

  return (
    <div className="min-h-screen px-4 py-8 md:py-16">
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>

        {/* Theme */}
        <div className="rounded-xl bg-card border p-4 space-y-3">
          <h2 className="text-sm font-semibold">Tema</h2>
          <div className="flex gap-2">
            {themes.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex-1 flex flex-col items-center gap-1.5 rounded-lg border py-3 text-xs font-medium transition-colors ${
                  theme === value ? "border-accent bg-accent/10 text-accent" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Cost parameters */}
        <div className="rounded-xl bg-card border p-4 space-y-3">
          <h2 className="text-sm font-semibold">Parámetros de costeo</h2>
          <div className="space-y-3">
            <SettingRow label="Electricidad (CLP/kWh)" value={settings.electricityCostKwh} onChange={(v) => updateSetting("electricityCostKwh", v)} />
            <SettingRow label="Consumo impresora (watts)" value={settings.printerWatts} onChange={(v) => updateSetting("printerWatts", v)} />
            <SettingRow label="Tarifa por hora (CLP/hr)" value={settings.hourlyRate} onChange={(v) => updateSetting("hourlyRate", v)} />
            <SettingRow label="Margen de ganancia (%)" value={settings.marginPercent} onChange={(v) => updateSetting("marginPercent", v)} />
          </div>
        </div>

        {/* Backup */}
        <div className="rounded-xl bg-card border p-4 space-y-3">
          <h2 className="text-sm font-semibold">Respaldo de datos</h2>
          <p className="text-xs text-muted-foreground">Exporta tus datos como archivo JSON para tener una copia de seguridad. Puedes restaurarla en cualquier dispositivo.</p>
          <div className="flex gap-2">
            <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-accent text-accent-foreground py-2.5 text-xs font-medium hover:bg-accent/90 active:scale-[0.97] transition-all">
              <Download className="h-4 w-4" /> Exportar
            </button>
            <button onClick={() => fileRef.current?.click()} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-xs font-medium hover:bg-secondary/50 transition-colors">
              <Upload className="h-4 w-4" /> Importar
            </button>
          </div>
          {importMsg && <p className="text-xs">{importMsg}</p>}
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleImport(e.target.files[0]); e.target.value = ""; }} />
        </div>
      </div>
    </div>
  );
};

const SettingRow = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
  <div className="flex items-center justify-between gap-3">
    <label className="text-xs text-muted-foreground">{label}</label>
    <input
      type="number"
      min="0"
      value={value || ""}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className="w-24 rounded-md border bg-background px-2 py-1.5 text-sm font-mono text-right focus:outline-none focus:ring-1 focus:ring-accent"
    />
  </div>
);

export default Settings;

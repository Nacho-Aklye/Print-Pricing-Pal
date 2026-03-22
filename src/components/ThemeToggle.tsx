import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

const modes = [
  { value: "light", icon: Sun, label: "Claro" },
  { value: "dark", icon: Moon, label: "Oscuro" },
  { value: "system", icon: Monitor, label: "Sistema" },
] as const;

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-0.5 rounded-lg border bg-card p-0.5">
      {modes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className={`rounded-md p-1.5 transition-colors active:scale-[0.95] ${
            theme === value
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
};

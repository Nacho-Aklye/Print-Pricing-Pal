import { NavLink } from "react-router-dom";
import { Calculator, Palette, FolderOpen } from "lucide-react";

const tabs = [
  { to: "/3d", icon: Calculator, label: "Calcular", end: true },
  { to: "/3d/materiales", icon: Palette, label: "Materiales" },
  { to: "/3d/proyectos", icon: FolderOpen, label: "Proyectos" },
];

export const Print3DNav = () => (
  <div className="flex gap-1 p-1 rounded-xl bg-muted/60 mb-5">
    {tabs.map(({ to, icon: Icon, label, end }) => (
      <NavLink
        key={to}
        to={to}
        end={end}
        className={({ isActive }) =>
          `flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
            isActive
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`
        }
      >
        <Icon className="h-3.5 w-3.5" />
        {label}
      </NavLink>
    ))}
  </div>
);

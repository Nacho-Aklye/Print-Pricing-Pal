import { Calculator, Palette, FolderOpen } from "lucide-react";
import { NavLink } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { to: "/", icon: Calculator, label: "Calcular" },
  { to: "/materiales", icon: Palette, label: "Materiales" },
  { to: "/proyectos", icon: FolderOpen, label: "Proyectos" },
];

export const BottomNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-md safe-area-pb">
    <div className="mx-auto max-w-xl flex items-center justify-around px-4 py-1.5">
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-colors active:scale-[0.95] ${
              isActive ? "text-accent" : "text-muted-foreground hover:text-foreground"
            }`
          }
        >
          <Icon className="h-5 w-5" />
          <span className="text-[10px] font-medium">{label}</span>
        </NavLink>
      ))}
      <div className="flex flex-col items-center gap-0.5">
        <ThemeToggle />
      </div>
    </div>
  </nav>
);

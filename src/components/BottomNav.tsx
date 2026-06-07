import { LayoutDashboard, Printer, Camera, BarChart3, Users, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", icon: LayoutDashboard, label: "Inicio", end: true },
  { to: "/3d", icon: Printer, label: "3D" },
  { to: "/foto", icon: Camera, label: "Foto" },
  { to: "/ia", icon: Sparkles, label: "IA Diseño" },
  { to: "/clientes", icon: Users, label: "Clientes" },
  { to: "/finanzas", icon: BarChart3, label: "Finanzas" },
];

export const BottomNav = () => (
  <nav className="fixed left-0 top-0 bottom-0 z-50 w-16 border-r border-border bg-card flex flex-col items-center py-3 gap-2">
    {/* Logo */}
    <div
      className="mb-3 h-10 w-10 rounded-xl flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, hsl(247 100% 71%), hsl(168 100% 42%))" }}
    >
      <Printer className="h-5 w-5 text-white" />
    </div>

    {links.map(({ to, icon: Icon, label, end }) => (
      <NavLink
        key={to}
        to={to}
        end={end}
        title={label}
        className={({ isActive }) =>
          `h-10 w-10 rounded-[10px] flex items-center justify-center transition-all active:scale-[0.92] ${
            isActive
              ? "bg-sidebar-accent text-primary border border-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-card-secondary"
          }`
        }
      >
        <Icon className="h-5 w-5" />
      </NavLink>
    ))}
  </nav>
);

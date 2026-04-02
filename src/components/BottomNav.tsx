import { LayoutDashboard, Printer, Camera, BarChart3, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", icon: LayoutDashboard, label: "Inicio", end: true },
  { to: "/3d", icon: Printer, label: "3D" },
  { to: "/foto", icon: Camera, label: "Foto" },
  { to: "/finanzas", icon: BarChart3, label: "Finanzas" },
  { to: "/ajustes", icon: Settings, label: "Ajustes" },
];

export const BottomNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-md safe-area-pb">
    <div className="mx-auto max-w-xl flex items-center justify-around px-2 py-1.5">
      {links.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all active:scale-[0.92] ${
              isActive ? "text-accent" : "text-muted-foreground hover:text-foreground"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-lg transition-colors ${isActive ? "bg-accent/10" : ""}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  </nav>
);

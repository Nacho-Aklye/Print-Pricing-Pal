import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNav } from "@/components/BottomNav";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import Materials from "./pages/Materials";
import Projects from "./pages/Projects";
import Finances from "./pages/Finances";
import Photography from "./pages/Photography";
import Clients from "./pages/Clients";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="pb-20">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/3d" element={<Index />} />
              <Route path="/3d/materiales" element={<Materials />} />
              <Route path="/3d/proyectos" element={<Projects />} />
              <Route path="/finanzas" element={<Finances />} />
              <Route path="/foto" element={<Photography />} />
              <Route path="/clientes" element={<Clients />} />
              <Route path="/ajustes" element={<Settings />} />
              {/* Legacy redirects */}
              <Route path="/materiales" element={<Materials />} />
              <Route path="/proyectos" element={<Projects />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <BottomNav />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;

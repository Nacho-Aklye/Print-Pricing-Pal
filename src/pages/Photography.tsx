import { Camera, Package, FileText, Users } from "lucide-react";

const Photography = () => {
  const features = [
    { icon: Package, title: "Paquetes y cotizaciones", desc: "Crea paquetes predefinidos o cotizaciones detalladas para tus clientes." },
    { icon: FileText, title: "PDF con branding", desc: "Genera cotizaciones profesionales en PDF con tu logo y colores." },
    { icon: Users, title: "Gestión de clientes", desc: "Mantén un registro completo de tus clientes y su historial." },
  ];

  return (
    <div className="min-h-screen px-4 py-6 md:py-12">
      <div className="mx-auto max-w-xl">
        <div className="text-center py-12 animate-fade-in-up">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Camera className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Fotografía de Producto</h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Este módulo está en desarrollo. Pronto podrás gestionar tus trabajos de fotografía, crear cotizaciones y llevar tus finanzas fotográficas.
          </p>
        </div>

        <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lo que viene</h2>
          {features.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="rounded-xl bg-card border p-4 flex gap-3 animate-fade-in-up"
              style={{ animationDelay: `${150 + i * 60}ms` }}
            >
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Photography;

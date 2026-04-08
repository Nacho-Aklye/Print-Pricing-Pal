import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid, LineChart, Line,
} from "recharts";
import { format, startOfMonth, eachMonthOfInterval, isWithinInterval, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import type { FabricatedProject, Expense } from "@/lib/types";
import { formatCLP, EXPENSE_SOURCE_LABELS, ALL_EXPENSE_CATEGORIES } from "@/lib/types";

interface EvolutionChartProps {
  fabricated: FabricatedProject[];
  expenses: Expense[];
}

const CHART_COLORS = [
  "hsl(160, 50%, 40%)", // accent
  "hsl(0, 65%, 52%)",   // destructive
  "hsl(45, 93%, 47%)",  // warning
  "hsl(220, 60%, 50%)", // blue
  "hsl(280, 50%, 50%)", // purple
  "hsl(30, 70%, 50%)",  // orange
];

export const EvolutionChart = ({ fabricated, expenses }: EvolutionChartProps) => {
  const data = useMemo(() => {
    const allDates = [
      ...fabricated.map((f) => f.date),
      ...expenses.map((e) => e.date),
    ];
    if (allDates.length === 0) return [];

    const min = Math.min(...allDates);
    const max = Math.max(...allDates);
    const months = eachMonthOfInterval({ start: new Date(min), end: new Date(max) });

    return months.map((monthStart) => {
      const monthEnd = endOfMonth(monthStart);
      const interval = { start: monthStart, end: monthEnd };

      const revenue = fabricated
        .filter((f) => isWithinInterval(new Date(f.date), interval))
        .reduce((s, f) => s + f.salePrice, 0);

      const cost = expenses
        .filter((e) => isWithinInterval(new Date(e.date), interval))
        .reduce((s, e) => s + e.amount, 0) +
        fabricated
          .filter((f) => isWithinInterval(new Date(f.date), interval))
          .reduce((s, f) => s + f.cost, 0);

      return {
        month: format(monthStart, "MMM yy", { locale: es }),
        Ingresos: Math.round(revenue),
        Gastos: Math.round(cost),
        Ganancia: Math.round(revenue - cost),
      };
    });
  }, [fabricated, expenses]);

  if (data.length === 0) return null;

  return (
    <div className="rounded-xl bg-card border p-4 space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Evolución mensual
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
            <YAxis tick={{ fontSize: 9 }} className="fill-muted-foreground" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value: number) => formatCLP(value)}
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                fontSize: "11px",
              }}
            />
            <Bar dataKey="Ingresos" fill="hsl(160, 50%, 40%)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Gastos" fill="hsl(0, 65%, 52%)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface ProfitLineProps {
  fabricated: FabricatedProject[];
  expenses: Expense[];
}

export const ProfitLineChart = ({ fabricated, expenses }: ProfitLineProps) => {
  const data = useMemo(() => {
    const allDates = [...fabricated.map((f) => f.date), ...expenses.map((e) => e.date)];
    if (allDates.length === 0) return [];
    const min = Math.min(...allDates);
    const max = Math.max(...allDates);
    const months = eachMonthOfInterval({ start: new Date(min), end: new Date(max) });

    let cumulative = 0;
    return months.map((monthStart) => {
      const monthEnd = endOfMonth(monthStart);
      const interval = { start: monthStart, end: monthEnd };
      const rev = fabricated.filter((f) => isWithinInterval(new Date(f.date), interval)).reduce((s, f) => s + f.salePrice, 0);
      const cost = expenses.filter((e) => isWithinInterval(new Date(e.date), interval)).reduce((s, e) => s + e.amount, 0) +
        fabricated.filter((f) => isWithinInterval(new Date(f.date), interval)).reduce((s, f) => s + f.cost, 0);
      cumulative += rev - cost;
      return {
        month: format(monthStart, "MMM yy", { locale: es }),
        Acumulado: Math.round(cumulative),
      };
    });
  }, [fabricated, expenses]);

  if (data.length < 2) return null;

  return (
    <div className="rounded-xl bg-card border p-4 space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Ganancia acumulada
      </h3>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
            <YAxis tick={{ fontSize: 9 }} className="fill-muted-foreground" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value: number) => formatCLP(value)}
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                fontSize: "11px",
              }}
            />
            <Line type="monotone" dataKey="Acumulado" stroke="hsl(160, 50%, 40%)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface ExpenseBreakdownProps {
  expenses: Expense[];
}

export const ExpenseBreakdownChart = ({ expenses }: ExpenseBreakdownProps) => {
  const data = useMemo(() => {
    if (expenses.length === 0) return [];
    const bySource: Record<string, number> = {};
    for (const e of expenses) {
      const label = EXPENSE_SOURCE_LABELS[e.source || "3d"];
      bySource[label] = (bySource[label] || 0) + e.amount;
    }
    return Object.entries(bySource).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [expenses]);

  const categoryData = useMemo(() => {
    if (expenses.length === 0) return [];
    const byCat: Record<string, number> = {};
    for (const e of expenses) {
      const label = ALL_EXPENSE_CATEGORIES.find((c) => c.value === e.category)?.label || e.category;
      byCat[label] = (byCat[label] || 0) + e.amount;
    }
    return Object.entries(byCat)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [expenses]);

  if (data.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl bg-card border p-4 space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Gastos por área
        </h3>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={45}
                innerRadius={25}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCLP(value)}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  fontSize: "10px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-1">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="text-muted-foreground">{d.name}</span>
              </div>
              <span className="font-mono">{formatCLP(d.value)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-card border p-4 space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Top categorías
        </h3>
        <div className="space-y-2 mt-2">
          {categoryData.map((d, i) => {
            const maxVal = categoryData[0]?.value || 1;
            return (
              <div key={d.name} className="space-y-0.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground truncate max-w-[70%]">{d.name}</span>
                  <span className="font-mono">{formatCLP(d.value)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(d.value / maxVal) * 100}%`,
                      backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

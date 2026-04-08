import { useMemo } from "react";
import { startOfMonth, subMonths, startOfYear, isAfter } from "date-fns";

export type Period = "month" | "3months" | "year" | "all";

const PERIOD_LABELS: Record<Period, string> = {
  month: "Este mes",
  "3months": "3 meses",
  year: "Este año",
  all: "Todo",
};

interface PeriodFilterProps {
  value: Period;
  onChange: (p: Period) => void;
}

export const PeriodFilter = ({ value, onChange }: PeriodFilterProps) => (
  <div className="flex gap-1">
    {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
      <button
        key={p}
        onClick={() => onChange(p)}
        className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
          value === p
            ? "bg-accent text-accent-foreground"
            : "bg-muted text-muted-foreground hover:text-foreground"
        }`}
      >
        {PERIOD_LABELS[p]}
      </button>
    ))}
  </div>
);

export function getStartDate(period: Period): Date | null {
  const now = new Date();
  switch (period) {
    case "month": return startOfMonth(now);
    case "3months": return startOfMonth(subMonths(now, 2));
    case "year": return startOfYear(now);
    case "all": return null;
  }
}

export function filterByPeriod<T extends { date: number }>(items: T[], period: Period): T[] {
  const start = getStartDate(period);
  if (!start) return items;
  return items.filter((i) => isAfter(new Date(i.date), start));
}

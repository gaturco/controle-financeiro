import { useGetMonthlySummary, getGetMonthlySummaryQueryKey } from "@workspace/api-client-react";
import { formatCurrency, formatMonthYear } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMonth } from "@/hooks/use-month";
import { PersonBadge } from "@/components/badges";

const CATEGORY_LABELS: Record<string, string> = {
  obra: "Obra", alimentacao: "Alimentação", transporte: "Transporte", saude: "Saúde",
  educacao: "Educação", lazer: "Lazer", cartao_credito: "Cartão de Crédito", outros: "Outros",
};

const CATEGORY_COLORS: Record<string, string> = {
  obra: "bg-amber-400",
  alimentacao: "bg-green-400",
  transporte: "bg-sky-400",
  saude: "bg-rose-400",
  educacao: "bg-indigo-400",
  lazer: "bg-pink-400",
  cartao_credito: "bg-orange-400",
  outros: "bg-zinc-400",
};

export default function Dashboard() {
  const { month, year } = useMonth();

  const { data: summary, isLoading } = useGetMonthlySummary(
    { month, year },
    { query: { queryKey: getGetMonthlySummaryQueryKey({ month, year }) } }
  );

  const totalBar = summary ? summary.totalExpenses : 0;

  if (isLoading) {
    return (
      <div className="space-y-4 pt-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <h1 className="text-xl font-bold tracking-tight capitalize">
        {formatMonthYear(month, year)}
      </h1>

      {summary ? (
        <>
          {/* Balance hero */}
          <Card className={`${summary.balance >= 0 ? "border-primary/40 bg-primary/10" : "border-destructive/40 bg-destructive/10"}`}>
            <CardContent className="pt-5 pb-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Saldo do mês</p>
              <p className={`text-4xl font-bold ${summary.balance >= 0 ? "text-primary" : "text-destructive"}`}>
                {formatCurrency(summary.balance)}
              </p>
            </CardContent>
          </Card>

          {/* Receitas / Despesas */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground mb-1">Receitas</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(summary.totalIncome)}</p>
              </CardContent>
            </Card>
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground mb-1">Despesas</p>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(summary.totalExpenses)}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Fixas {formatCurrency(summary.fixedTotal)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Obra highlight */}
          {summary.obraTotal > 0 && (
            <Card className="border-amber-500/30 bg-amber-500/10">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-amber-400/80 mb-1 font-medium">Obra este mês</p>
                <p className="text-2xl font-bold text-amber-400">{formatCurrency(summary.obraTotal)}</p>
              </CardContent>
            </Card>
          )}

          {/* Gastos por categoria */}
          {summary.expensesByCategory.length > 0 && (
            <Card>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-semibold">Gastos por categoria</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-3.5">
                  {summary.expensesByCategory
                    .sort((a, b) => b.total - a.total)
                    .map(cat => {
                      const pct = totalBar > 0 ? (cat.total / totalBar) * 100 : 0;
                      const barColor = CATEGORY_COLORS[cat.category] ?? "bg-zinc-400";
                      return (
                        <div key={cat.category}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm">{CATEGORY_LABELS[cat.category] ?? cat.category}</span>
                            <span className="text-sm font-semibold">{formatCurrency(cat.total)}</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Receitas por pessoa */}
          {summary.incomeByPerson.length > 0 && (
            <Card>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-semibold">Receitas por pessoa</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-3">
                  {summary.incomeByPerson.map(p => (
                    <div key={p.category} className="flex items-center justify-between">
                      <PersonBadge person={p.category} />
                      <span className="text-sm font-semibold text-primary">{formatCurrency(p.total)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {summary.expensesByCategory.length === 0 && summary.totalIncome === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Nenhum lançamento registrado neste mês.
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

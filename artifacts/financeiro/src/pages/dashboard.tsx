import { useGetMonthlySummary, getGetMonthlySummaryQueryKey } from "@workspace/api-client-react";
import { formatCurrency, formatMonthYear } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Dashboard() {
  const [date, setDate] = useState(new Date());
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const { data: summary, isLoading } = useGetMonthlySummary(
    { month, year },
    { query: { queryKey: getGetMonthlySummaryQueryKey({ month, year }) } }
  );

  const prevMonth = () => setDate(new Date(year, month - 2));
  const nextMonth = () => setDate(new Date(year, month));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Resumo Mensal</h1>
        <div className="flex items-center gap-4 bg-card px-4 py-2 rounded-full border">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium text-lg capitalize w-32 text-center">
            {formatMonthYear(month, year)}
          </span>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Receitas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{formatCurrency(summary.totalIncome)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">{formatCurrency(summary.totalExpenses)}</div>
                <div className="text-sm text-muted-foreground mt-1 flex gap-2">
                  <span>Fixas: {formatCurrency(summary.fixedTotal)}</span>
                  <span>Var: {formatCurrency(summary.variableTotal)}</span>
                </div>
              </CardContent>
            </Card>
            <Card className={summary.balance >= 0 ? "border-primary/50 bg-primary/5" : "border-destructive/50 bg-destructive/5"}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Saldo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${summary.balance >= 0 ? "text-primary" : "text-destructive"}`}>
                  {formatCurrency(summary.balance)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gastos por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                {summary.expensesByCategory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Nenhum gasto registrado.</div>
                ) : (
                  <div className="space-y-4">
                    {summary.expensesByCategory.map((cat) => (
                      <div key={cat.category} className="flex items-center justify-between">
                        <span className="font-medium capitalize">{cat.category.replace('_', ' ')}</span>
                        <span className="text-muted-foreground">{formatCurrency(cat.total)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Obra</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(summary.obraTotal)}</div>
                <p className="text-muted-foreground text-sm mt-2">Investimento no mês atual</p>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}

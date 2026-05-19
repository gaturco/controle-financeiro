import { useGetObraSummary, getGetObraSummaryQueryKey } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { PaymentBadge, InstallmentBadge } from "@/components/badges";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function monthName(m: number, y: number) {
  return new Date(y, m - 1).toLocaleString("pt-BR", { month: "short", year: "2-digit" });
}

export default function Obra() {
  const { data: summary, isLoading } = useGetObraSummary({ query: { queryKey: getGetObraSummaryQueryKey() } });

  return (
    <div className="space-y-4 pt-2">
      <h1 className="text-xl font-bold tracking-tight">Gestão da Obra</h1>

      {isLoading ? (
        <>
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </>
      ) : summary ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-primary/30 bg-primary/10 hover:bg-primary/15 transition-all duration-150">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground mb-1">Total investido</p>
                <p className="text-lg font-bold text-primary whitespace-nowrap">{formatCurrency(summary.totalInvested)}</p>
              </CardContent>
            </Card>
            <Card className="border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15 transition-all duration-150">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-amber-400/80 mb-1">Parcelas / mês</p>
                <p className="text-lg font-bold text-amber-400 whitespace-nowrap">{formatCurrency(summary.monthlyCommitment)}</p>
              </CardContent>
            </Card>
          </div>

          {summary.items.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">Todos os itens</p>
              {summary.items.map(item => (
                <Card key={item.id} className="border-border/50 hover:border-border hover:bg-muted/20 transition-all duration-150 cursor-default">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate mb-2">{item.description}</p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.isInstallment ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-amber-500/20 text-amber-300 border-amber-500/30">
                              Parcelado
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-zinc-500/20 text-zinc-300 border-zinc-500/30">
                              À vista
                            </span>
                          )}
                          {item.isInstallment && <InstallmentBadge total={item.totalInstallments} />}
                          {item.paymentMethod && <PaymentBadge method={item.paymentMethod} />}
                          <span className="text-[10px] text-muted-foreground">desde {monthName(item.startMonth, item.startYear)}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-sm">{formatCurrency(item.amount)}</p>
                        {item.isInstallment && (
                          <p className="text-[10px] text-amber-400 font-semibold mt-0.5">{formatCurrency(item.monthlyAmount)}/mês</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground text-sm">Nenhum gasto de obra registrado ainda.</div>
          )}
        </>
      ) : null}
    </div>
  );
}

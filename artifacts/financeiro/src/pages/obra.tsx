import { useGetObraSummary, getGetObraSummaryQueryKey } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const PAYMENT_LABELS: Record<string, string> = {
  credito: "Crédito",
  debito: "Débito",
  pix: "Pix",
  dinheiro: "Dinheiro",
};

function monthName(m: number, y: number) {
  return new Date(y, m - 1).toLocaleString("pt-BR", { month: "short", year: "2-digit" });
}

export default function Obra() {
  const { data: summary, isLoading } = useGetObraSummary({
    query: { queryKey: getGetObraSummaryQueryKey() },
  });

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
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground mb-1">Total investido</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(summary.totalInvested)}</p>
              </CardContent>
            </Card>
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-amber-700 mb-1">Parcelas / mês</p>
                <p className="text-2xl font-bold text-amber-800">{formatCurrency(summary.monthlyCommitment)}</p>
              </CardContent>
            </Card>
          </div>

          {summary.items.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Todos os itens</p>
              {summary.items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.description}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            item.isInstallment
                              ? "bg-amber-100 text-amber-700"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {item.isInstallment
                              ? `Parcelado ${item.totalInstallments}x`
                              : "À vista"}
                          </span>
                          {item.paymentMethod && (
                            <span className="text-[10px] text-muted-foreground">
                              {PAYMENT_LABELS[item.paymentMethod] ?? item.paymentMethod}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            desde {monthName(item.startMonth, item.startYear)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-sm">{formatCurrency(item.amount)}</p>
                        {item.isInstallment && (
                          <p className="text-[10px] text-amber-700 font-medium">
                            {formatCurrency(item.monthlyAmount)}/mês
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground text-sm">
              Nenhum gasto de obra registrado ainda.
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

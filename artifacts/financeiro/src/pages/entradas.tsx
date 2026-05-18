import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListIncomes, getListIncomesQueryKey,
  useCreateIncome, useDeleteIncome,
  getGetMonthlySummaryQueryKey,
} from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { useMonth } from "@/hooks/use-month";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

const PERSON_LABELS: Record<string, string> = {
  gabriel: "Gabriel",
  fernanda: "Fernanda",
};

const TYPE_LABELS: Record<string, string> = {
  salario: "Salário",
  bonus: "Bônus",
  plr: "PLR",
  decimo_terceiro: "13° Salário",
  outro: "Outro",
};

const INCOME_TYPES = ["salario", "bonus", "plr", "decimo_terceiro", "outro"];

interface IncomeFormData {
  person: string;
  type: string;
  description: string;
  amount: string;
  month: number;
  year: number;
}

export default function Entradas() {
  const { month, year } = useMonth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<IncomeFormData>({
    person: "gabriel",
    type: "salario",
    description: "",
    amount: "",
    month,
    year,
  });

  const params = { month, year };
  const { data: incomes, isLoading } = useListIncomes(params, {
    query: { queryKey: getListIncomesQueryKey(params) },
  });

  const createMutation = useCreateIncome();
  const deleteMutation = useDeleteIncome();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListIncomesQueryKey(params) });
    queryClient.invalidateQueries({ queryKey: getGetMonthlySummaryQueryKey(params) });
  };

  const openSheet = () => {
    setForm({ person: "gabriel", type: "salario", description: "", amount: "", month, year });
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.description) return;
    createMutation.mutate(
      {
        data: {
          person: form.person,
          type: form.type,
          description: form.description,
          amount: Number(form.amount),
          month: form.month,
          year: form.year,
        },
      },
      {
        onSuccess: () => {
          invalidate();
          setOpen(false);
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm("Remover esta entrada?")) return;
    deleteMutation.mutate({ id }, { onSuccess: invalidate });
  };

  const total = incomes?.reduce((s, i) => s + i.amount, 0) ?? 0;

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Entradas</h1>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm" onClick={openSheet}>
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle>Nova Entrada</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Pessoa</Label>
                <div className="grid grid-cols-2 gap-2">
                  {["gabriel", "fernanda"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, person: p }))}
                      className={`py-2 rounded-lg border text-sm font-medium transition-colors ${
                        form.person === p
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {PERSON_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INCOME_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Descrição</Label>
                <Input
                  placeholder="Ex: Salário março"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Mês</Label>
                  <Select
                    value={String(form.month)}
                    onValueChange={(v) => setForm((f) => ({ ...f, month: Number(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <SelectItem key={m} value={String(m)}>
                          {new Date(2000, m - 1).toLocaleString("pt-BR", { month: "long" })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Ano</Label>
                  <Input
                    type="number"
                    value={form.year}
                    onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {total > 0 && (
        <Card className="bg-primary/5 border-primary/30">
          <CardContent className="py-3 px-4">
            <p className="text-xs text-muted-foreground">Total do mês</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(total)}</p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : incomes && incomes.length > 0 ? (
        <div className="space-y-2">
          {incomes.map((income) => (
            <Card key={income.id}>
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{income.description}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {PERSON_LABELS[income.person] ?? income.person} · {TYPE_LABELS[income.type] ?? income.type}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-2">
                  <span className="font-bold text-primary">{formatCurrency(income.amount)}</span>
                  <button
                    onClick={() => handleDelete(income.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Nenhuma entrada registrada neste mês.
        </div>
      )}
    </div>
  );
}

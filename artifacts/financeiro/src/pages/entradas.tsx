import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListIncomes, getListIncomesQueryKey,
  useCreateIncome, useDeleteIncome,
  getGetMonthlySummaryQueryKey,
} from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { useMonth } from "@/hooks/use-month";
import { PersonBadge, IncomeBadge } from "@/components/badges";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

const INCOME_TYPES = ["salario", "bonus", "plr", "decimo_terceiro", "outro"];
const TYPE_LABELS: Record<string, string> = {
  salario: "Salário", bonus: "Bônus", plr: "PLR", decimo_terceiro: "13° Salário", outro: "Outro",
};

interface IncomeFormData {
  person: string; type: string; description: string; amount: string; month: number; year: number;
}

export default function Entradas() {
  const { month, year } = useMonth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<IncomeFormData>({ person: "gabriel", type: "salario", description: "", amount: "", month, year });

  const params = { month, year };
  const { data: incomes, isLoading } = useListIncomes(params, { query: { queryKey: getListIncomesQueryKey(params) } });
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
      { data: { person: form.person, type: form.type, description: form.description, amount: Number(form.amount), month: form.month, year: form.year } },
      { onSuccess: () => { invalidate(); setOpen(false); } }
    );
  };

  const handleDelete = (id: number) => setDeleteId(id);

  const confirmDelete = () => {
    if (deleteId === null) return;
    deleteMutation.mutate({ id: deleteId }, {
      onSuccess: () => { invalidate(); setDeleteId(null); },
      onError: () => setDeleteId(null),
    });
  };

  const total = incomes?.reduce((s, i) => s + i.amount, 0) ?? 0;
  const gabrielTotal = incomes?.filter(i => i.person === "gabriel").reduce((s, i) => s + i.amount, 0) ?? 0;
  const fernandaTotal = incomes?.filter(i => i.person === "fernanda").reduce((s, i) => s + i.amount, 0) ?? 0;

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Entradas</h1>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm" onClick={openSheet}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar
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
                    <button key={p} type="button" onClick={() => setForm(f => ({ ...f, person: p }))}
                      className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${form.person === p ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                      {p === "gabriel" ? "Gabriel" : "Fernanda"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INCOME_TYPES.map(t => <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Descrição</Label>
                <Input placeholder="Ex: Salário maio" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
              </div>

              <div className="space-y-1.5">
                <Label>Valor (R$)</Label>
                <Input type="number" step="0.01" min="0" placeholder="0,00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Mês</Label>
                  <Select value={String(form.month)} onValueChange={(v) => setForm(f => ({ ...f, month: Number(v) }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <SelectItem key={m} value={String(m)}>{new Date(2000, m - 1).toLocaleString("pt-BR", { month: "long" })}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Ano</Label>
                  <Input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))} />
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
        <>
          <Card className="border-primary/30 bg-primary/10">
            <CardContent className="py-4 px-4">
              <p className="text-xs text-muted-foreground mb-1">Total do mês</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(total)}</p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-2">
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-2 mb-1">
                  <PersonBadge person="gabriel" />
                </div>
                <p className="text-lg font-bold text-blue-300">{formatCurrency(gabrielTotal)}</p>
              </CardContent>
            </Card>
            <Card className="border-purple-500/20 bg-purple-500/5">
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-2 mb-1">
                  <PersonBadge person="fernanda" />
                </div>
                <p className="text-lg font-bold text-purple-300">{formatCurrency(fernandaTotal)}</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
      ) : incomes && incomes.length > 0 ? (
        <div className="space-y-2">
          {incomes.map(income => (
            <Card key={income.id} className="group border-border/50 hover:border-border hover:bg-muted/20 transition-all duration-150 cursor-default">
              <CardContent className="py-3 px-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate mb-1.5">{income.description}</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <PersonBadge person={income.person} />
                    <IncomeBadge type={income.type} />
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-primary text-sm">{formatCurrency(income.amount)}</span>
                  <button onClick={() => handleDelete(income.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1 opacity-40 group-hover:opacity-100">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground text-sm">Nenhuma entrada registrada neste mês.</div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Remover entrada"
        description="Essa ação não pode ser desfeita. Deseja remover esta entrada?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

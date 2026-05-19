import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListExpenses, getListExpensesQueryKey,
  useCreateExpense, useDeleteExpense,
  getGetMonthlySummaryQueryKey,
} from "@workspace/api-client-react";
import { formatCurrency, formatDate, todayAsIso } from "@/lib/format";
import { useMonth } from "@/hooks/use-month";
import { CategoryBadge, TypeBadge, PaymentBadge, InstallmentBadge } from "@/components/badges";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

const CATEGORIES = ["obra", "alimentacao", "transporte", "saude", "educacao", "lazer", "cartao_credito", "outros"];
const CATEGORY_LABELS: Record<string, string> = {
  obra: "Obra", alimentacao: "Alimentação", transporte: "Transporte", saude: "Saúde",
  educacao: "Educação", lazer: "Lazer", cartao_credito: "Cartão de Crédito", outros: "Outros",
};
const PAYMENT_METHODS = [
  { value: "credito", label: "Crédito" }, { value: "debito", label: "Débito" },
  { value: "pix", label: "Pix" }, { value: "dinheiro", label: "Dinheiro" },
];

interface ExpenseFormData {
  description: string; amount: string; category: string; expenseType: string;
  paymentMethod: string; isInstallment: boolean;
  totalInstallments: string; month: number; year: number; startMonth: number; startYear: number;
  date: string;
}

export default function Gastos() {
  const { month, year } = useMonth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<ExpenseFormData>({
    description: "", amount: "", category: "alimentacao", expenseType: "variavel",
    paymentMethod: "credito", isInstallment: false, totalInstallments: "",
    month, year, startMonth: month, startYear: year, date: todayAsIso(),
  });

  const params = { month, year };
  const { data: expenses, isLoading } = useListExpenses(params, { query: { queryKey: getListExpensesQueryKey(params) } });
  const createMutation = useCreateExpense();
  const deleteMutation = useDeleteExpense();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListExpensesQueryKey(params) });
    queryClient.invalidateQueries({ queryKey: getGetMonthlySummaryQueryKey(params) });
  };

  const openSheet = () => {
    setForm({
      description: "", amount: "", category: "alimentacao", expenseType: "variavel",
      paymentMethod: "credito", isInstallment: false, totalInstallments: "",
      month, year, startMonth: month, startYear: year, date: todayAsIso(),
    });
    setOpen(true);
  };

  const monthlyPreview = form.isInstallment && form.totalInstallments && Number(form.amount) > 0
    ? Number(form.amount) / Number(form.totalInstallments) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.description) return;
    const isObra = form.category === "obra";
    createMutation.mutate(
      {
        data: {
          description: form.description,
          amount: Number(form.amount),
          category: form.category,
          expenseType: form.expenseType,
          paymentMethod: form.paymentMethod || undefined,
          isInstallment: isObra ? form.isInstallment : false,
          totalInstallments: isObra && form.isInstallment ? Number(form.totalInstallments) : undefined,
          month: form.month,
          year: form.year,
          startMonth: form.startMonth,
          startYear: form.startYear,
          date: form.date,
        },
      },
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

  const total = expenses?.reduce((s, e) => s + (e.monthlyAmount ?? e.amount), 0) ?? 0;
  const fixedTotal = expenses?.filter(e => e.expenseType === "fixo").reduce((s, e) => s + (e.monthlyAmount ?? e.amount), 0) ?? 0;
  const varTotal = expenses?.filter(e => e.expenseType === "variavel").reduce((s, e) => s + (e.monthlyAmount ?? e.amount), 0) ?? 0;
  const isObra = form.category === "obra";

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Gastos</h1>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm" onClick={openSheet}><Plus className="h-4 w-4 mr-1" />Adicionar</Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[92vh] overflow-y-auto">
            <SheetHeader className="mb-4"><SheetTitle>Novo Gasto</SheetTitle></SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pb-4">
              <div className="space-y-1.5">
                <Label>Descrição</Label>
                <Input placeholder="Ex: Supermercado" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
              </div>

              <div className="space-y-1.5">
                <Label>Valor total (R$)</Label>
                <Input type="number" step="0.01" min="0" placeholder="0,00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
              </div>

              <div className="space-y-1.5">
                <Label>Data</Label>
                <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
              </div>

              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v, isInstallment: false }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[["fixo", "Fixo"], ["variavel", "Variável"]].map(([v, label]) => (
                    <button key={v} type="button" onClick={() => setForm(f => ({ ...f, expenseType: v }))}
                      className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${form.expenseType === v ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50 hover:bg-muted/40 hover:text-foreground"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Forma de pagamento</Label>
                <Select value={form.paymentMethod} onValueChange={v => setForm(f => ({ ...f, paymentMethod: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {isObra && (
                <div className="space-y-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Gasto de Obra</p>
                  <div className="space-y-1.5">
                    <Label>Parcelado?</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {([[true, "Sim, parcelado"], [false, "À vista"]] as [boolean, string][]).map(([v, label]) => (
                        <button key={String(v)} type="button" onClick={() => setForm(f => ({ ...f, isInstallment: v, totalInstallments: "" }))}
                          className={`py-2 rounded-xl border text-sm font-medium transition-all ${form.isInstallment === v ? "bg-amber-600 text-white border-amber-600" : "border-border text-muted-foreground hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-foreground"}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {form.isInstallment && (
                    <div className="space-y-1.5">
                      <Label>Em quantas vezes?</Label>
                      <Input type="number" min="2" placeholder="Ex: 12" value={form.totalInstallments} onChange={e => setForm(f => ({ ...f, totalInstallments: e.target.value }))} />
                      {monthlyPreview !== null && (
                        <p className="text-sm text-amber-400 font-semibold">= {formatCurrency(monthlyPreview)} / mês</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Mês de referência</Label>
                  <Select value={String(form.month)} onValueChange={v => setForm(f => ({ ...f, month: Number(v), startMonth: Number(v) }))}>
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
                  <Input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value), startYear: Number(e.target.value) }))} />
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
        <div className="grid grid-cols-3 gap-2">
          <Card className="border-destructive/30 bg-destructive/10 hover:bg-destructive/15 transition-all duration-150">
            <CardContent className="py-3 px-3">
              <p className="text-[10px] text-muted-foreground mb-0.5">Total</p>
              <p className="text-base font-bold text-destructive">{formatCurrency(total)}</p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all duration-150">
            <CardContent className="py-3 px-3">
              <p className="text-[10px] text-muted-foreground mb-0.5">Fixos</p>
              <p className="text-base font-bold text-primary">{formatCurrency(fixedTotal)}</p>
            </CardContent>
          </Card>
          <Card className="hover:bg-muted/20 transition-all duration-150">
            <CardContent className="py-3 px-3">
              <p className="text-[10px] text-muted-foreground mb-0.5">Variáveis</p>
              <p className="text-base font-bold">{formatCurrency(varTotal)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
      ) : expenses && expenses.length > 0 ? (
        <div className="space-y-2">
          {expenses.map(expense => (
            <Card key={expense.id} className="group border-border/50 hover:border-border hover:bg-muted/20 transition-all duration-150 cursor-default">
              <CardContent className="py-3 px-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm truncate">{expense.description}</p>
                    <span className="text-[11px] text-muted-foreground shrink-0 ml-2">{formatDate(expense.date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <CategoryBadge category={expense.category} />
                    <TypeBadge type={expense.expenseType} />
                    {expense.paymentMethod && <PaymentBadge method={expense.paymentMethod} />}
                    {expense.isInstallment
                      ? <InstallmentBadge current={expense.currentInstallment} total={expense.totalInstallments} />
                      : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-zinc-500/20 text-zinc-300 border-zinc-500/30">
                          À vista
                        </span>
                      )
                    }
                  </div>
                </div>
                <div className="flex items-start gap-3 shrink-0 pt-0.5">
                  <div className="text-right">
                    <p className="font-bold text-sm text-destructive">{formatCurrency(expense.monthlyAmount ?? expense.amount)}</p>
                    {expense.isInstallment && (
                      <p className="text-[10px] text-muted-foreground">/mês</p>
                    )}
                  </div>
                  <button onClick={() => handleDelete(expense.id)} className="text-muted-foreground hover:text-destructive transition-colors p-0.5 mt-0.5 opacity-40 group-hover:opacity-100">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground text-sm">Nenhum gasto registrado neste mês.</div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Remover gasto"
        description="Essa ação não pode ser desfeita. Deseja remover este gasto?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

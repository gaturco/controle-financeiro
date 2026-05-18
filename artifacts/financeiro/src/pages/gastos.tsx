import { useListExpenses, getListExpensesQueryKey, useDeleteExpense } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";

export default function Gastos() {
  const queryClient = useQueryClient();
  const { data: expenses, isLoading } = useListExpenses({}, { query: { queryKey: getListExpensesQueryKey({}) } });
  const deleteMutation = useDeleteExpense();

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListExpensesQueryKey() })
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gastos</h1>
        <Button>Adicionar Gasto</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Pessoa</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses?.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      {expense.description}
                      {expense.isInstallment && (
                         <span className="block text-xs text-muted-foreground">
                           {expense.currentInstallment}/{expense.totalInstallments}
                         </span>
                      )}
                    </TableCell>
                    <TableCell className="capitalize">{expense.category.replace('_', ' ')}</TableCell>
                    <TableCell className="capitalize">{expense.expenseType}</TableCell>
                    <TableCell className="capitalize">{expense.person || '-'}</TableCell>
                    <TableCell className="text-right text-destructive font-medium">
                      {formatCurrency(expense.amount)}
                      {expense.isInstallment && expense.monthlyAmount && (
                         <span className="block text-xs text-muted-foreground font-normal">
                           {formatCurrency(expense.monthlyAmount)} / mês
                         </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(expense.id)}>
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {expenses?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum gasto cadastrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

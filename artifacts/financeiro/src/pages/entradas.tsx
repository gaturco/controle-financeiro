import { useListIncomes, getListIncomesQueryKey, useDeleteIncome } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";

export default function Entradas() {
  const queryClient = useQueryClient();
  const { data: incomes, isLoading } = useListIncomes({}, { query: { queryKey: getListIncomesQueryKey({}) } });
  const deleteMutation = useDeleteIncome();

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListIncomesQueryKey() })
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Entradas</h1>
        <Button>Adicionar Entrada</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Entradas</CardTitle>
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
                  <TableHead>Pessoa</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomes?.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell className="capitalize font-medium">{income.person}</TableCell>
                    <TableCell>{income.description}</TableCell>
                    <TableCell className="capitalize">{income.type.replace('_', ' ')}</TableCell>
                    <TableCell>{income.month}/{income.year}</TableCell>
                    <TableCell className="text-right text-primary font-medium">{formatCurrency(income.amount)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(income.id)}>
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {incomes?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma entrada cadastrada.
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

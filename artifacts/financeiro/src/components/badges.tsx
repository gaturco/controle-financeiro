import { cn } from "@/lib/utils";

export function PersonBadge({ person }: { person: string }) {
  const map: Record<string, { label: string; color: string }> = {
    gabriel: { label: "Gabriel", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    fernanda: { label: "Fernanda", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
    ambos: { label: "Ambos", color: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30" },
  };
  const cfg = map[person] ?? { label: person, color: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30" };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border", cfg.color)}>
      {cfg.label}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  const map: Record<string, { label: string; color: string }> = {
    obra: { label: "Obra", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    alimentacao: { label: "Alimentação", color: "bg-green-500/20 text-green-300 border-green-500/30" },
    transporte: { label: "Transporte", color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
    saude: { label: "Saúde", color: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
    educacao: { label: "Educação", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
    lazer: { label: "Lazer", color: "bg-pink-500/20 text-pink-300 border-pink-500/30" },
    cartao_credito: { label: "Cartão", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
    outros: { label: "Outros", color: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30" },
  };
  const cfg = map[category] ?? { label: category, color: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30" };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border", cfg.color)}>
      {cfg.label}
    </span>
  );
}

export function TypeBadge({ type }: { type: string }) {
  return type === "fixo" ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-primary/20 text-primary border-primary/30">
      Fixo
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-zinc-500/20 text-zinc-300 border-zinc-500/30">
      Variável
    </span>
  );
}

export function PaymentBadge({ method }: { method: string | null | undefined }) {
  if (!method) return null;
  const map: Record<string, { label: string; color: string }> = {
    credito: { label: "Crédito", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
    debito: { label: "Débito", color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
    pix: { label: "Pix", color: "bg-teal-500/20 text-teal-300 border-teal-500/30" },
    dinheiro: { label: "Dinheiro", color: "bg-green-500/20 text-green-300 border-green-500/30" },
  };
  const cfg = map[method] ?? { label: method, color: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30" };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border", cfg.color)}>
      {cfg.label}
    </span>
  );
}

export function IncomeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; color: string }> = {
    salario: { label: "Salário", color: "bg-primary/20 text-primary border-primary/30" },
    bonus: { label: "Bônus", color: "bg-green-500/20 text-green-300 border-green-500/30" },
    plr: { label: "PLR", color: "bg-teal-500/20 text-teal-300 border-teal-500/30" },
    decimo_terceiro: { label: "13°", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    outro: { label: "Outro", color: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30" },
  };
  const cfg = map[type] ?? { label: type, color: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30" };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border", cfg.color)}>
      {cfg.label}
    </span>
  );
}

export function InstallmentBadge({ current, total }: { current?: number | null; total?: number | null }) {
  if (!total) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-amber-500/20 text-amber-300 border-amber-500/30">
      {current ?? "?"}/{total}x
    </span>
  );
}

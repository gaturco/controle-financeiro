import { Link, useLocation } from "wouter";
import { LayoutDashboard, ArrowUpCircle, ArrowDownCircle, Hammer, ChevronLeft, ChevronRight } from "lucide-react";
import { useMonth } from "@/hooks/use-month";
import { formatMonthYear } from "@/lib/format";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Entradas", href: "/entradas", icon: ArrowUpCircle },
  { name: "Gastos", href: "/gastos", icon: ArrowDownCircle },
  { name: "Obra", href: "/obra", icon: Hammer },
];

function MonthSelector() {
  const { month, year, prevMonth, nextMonth } = useMonth();
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium capitalize min-w-[110px] text-center">
        {formatMonthYear(month, year)}
      </span>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isObra = location === "/obra";

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile top header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b flex items-center justify-between px-4 h-14">
        <span className="font-bold text-base text-primary">Controle Financeiro</span>
        {!isObra && <MonthSelector />}
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-col border-r bg-card fixed top-0 bottom-0 left-0 z-40">
        <div className="p-5 pb-3">
          <span className="font-bold text-lg text-primary">Controle Financeiro</span>
        </div>
        {!isObra && (
          <div className="px-4 pb-4">
            <MonthSelector />
          </div>
        )}
        <nav className="flex flex-col gap-1 px-3 flex-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-56 mt-14 md:mt-0 mb-16 md:mb-0 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4">
          {children}
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t flex">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-xs transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "stroke-[2.5px]" : ""}`} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

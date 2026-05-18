import { Link, useLocation } from "wouter";
import { LayoutDashboard, ArrowUpCircle, ArrowDownCircle, Hammer, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Entradas", href: "/entradas", icon: ArrowUpCircle },
  { name: "Gastos", href: "/gastos", icon: ArrowDownCircle },
  { name: "Obra", href: "/obra", icon: Hammer },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const isActive = location === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <Sheet>
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
          <span className="font-bold text-lg text-primary">Controle Financeiro</span>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
        </div>
        <SheetContent side="left" className="w-64 p-4">
          <div className="font-bold text-xl text-primary mb-8 ml-2">Controle</div>
          <nav className="flex flex-col gap-2">
            <NavLinks />
          </nav>
        </SheetContent>
      </Sheet>

      <aside className="hidden md:flex w-64 flex-col border-r bg-card p-4">
        <div className="font-bold text-xl text-primary mb-8 px-2">Controle Financeiro</div>
        <nav className="flex flex-col gap-2 flex-1">
          <NavLinks />
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

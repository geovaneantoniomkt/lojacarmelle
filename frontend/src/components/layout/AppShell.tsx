import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Tag,
  Megaphone,
  Filter,
  BarChart2,
  LogOut,
  Store,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/vendas', icon: ShoppingBag, label: 'Vendas' },
  { to: '/campanhas', icon: Megaphone, label: 'Campanhas' },
  { to: '/cupons', icon: Tag, label: 'Cupons' },
  { to: '/segmentacao', icon: Filter, label: 'Segmentação' },
  { to: '/relatorios', icon: BarChart2, label: 'Relatórios' },
];

export function AppShell() {
  const { usuario, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
        <Store className="text-primary" size={22} />
        <span className="font-bold text-lg text-primary">Moda CRM</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-border">
        <div className="text-xs text-muted-foreground mb-1 truncate">{usuario?.nome}</div>
        <div className="text-xs text-muted-foreground/60 mb-3 capitalize">{usuario?.perfil}</div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-60 bg-white border-r border-border flex-col shadow-sm">
        <SidebarContent />
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar mobile (drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col shadow-xl transition-transform duration-300 md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={closeSidebar}
          className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:bg-muted"
        >
          <X size={20} />
        </button>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar mobile */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-border shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-muted"
          >
            <Menu size={22} />
          </button>
          <Store className="text-primary" size={20} />
          <span className="font-bold text-primary">Moda CRM</span>
        </header>

        <main className="flex-1 overflow-auto bg-muted/30">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

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

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-border flex flex-col shadow-sm">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
          <Store className="text-primary" size={22} />
          <span className="font-bold text-lg text-primary">Moda CRM</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
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
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-muted/30">
        <Outlet />
      </main>
    </div>
  );
}

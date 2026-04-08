import { useQuery } from '@tanstack/react-query';
import { Users, ShoppingBag, TrendingUp, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';

function KpiCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { data: kpis } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: () => api.get('/dashboard/kpis').then((r) => r.data),
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Visão geral da loja</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          title="Total de Clientes"
          value={kpis?.totalClientes ?? '—'}
          icon={Users}
          color="bg-blue-50 text-blue-500"
        />
        <KpiCard
          title="Vendas este mês"
          value={kpis?.vendasMes ?? '—'}
          icon={ShoppingBag}
          color="bg-primary/10 text-primary"
        />
        <KpiCard
          title="Receita este mês"
          value={
            kpis?.receitaMes
              ? `R$ ${Number(kpis.receitaMes).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              : '—'
          }
          icon={TrendingUp}
          color="bg-green-50 text-green-500"
        />
        <KpiCard
          title="Alertas pendentes"
          value={kpis?.alertasPendentes ?? '—'}
          icon={AlertCircle}
          color="bg-orange-50 text-orange-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
        <h2 className="font-semibold mb-4">Boas-vindas ao Moda CRM</h2>
        <p className="text-sm text-muted-foreground">
          Use o menu lateral para navegar entre os módulos. Comece cadastrando suas clientes
          e registrando as primeiras vendas.
        </p>
      </div>
    </div>
  );
}

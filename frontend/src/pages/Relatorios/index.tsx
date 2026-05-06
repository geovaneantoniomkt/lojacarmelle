import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { api } from '@/services/api';

const COLORS = ['#7c3aed','#a78bfa','#c4b5fd','#ddd6fe','#ede9fe','#f5f3ff','#8b5cf6','#6d28d9'];

function formatMes(mes: string) {
  const [year, month] = mes.split('-');
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
}

function fmtCurrency(v: number) {
  return `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;
}

export function Relatorios() {
  const { data: vendasMes = [] } = useQuery<any[]>({ queryKey: ['rel-vendas'], queryFn: () => api.get('/dashboard/vendas-por-mes').then((r) => r.data) });
  const { data: categorias = [] } = useQuery<any[]>({ queryKey: ['rel-cat'], queryFn: () => api.get('/dashboard/top-categorias').then((r) => r.data) });
  const { data: clientesNovos = [] } = useQuery<any[]>({ queryKey: ['rel-clientes'], queryFn: () => api.get('/dashboard/clientes-novos').then((r) => r.data) });

  const vf = vendasMes.map((v) => ({ ...v, mesLabel: formatMes(v.mes), receita: parseFloat(v.receita) }));
  const cf = clientesNovos.map((c) => ({ ...c, mesLabel: formatMes(c.mes) }));
  const cats = categorias.map((c) => ({ ...c, receita: parseFloat(c.receita) }));

  const empty = <p className="text-sm text-muted-foreground text-center py-8">Sem dados disponíveis</p>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div><h1 className="text-xl md:text-2xl font-bold">Relatórios</h1><p className="text-muted-foreground text-sm mt-1">Análise de desempenho da loja</p></div>

      <div className="bg-white rounded-xl border border-border shadow-sm p-5">
        <h2 className="font-semibold mb-4">Receita mensal (12 meses)</h2>
        {vf.length === 0 ? empty : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={vf}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mesLabel" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: any) => [fmtCurrency(v), 'Receita']} />
              <Bar dataKey="receita" fill="#7c3aed" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h2 className="font-semibold mb-4">Vendas por mês</h2>
          {vf.length === 0 ? empty : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={vf}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mesLabel" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="total_vendas" stroke="#7c3aed" strokeWidth={2} dot={{ r: 4 }} name="Vendas" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h2 className="font-semibold mb-4">Novos clientes por mês</h2>
          {cf.length === 0 ? empty : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={cf}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mesLabel" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="novos" fill="#a78bfa" radius={[4,4,0,0]} name="Novos clientes" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm p-5">
        <h2 className="font-semibold mb-4">Categorias mais vendidas</h2>
        {cats.length === 0 ? empty : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={cats} dataKey="receita" nameKey="categoria" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {cats.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => fmtCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {cats.map((c: any, i: number) => (
                <div key={c.categoria} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} /><span className="capitalize">{c.categoria}</span></div>
                  <div className="text-right"><span className="font-medium">{fmtCurrency(c.receita)}</span><span className="text-muted-foreground ml-2 text-xs">{c.total_itens} itens</span></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

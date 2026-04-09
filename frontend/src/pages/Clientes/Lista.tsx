import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, UserCheck } from 'lucide-react';
import { api } from '@/services/api';

const STATUS_LABELS: Record<string, string> = {
  nova: 'Nova',
  recorrente: 'Recorrente',
  vip: 'VIP',
  inativa: 'Inativa',
  reativacao: 'Reativação',
};

const STATUS_COLORS: Record<string, string> = {
  nova: 'bg-blue-100 text-blue-700',
  recorrente: 'bg-green-100 text-green-700',
  vip: 'bg-purple-100 text-purple-700',
  inativa: 'bg-gray-100 text-gray-600',
  reativacao: 'bg-orange-100 text-orange-700',
};

export function ClientesLista() {
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['clientes', busca, pagina],
    queryFn: () =>
      api
        .get('/clientes', { params: { busca, page: pagina, limit: 20 } })
        .then((r) => r.data),
  });

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data?.total ?? 0} clientes cadastradas
          </p>
        </div>
        <Link
          to="/clientes/novo"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 md:px-4 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nova Cliente</span>
          <span className="sm:hidden">Nova</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="p-3 md:p-4 border-b border-border">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={busca}
              onChange={(e) => { setBusca(e.target.value); setPagina(1); }}
              placeholder="Buscar por nome, telefone ou e-mail..."
              className="w-full pl-9 pr-4 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Carregando...</div>
        ) : data?.data?.length === 0 ? (
          <div className="p-8 text-center">
            <UserCheck size={40} className="mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">Nenhuma cliente encontrada</p>
          </div>
        ) : (
          <>
            {/* Tabela desktop */}
            <table className="hidden md:table w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Telefone</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Total gasto</th>
                  <th className="px-4 py-3 font-medium">Última compra</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((c: any) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link to={`/clientes/${c.id}`} className="font-medium hover:text-primary">
                        {c.nomeCompleto}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.telefone ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[c.statusCrm]}`}>
                        {STATUS_LABELS[c.statusCrm]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      R$ {Number(c.totalGasto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.ultimaCompraEm
                        ? new Date(c.ultimaCompraEm).toLocaleDateString('pt-BR')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Cards mobile */}
            <div className="md:hidden divide-y divide-border">
              {data?.data?.map((c: any) => (
                <Link
                  key={c.id}
                  to={`/clientes/${c.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 active:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{c.nomeCompleto}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.telefone ?? 'Sem telefone'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-3 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.statusCrm]}`}>
                      {STATUS_LABELS[c.statusCrm]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      R$ {Number(c.totalGasto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {data?.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Página {pagina} de {data.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="text-xs px-3 py-1.5 border border-input rounded hover:bg-muted disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                onClick={() => setPagina((p) => Math.min(data.totalPages, p + 1))}
                disabled={pagina === data.totalPages}
                className="text-xs px-3 py-1.5 border border-input rounded hover:bg-muted disabled:opacity-40"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

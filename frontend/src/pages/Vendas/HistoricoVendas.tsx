import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, ShoppingBag } from 'lucide-react';
import { api } from '@/services/api';

const PAGAMENTO_LABELS: Record<string, string> = {
  pix: 'PIX',
  credito: 'Crédito',
  debito: 'Débito',
  dinheiro: 'Dinheiro',
  link: 'Link',
  boleto: 'Boleto',
  crediario: 'Crediário',
};

export function HistoricoVendas() {
  const [pagina, setPagina] = useState(1);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['vendas', pagina, dataInicio, dataFim],
    queryFn: () =>
      api
        .get('/vendas', {
          params: { page: pagina, limit: 20, dataInicio: dataInicio || undefined, dataFim: dataFim || undefined },
        })
        .then((r) => r.data),
  });

  const totalReceita = data?.data?.reduce((acc: number, v: any) => acc + Number(v.valorFinal), 0) ?? 0;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Vendas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data?.total ?? 0} vendas registradas
          </p>
        </div>
        <Link
          to="/vendas/nova"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          Nova Venda
        </Link>
      </div>

      {/* Filtros + resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-border shadow-sm p-4">
          <p className="text-xs text-muted-foreground">Receita do período</p>
          <p className="text-xl font-bold mt-1">
            R$ {totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-xs text-muted-foreground mb-1">De</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => { setDataInicio(e.target.value); setPagina(1); }}
              className="w-full border border-input rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-muted-foreground mb-1">Até</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => { setDataFim(e.target.value); setPagina(1); }}
              className="w-full border border-input rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Carregando...</div>
        ) : data?.data?.length === 0 ? (
          <div className="p-8 text-center">
            <ShoppingBag size={40} className="mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">Nenhuma venda encontrada</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Itens</th>
                <th className="px-4 py-3 font-medium">Pagamento</th>
                <th className="px-4 py-3 font-medium">Desconto</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Pontos</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((v: any) => (
                <tr key={v.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(v.dataVenda).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/clientes/${v.clienteId}`}
                      className="font-medium hover:text-primary"
                    >
                      {v.cliente?.nomeCompleto ?? '—'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {v.itens?.length ?? 0} item(s)
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-muted text-xs px-2 py-0.5 rounded">
                      {PAGAMENTO_LABELS[v.formaPagamento]}
                      {v.parcelas > 1 && ` ${v.parcelas}x`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-green-600">
                    {Number(v.valorDesconto) > 0
                      ? `- R$ ${Number(v.valorDesconto).toFixed(2)}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    R$ {Number(v.valorFinal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-primary font-medium">
                    +{v.pontosGerados}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

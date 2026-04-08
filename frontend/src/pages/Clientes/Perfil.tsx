import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingBag, Calendar, TrendingUp, Gift } from 'lucide-react';
import { api } from '@/services/api';

const NIVEL_COLORS: Record<string, string> = {
  bronze: 'text-orange-600',
  prata: 'text-slate-500',
  ouro: 'text-yellow-500',
  vip: 'text-purple-600',
};

const PAGAMENTO_LABELS: Record<string, string> = {
  pix: 'PIX', credito: 'Crédito', debito: 'Débito',
  dinheiro: 'Dinheiro', link: 'Link', boleto: 'Boleto', crediario: 'Crediário',
};

export function ClientePerfil() {
  const { id } = useParams<{ id: string }>();
  const [aba, setAba] = useState<'historico' | 'pontos'>('historico');

  const { data: cliente, isLoading } = useQuery({
    queryKey: ['cliente', id],
    queryFn: () => api.get(`/clientes/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const { data: historico } = useQuery({
    queryKey: ['cliente-historico', id],
    queryFn: () => api.get(`/clientes/${id}/historico`).then((r) => r.data),
    enabled: !!id,
  });

  const { data: extrato } = useQuery({
    queryKey: ['cliente-pontos', id],
    queryFn: () => api.get(`/clientes/${id}/pontos`).then((r) => r.data),
    enabled: !!id && aba === 'pontos',
  });

  if (isLoading) return (
    <div className="p-6 text-sm text-muted-foreground">Carregando perfil...</div>
  );
  if (!cliente) return null;

  return (
    <div className="p-6">
      <Link to="/clientes" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={16} />
        Voltar para clientes
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dados principais */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-border shadow-sm p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h1 className="text-2xl font-bold">{cliente.nomeCompleto}</h1>
                <p className="text-muted-foreground text-sm mt-1">{cliente.email ?? '—'}</p>
              </div>
              <div className="flex gap-2">
                <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${
                  cliente.statusCrm === 'vip' ? 'bg-purple-100 text-purple-700' :
                  cliente.statusCrm === 'recorrente' ? 'bg-green-100 text-green-700' :
                  cliente.statusCrm === 'inativa' ? 'bg-gray-100 text-gray-600' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {cliente.statusCrm}
                </span>
                <Link
                  to={`/clientes/${id}/editar`}
                  className="text-xs px-3 py-1 rounded-full border border-input hover:bg-muted"
                >
                  Editar
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              {[
                ['Telefone', cliente.telefone],
                ['Instagram', cliente.instagram],
                ['Cidade', cliente.cidade],
                ['Bairro', cliente.bairro],
                ['Nascimento', cliente.dataNascimento
                  ? new Date(cliente.dataNascimento + 'T12:00').toLocaleDateString('pt-BR') : null],
                ['Origem', cliente.origemCadastro],
              ].map(([label, val]) => (
                <div key={label as string}>
                  <span className="text-muted-foreground">{label}</span>
                  <p className="font-medium capitalize">{val ?? '—'}</p>
                </div>
              ))}
            </div>

            {cliente.observacoes && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Observações</p>
                <p className="text-sm">{cliente.observacoes}</p>
              </div>
            )}
          </div>

          {/* Histórico / Extrato */}
          <div className="bg-white rounded-xl border border-border shadow-sm">
            <div className="flex border-b border-border">
              <button
                onClick={() => setAba('historico')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  aba === 'historico' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Histórico de Compras
              </button>
              <button
                onClick={() => setAba('pontos')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  aba === 'pontos' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Extrato de Pontos
              </button>
            </div>

            <div className="p-4">
              {aba === 'historico' && (
                historico?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhuma compra registrada</p>
                ) : (
                  <div className="space-y-3">
                    {historico?.map((v: any) => (
                      <div key={v.id} className="border border-border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {new Date(v.data_venda).toLocaleDateString('pt-BR')}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs bg-muted px-2 py-0.5 rounded">
                              {PAGAMENTO_LABELS[v.forma_pagamento] ?? v.forma_pagamento}
                            </span>
                            <span className="font-bold text-sm">
                              R$ {Number(v.valor_final).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-xs text-primary">+{v.pontos_gerados} pts</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {v.itens?.map((item: any, i: number) => (
                            <span key={i} className="text-xs bg-muted/60 px-2 py-0.5 rounded text-muted-foreground">
                              {item.quantidade}x {item.produto}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {aba === 'pontos' && (
                extrato?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Sem movimentação de pontos</p>
                ) : (
                  <div className="divide-y divide-border">
                    {extrato?.map((e: any) => (
                      <div key={e.criado_em} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm">{e.descricao ?? 'Movimentação'}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(e.criado_em).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <span className={`font-bold text-sm ${e.pontos > 0 ? 'text-green-600' : 'text-destructive'}`}>
                          {e.pontos > 0 ? '+' : ''}{e.pontos} pts
                        </span>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Métricas laterais */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3 text-muted-foreground text-sm">
              <Star size={16} />
              <span>Fidelidade</span>
            </div>
            <p className={`text-xl font-bold capitalize ${NIVEL_COLORS[cliente.nivelFidelidade]}`}>
              {cliente.nivelFidelidade}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {Number(cliente.pontosAcumulados).toLocaleString('pt-BR')} pontos
            </p>
          </div>

          <div className="bg-white rounded-xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3 text-muted-foreground text-sm">
              <ShoppingBag size={16} />
              <span>Compras</span>
            </div>
            <p className="text-xl font-bold">{cliente.totalCompras}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Total: R$ {Number(cliente.totalGasto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3 text-muted-foreground text-sm">
              <TrendingUp size={16} />
              <span>Ticket médio</span>
            </div>
            <p className="text-xl font-bold">
              R$ {Number(cliente.ticketMedio).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3 text-muted-foreground text-sm">
              <Calendar size={16} />
              <span>Última compra</span>
            </div>
            <p className="text-sm font-medium">
              {cliente.ultimaCompraEm
                ? new Date(cliente.ultimaCompraEm).toLocaleDateString('pt-BR')
                : 'Nenhuma compra ainda'}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3 text-muted-foreground text-sm">
              <Gift size={16} />
              <span>Consentimentos</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className={`flex items-center gap-1 ${cliente.consentimentoEmail ? 'text-green-600' : 'text-muted-foreground'}`}>
                <span>{cliente.consentimentoEmail ? '✓' : '✗'}</span> E-mail marketing
              </div>
              <div className={`flex items-center gap-1 ${cliente.consentimentoWhatsapp ? 'text-green-600' : 'text-muted-foreground'}`}>
                <span>{cliente.consentimentoWhatsapp ? '✓' : '✗'}</span> WhatsApp
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

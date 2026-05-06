import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import { api } from '@/services/api';
import { FormCupom } from './FormCupom';

const TIPO_LABEL: Record<string, string> = { percentual: 'Percentual (%)', fixo: 'Fixo (R$)' };

export function CuponsLista() {
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: cupons = [], isLoading } = useQuery<any[]>({
    queryKey: ['cupons'],
    queryFn: () => api.get('/cupons').then((r) => r.data),
  });

  const toggleAtivo = useMutation({
    mutationFn: (c: any) => api.put(`/cupons/${c.id}`, { ativo: !c.ativo }).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cupons'] }),
  });

  function handleClose() { setShowForm(false); setEditando(null); }

  const hoje = new Date().toISOString().split('T')[0];

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Cupons</h1>
          <p className="text-muted-foreground text-sm mt-1">{cupons.length} cupons cadastrados</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus size={16} /><span className="hidden sm:inline">Novo Cupom</span><span className="sm:hidden">Novo</span>
        </button>
      </div>

      {showForm && <FormCupom inicial={editando} onClose={handleClose} onSalvo={handleClose} />}

      <div className="bg-white rounded-xl border border-border shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Carregando...</div>
        ) : cupons.length === 0 ? (
          <div className="p-8 text-center">
            <Tag size={40} className="mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">Nenhum cupom cadastrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Código</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Tipo</th>
                  <th className="px-4 py-3 font-medium">Desconto</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Válido até</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Usos</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {cupons.map((c: any) => {
                  const expirado = c.validoAte < hoje;
                  return (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <span className="font-mono font-semibold text-primary">{c.codigo}</span>
                        {c.descricao && <p className="text-xs text-muted-foreground mt-0.5">{c.descricao}</p>}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{TIPO_LABEL[c.tipoDesconto]}</td>
                      <td className="px-4 py-3 font-medium">{c.tipoDesconto === 'percentual' ? `${c.valor}%` : `R$ ${Number(c.valor).toFixed(2)}`}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={expirado ? 'text-destructive' : 'text-muted-foreground'}>
                          {new Date(c.validoAte + 'T00:00:00').toLocaleDateString('pt-BR')}{expirado && ' (expirado)'}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{c.usosRealizados}{c.limiteUsoTotal ? ` / ${c.limiteUsoTotal}` : ''}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleAtivo.mutate(c)} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium transition-colors ${c.ativo ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                          {c.ativo ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}{c.ativo ? 'Ativo' : 'Inativo'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => { setEditando(c); setShowForm(true); }} className="text-xs text-primary hover:underline">Editar</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

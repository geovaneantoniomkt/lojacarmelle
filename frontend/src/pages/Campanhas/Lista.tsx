import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Megaphone, Calendar } from 'lucide-react';
import { api } from '@/services/api';
import { FormCampanha } from './FormCampanha';

export function CampanhasLista() {
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: campanhas = [], isLoading } = useQuery<any[]>({
    queryKey: ['campanhas'],
    queryFn: () => api.get('/campanhas').then((r) => r.data),
  });

  const toggleAtiva = useMutation({
    mutationFn: (c: any) => api.put(`/campanhas/${c.id}`, { ativa: !c.ativa }).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campanhas'] }),
  });

  const remover = useMutation({
    mutationFn: (id: string) => api.delete(`/campanhas/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campanhas'] }),
  });

  function handleClose() { setShowForm(false); setEditando(null); }
  const hoje = new Date().toISOString().split('T')[0];

  function statusCampanha(c: any): { label: string; color: string } {
    if (!c.ativa) return { label: 'Inativa', color: 'bg-gray-100 text-gray-500' };
    if (c.dataFim && c.dataFim < hoje) return { label: 'Encerrada', color: 'bg-red-100 text-red-600' };
    if (c.dataInicio && c.dataInicio > hoje) return { label: 'Agendada', color: 'bg-yellow-100 text-yellow-700' };
    return { label: 'Ativa', color: 'bg-green-100 text-green-700' };
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Campanhas</h1>
          <p className="text-muted-foreground text-sm mt-1">{campanhas.length} campanhas cadastradas</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus size={16} /><span className="hidden sm:inline">Nova Campanha</span><span className="sm:hidden">Nova</span>
        </button>
      </div>

      {showForm && <FormCampanha inicial={editando} onClose={handleClose} onSalvo={handleClose} />}

      <div className="bg-white rounded-xl border border-border shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Carregando...</div>
        ) : campanhas.length === 0 ? (
          <div className="p-8 text-center">
            <Megaphone size={40} className="mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">Nenhuma campanha cadastrada</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {campanhas.map((c: any) => {
              const status = statusCampanha(c);
              return (
                <div key={c.id} className="px-5 py-4 flex items-start justify-between gap-4 hover:bg-muted/20">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{c.nome}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>{status.label}</span>
                    </div>
                    {c.descricao && <p className="text-sm text-muted-foreground mt-1">{c.descricao}</p>}
                    {(c.dataInicio || c.dataFim) && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
                        <Calendar size={12} />
                        {c.dataInicio ? new Date(c.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                        {' → '}
                        {c.dataFim ? new Date(c.dataFim + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => { setEditando(c); setShowForm(true); }} className="text-xs text-primary hover:underline">Editar</button>
                    <button onClick={() => toggleAtiva.mutate(c)} className="text-xs text-muted-foreground hover:text-foreground">{c.ativa ? 'Desativar' : 'Ativar'}</button>
                    <button onClick={() => { if (confirm('Remover esta campanha?')) remover.mutate(c.id); }} className="text-xs text-destructive hover:underline">Remover</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

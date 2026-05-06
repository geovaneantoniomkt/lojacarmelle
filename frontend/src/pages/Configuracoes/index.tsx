import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, CheckCircle } from 'lucide-react';
import { api } from '@/services/api';

const schema = z.object({
  nomeLoja: z.string().min(2).max(150),
  pontosPorReal: z.number().min(0.01),
  ptsNivelPrata: z.number().int().min(0),
  ptsNivelOuro: z.number().int().min(0),
  ptsNivelVip: z.number().int().min(0),
  diasInatividadeAlerta: z.number().int().min(1),
});

type FormData = z.infer<typeof schema>;

export function Configuracoes() {
  const queryClient = useQueryClient();
  const { data: config, isLoading } = useQuery({ queryKey: ['configuracoes'], queryFn: () => api.get('/configuracoes').then((r) => r.data) });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (config) reset({ nomeLoja: config.nomeLoja, pontosPorReal: Number(config.pontosPorReal), ptsNivelPrata: config.ptsNivelPrata, ptsNivelOuro: config.ptsNivelOuro, ptsNivelVip: config.ptsNivelVip, diasInatividadeAlerta: config.diasInatividadeAlerta });
  }, [config, reset]);

  const mutation = useMutation({ mutationFn: (data: FormData) => api.put('/configuracoes', data).then((r) => r.data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['configuracoes'] }) });

  const ic = 'w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';
  const lc = 'block text-sm font-medium text-foreground mb-1';
  const ec = 'text-xs text-destructive mt-1';

  if (isLoading) return <div className="p-6"><p className="text-muted-foreground text-sm">Carregando configurações...</p></div>;

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Settings size={22} className="text-primary" />
        <div><h1 className="text-xl md:text-2xl font-bold">Configurações</h1><p className="text-muted-foreground text-sm mt-0.5">Parâmetros gerais da loja</p></div>
      </div>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
        <div className="bg-white rounded-xl border border-border shadow-sm p-5 space-y-4">
          <h2 className="font-semibold">Dados da loja</h2>
          <div><label className={lc}>Nome da loja *</label><input {...register('nomeLoja')} className={ic} placeholder="Ex: Loja Carmelle" />{errors.nomeLoja && <p className={ec}>{errors.nomeLoja.message}</p>}</div>
        </div>
        <div className="bg-white rounded-xl border border-border shadow-sm p-5 space-y-4">
          <h2 className="font-semibold">Programa de fidelidade</h2>
          <div>
            <label className={lc}>Pontos por real gasto *</label>
            <input {...register('pontosPorReal', { valueAsNumber: true })} type="number" step="0.1" min="0.1" className={ic} />
            <p className="text-xs text-muted-foreground mt-1">Ex: 1.0 = 1 ponto por R$1,00 gasto</p>
            {errors.pontosPorReal && <p className={ec}>{errors.pontosPorReal.message}</p>}
          </div>
          <div>
            <p className="text-sm font-medium mb-3">Pontos para cada nível</p>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="block text-xs text-muted-foreground mb-1">🥈 Prata</label><input {...register('ptsNivelPrata', { valueAsNumber: true })} type="number" min="0" className={ic} /></div>
              <div><label className="block text-xs text-muted-foreground mb-1">🥇 Ouro</label><input {...register('ptsNivelOuro', { valueAsNumber: true })} type="number" min="0" className={ic} /></div>
              <div><label className="block text-xs text-muted-foreground mb-1">💎 VIP</label><input {...register('ptsNivelVip', { valueAsNumber: true })} type="number" min="0" className={ic} /></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border shadow-sm p-5 space-y-4">
          <h2 className="font-semibold">Alertas de inatividade</h2>
          <div>
            <label className={lc}>Dias sem compra para gerar alerta *</label>
            <input {...register('diasInatividadeAlerta', { valueAsNumber: true })} type="number" min="1" className={ic} />
            {errors.diasInatividadeAlerta && <p className={ec}>{errors.diasInatividadeAlerta.message}</p>}
          </div>
        </div>
        {mutation.isSuccess && <div className="flex items-center gap-2 text-sm text-green-600"><CheckCircle size={16} />Configurações salvas com sucesso!</div>}
        {mutation.isError && <p className="text-sm text-destructive">Erro ao salvar as configurações.</p>}
        <button type="submit" disabled={mutation.isPending} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
          {mutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </form>
    </div>
  );
}

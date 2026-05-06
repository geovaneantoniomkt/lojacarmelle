import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { api } from '@/services/api';

const schema = z.object({
  nome: z.string().min(2).max(150),
  descricao: z.string().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  ativa: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;
interface Props { inicial?: any; onClose: () => void; onSalvo: () => void; }

export function FormCampanha({ inicial, onClose, onSalvo }: Props) {
  const queryClient = useQueryClient();
  const isEdit = !!inicial;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: inicial
      ? { nome: inicial.nome, descricao: inicial.descricao ?? '', dataInicio: inicial.dataInicio ?? '', dataFim: inicial.dataFim ?? '', ativa: inicial.ativa }
      : { ativa: true },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = { ...data, dataInicio: data.dataInicio || undefined, dataFim: data.dataFim || undefined };
      return isEdit ? api.put(`/campanhas/${inicial.id}`, payload).then((r) => r.data) : api.post('/campanhas', payload).then((r) => r.data);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['campanhas'] }); onSalvo(); },
  });

  const inputClass = 'w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';
  const labelClass = 'block text-sm font-medium text-foreground mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-lg">{isEdit ? 'Editar Campanha' : 'Nova Campanha'}</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-5 space-y-4">
          <div>
            <label className={labelClass}>Nome *</label>
            <input {...register('nome')} className={inputClass} placeholder="Ex: Dia das Mães 2026" />
            {errors.nome && <p className="text-xs text-destructive mt-1">{errors.nome.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Descrição</label>
            <textarea {...register('descricao')} rows={3} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Data início</label><input {...register('dataInicio')} type="date" className={inputClass} /></div>
            <div><label className={labelClass}>Data fim</label><input {...register('dataFim')} type="date" className={inputClass} /></div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('ativa')} type="checkbox" className="w-4 h-4 rounded" />
            <span className="text-sm font-medium">Campanha ativa</span>
          </label>
          {mutation.isError && <p className="text-sm text-destructive">Erro ao salvar campanha.</p>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={mutation.isPending} className="flex-1 bg-primary text-primary-foreground py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {mutation.isPending ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar Campanha'}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 border border-input rounded-md text-sm hover:bg-muted">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

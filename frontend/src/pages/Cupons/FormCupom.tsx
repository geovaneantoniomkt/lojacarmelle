import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { api } from '@/services/api';

const schema = z.object({
  codigo: z.string().min(2).max(30),
  descricao: z.string().optional(),
  tipoDesconto: z.enum(['percentual', 'fixo']),
  valor: z.number().min(0.01),
  validoDe: z.string().optional(),
  validoAte: z.string().min(1, 'Obrigatório'),
  limiteUsoTotal: z.number().int().min(1).optional().or(z.literal(undefined)),
  limiteUsoPorCliente: z.number().int().min(1).default(1),
});

type FormData = z.infer<typeof schema>;
interface Props { inicial?: any; onClose: () => void; onSalvo: () => void; }

export function FormCupom({ inicial, onClose, onSalvo }: Props) {
  const queryClient = useQueryClient();
  const isEdit = !!inicial;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: inicial
      ? { codigo: inicial.codigo, descricao: inicial.descricao ?? '', tipoDesconto: inicial.tipoDesconto, valor: Number(inicial.valor), validoDe: inicial.validoDe ?? '', validoAte: inicial.validoAte, limiteUsoTotal: inicial.limiteUsoTotal ?? undefined, limiteUsoPorCliente: inicial.limiteUsoPorCliente ?? 1 }
      : { tipoDesconto: 'percentual', limiteUsoPorCliente: 1 },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = { ...data, codigo: data.codigo.toUpperCase(), validoDe: data.validoDe || undefined, limiteUsoTotal: data.limiteUsoTotal || undefined };
      return isEdit ? api.put(`/cupons/${inicial.id}`, payload).then((r) => r.data) : api.post('/cupons', payload).then((r) => r.data);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['cupons'] }); onSalvo(); },
  });

  const inputClass = 'w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';
  const labelClass = 'block text-sm font-medium text-foreground mb-1';
  const errorClass = 'text-xs text-destructive mt-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-lg">{isEdit ? 'Editar Cupom' : 'Novo Cupom'}</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Código *</label>
              <input {...register('codigo')} className={inputClass} placeholder="VERAO20" style={{ textTransform: 'uppercase' }} disabled={isEdit} />
              {errors.codigo && <p className={errorClass}>{errors.codigo.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Tipo *</label>
              <select {...register('tipoDesconto')} className={inputClass}>
                <option value="percentual">Percentual (%)</option>
                <option value="fixo">Fixo (R$)</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Descrição</label>
            <input {...register('descricao')} className={inputClass} placeholder="Descrição do cupom" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Valor *</label>
              <input {...register('valor', { valueAsNumber: true })} type="number" step="0.01" min="0.01" className={inputClass} />
              {errors.valor && <p className={errorClass}>{errors.valor.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Limite por cliente</label>
              <input {...register('limiteUsoPorCliente', { valueAsNumber: true })} type="number" min="1" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Válido de</label>
              <input {...register('validoDe')} type="date" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Válido até *</label>
              <input {...register('validoAte')} type="date" className={inputClass} />
              {errors.validoAte && <p className={errorClass}>{errors.validoAte.message}</p>}
            </div>
          </div>
          <div>
            <label className={labelClass}>Limite total de usos (vazio = ilimitado)</label>
            <input {...register('limiteUsoTotal', { valueAsNumber: true })} type="number" min="1" className={inputClass} />
          </div>
          {mutation.isError && <p className="text-sm text-destructive">Erro ao salvar cupom.</p>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={mutation.isPending} className="flex-1 bg-primary text-primary-foreground py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {mutation.isPending ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Cupom'}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 border border-input rounded-md text-sm hover:bg-muted">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

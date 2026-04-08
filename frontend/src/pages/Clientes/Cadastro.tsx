import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/services/api';

const schema = z.object({
  nomeCompleto: z.string().min(2, 'Nome obrigatório'),
  telefone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  dataNascimento: z.string().optional(),
  cidade: z.string().optional(),
  bairro: z.string().optional(),
  instagram: z.string().optional(),
  origemCadastro: z.enum(['loja', 'indicacao', 'instagram', 'anuncio', 'evento', 'campanha', 'outra']),
  consentimentoEmail: z.boolean().default(false),
  consentimentoWhatsapp: z.boolean().default(false),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function ClienteCadastro() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { origemCadastro: 'loja' },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.post('/clientes', data).then((r) => r.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      navigate(`/clientes/${data.id}`);
    },
  });

  const inputClass =
    'w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';
  const labelClass = 'block text-sm font-medium text-foreground mb-1';

  return (
    <div className="p-6">
      <Link
        to="/clientes"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft size={16} />
        Voltar para clientes
      </Link>

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Nova Cliente</h1>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
          <div className="bg-white rounded-xl border border-border shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-base">Dados pessoais</h2>

            <div>
              <label className={labelClass}>Nome completo *</label>
              <input {...register('nomeCompleto')} className={inputClass} />
              {errors.nomeCompleto && (
                <p className="text-xs text-destructive mt-1">{errors.nomeCompleto.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Telefone / WhatsApp</label>
                <input {...register('telefone')} className={inputClass} placeholder="(11) 99999-9999" />
              </div>
              <div>
                <label className={labelClass}>E-mail</label>
                <input {...register('email')} type="email" className={inputClass} />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Data de nascimento</label>
                <input {...register('dataNascimento')} type="date" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Instagram</label>
                <input {...register('instagram')} className={inputClass} placeholder="@usuario" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Cidade</label>
                <input {...register('cidade')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Bairro</label>
                <input {...register('bairro')} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-base">CRM</h2>

            <div>
              <label className={labelClass}>Como conheceu a loja?</label>
              <select {...register('origemCadastro')} className={inputClass}>
                <option value="loja">Na loja</option>
                <option value="indicacao">Indicação</option>
                <option value="instagram">Instagram</option>
                <option value="anuncio">Anúncio</option>
                <option value="evento">Evento</option>
                <option value="campanha">Campanha</option>
                <option value="outra">Outra</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Observações</label>
              <textarea {...register('observacoes')} rows={3} className={inputClass} />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Consentimentos (LGPD)</p>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input {...register('consentimentoEmail')} type="checkbox" className="rounded" />
                Aceita receber e-mails de marketing
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input {...register('consentimentoWhatsapp')} type="checkbox" className="rounded" />
                Aceita receber mensagens no WhatsApp
              </label>
            </div>
          </div>

          {mutation.isError && (
            <p className="text-sm text-destructive">Erro ao cadastrar. Tente novamente.</p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {mutation.isPending ? 'Salvando...' : 'Cadastrar Cliente'}
            </button>
            <Link
              to="/clientes"
              className="px-6 py-2.5 rounded-md text-sm font-medium border border-input hover:bg-muted transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

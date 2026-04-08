import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Tag, CheckCircle } from 'lucide-react';
import { api } from '@/services/api';

const itemSchema = z.object({
  produto: z.string().min(1, 'Obrigatório'),
  categoria: z.string().optional(),
  quantidade: z.number().int().min(1),
  valorUnitario: z.number().min(0.01, 'Valor inválido'),
});

const schema = z.object({
  clienteId: z.string().uuid('Selecione uma cliente'),
  formaPagamento: z.enum(['pix', 'credito', 'debito', 'dinheiro', 'link', 'boleto', 'crediario']),
  parcelas: z.number().int().min(1).optional(),
  codigoCupom: z.string().optional(),
  observacoes: z.string().optional(),
  itens: z.array(itemSchema).min(1, 'Adicione pelo menos 1 item'),
});

type FormData = z.infer<typeof schema>;

const PAGAMENTOS = [
  { value: 'pix', label: 'PIX' },
  { value: 'credito', label: 'Crédito' },
  { value: 'debito', label: 'Débito' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'link', label: 'Link de Pagamento' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'crediario', label: 'Crediário' },
];

const CATEGORIAS = ['vestidos', 'conjuntos', 'blusas', 'calças', 'saias', 'acessórios', 'calçados', 'bolsas', 'outro'];

export function NovaVenda() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [buscaCliente, setBuscaCliente] = useState('');
  const [cupomValidado, setCupomValidado] = useState<{
    valorDesconto: number;
    tipo: string;
    valor: number;
  } | null>(null);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      formaPagamento: 'pix',
      parcelas: 1,
      itens: [{ produto: '', quantidade: 1, valorUnitario: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'itens' });

  const { data: clientes } = useQuery({
    queryKey: ['clientes-busca', buscaCliente],
    queryFn: () =>
      api.get('/clientes', { params: { busca: buscaCliente, limit: 10 } }).then((r) => r.data),
    enabled: buscaCliente.length >= 2,
  });

  const itens = watch('itens');
  const clienteId = watch('clienteId');
  const formaPagamento = watch('formaPagamento');
  const codigoCupom = watch('codigoCupom');

  const subtotal = itens.reduce(
    (acc, item) => acc + (Number(item.valorUnitario) || 0) * (Number(item.quantidade) || 0),
    0,
  );
  const desconto = cupomValidado?.valorDesconto ?? 0;
  const total = Math.max(subtotal - desconto, 0);

  const validarCupomMutation = useMutation({
    mutationFn: () =>
      api
        .get(`/cupons/${codigoCupom}/validar`, {
          params: { clienteId, subtotal },
        })
        .then((r) => r.data),
    onSuccess: (data) => {
      setCupomValidado({
        valorDesconto: data.valorDesconto,
        tipo: data.cupom.tipoDesconto,
        valor: data.cupom.valor,
      });
    },
    onError: () => {
      setCupomValidado(null);
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.post('/vendas', data).then((r) => r.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
      navigate(`/vendas/${data.id}`);
    },
  });

  const inputClass = 'w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';
  const labelClass = 'block text-sm font-medium text-foreground mb-1';

  return (
    <div className="p-6">
      <Link to="/vendas" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={16} />
        Voltar para vendas
      </Link>

      <h1 className="text-2xl font-bold mb-6">Nova Venda</h1>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6 max-w-3xl">

        {/* Cliente */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="font-semibold">Cliente</h2>
          <div>
            <label className={labelClass}>Buscar cliente</label>
            <input
              value={buscaCliente}
              onChange={(e) => setBuscaCliente(e.target.value)}
              className={inputClass}
              placeholder="Digite o nome ou telefone..."
            />
            {clientes?.data?.length > 0 && (
              <div className="border border-input rounded-md mt-1 bg-white shadow-sm divide-y">
                {clientes.data.map((c: any) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setValue('clienteId', c.id);
                      setBuscaCliente(c.nomeCompleto);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                  >
                    <span className="font-medium">{c.nomeCompleto}</span>
                    <span className="text-muted-foreground ml-2">{c.telefone}</span>
                  </button>
                ))}
              </div>
            )}
            {errors.clienteId && (
              <p className="text-xs text-destructive mt-1">{errors.clienteId.message}</p>
            )}
          </div>
        </div>

        {/* Itens */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Itens da Venda</h2>
            <button
              type="button"
              onClick={() => append({ produto: '', quantidade: 1, valorUnitario: 0 })}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <Plus size={14} /> Adicionar item
            </button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-4">
                {index === 0 && <label className={labelClass}>Produto</label>}
                <input
                  {...register(`itens.${index}.produto`)}
                  className={inputClass}
                  placeholder="Nome do produto"
                />
              </div>
              <div className="col-span-3">
                {index === 0 && <label className={labelClass}>Categoria</label>}
                <select {...register(`itens.${index}.categoria`)} className={inputClass}>
                  <option value="">—</option>
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                {index === 0 && <label className={labelClass}>Qtd</label>}
                <input
                  {...register(`itens.${index}.quantidade`, { valueAsNumber: true })}
                  type="number"
                  min={1}
                  className={inputClass}
                />
              </div>
              <div className="col-span-2">
                {index === 0 && <label className={labelClass}>R$ unitário</label>}
                <input
                  {...register(`itens.${index}.valorUnitario`, { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min={0}
                  className={inputClass}
                />
              </div>
              <div className={`col-span-1 ${index === 0 ? 'mt-6' : ''}`}>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {errors.itens?.root && (
            <p className="text-xs text-destructive">{errors.itens.root.message}</p>
          )}
        </div>

        {/* Pagamento + Cupom */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="font-semibold">Pagamento</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Forma de pagamento</label>
              <select {...register('formaPagamento')} className={inputClass}>
                {PAGAMENTOS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            {formaPagamento === 'credito' && (
              <div>
                <label className={labelClass}>Parcelas</label>
                <select {...register('parcelas', { valueAsNumber: true })} className={inputClass}>
                  {[1, 2, 3, 4, 5, 6, 10, 12].map((n) => (
                    <option key={n} value={n}>{n}x</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>Cupom de desconto</label>
            <div className="flex gap-2">
              <input
                {...register('codigoCupom')}
                className={`${inputClass} flex-1`}
                placeholder="Código do cupom"
                style={{ textTransform: 'uppercase' }}
              />
              <button
                type="button"
                onClick={() => validarCupomMutation.mutate()}
                disabled={!codigoCupom || !clienteId || validarCupomMutation.isPending}
                className="flex items-center gap-1 px-3 py-2 border border-input rounded-md text-sm hover:bg-muted disabled:opacity-40"
              >
                <Tag size={14} /> Validar
              </button>
            </div>
            {validarCupomMutation.isError && (
              <p className="text-xs text-destructive mt-1">Cupom inválido ou não aplicável.</p>
            )}
            {cupomValidado && (
              <div className="flex items-center gap-2 mt-1 text-xs text-green-600">
                <CheckCircle size={14} />
                Desconto de R$ {cupomValidado.valorDesconto.toFixed(2)} aplicado
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>Observações</label>
            <textarea {...register('observacoes')} rows={2} className={inputClass} />
          </div>
        </div>

        {/* Resumo */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <h2 className="font-semibold mb-3">Resumo</h2>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            {desconto > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Desconto (cupom)</span>
                <span>- R$ {desconto.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-2 border-t border-border mt-2">
              <span>Total</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Pontos a gerar: ~{Math.floor(total)} pts
            </p>
          </div>
        </div>

        {mutation.isError && (
          <p className="text-sm text-destructive">Erro ao registrar venda. Verifique os dados.</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? 'Registrando...' : 'Registrar Venda'}
          </button>
          <Link
            to="/vendas"
            className="px-6 py-2.5 rounded-md text-sm font-medium border border-input hover:bg-muted transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

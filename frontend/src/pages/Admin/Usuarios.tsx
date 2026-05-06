import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, UserCog, X, CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/services/api';

const PERFIL_LABELS: Record<string, string> = { admin: 'Admin', gerente: 'Gerente', vendedora: 'Vendedora' };
const PERFIL_COLORS: Record<string, string> = { admin: 'bg-purple-100 text-purple-700', gerente: 'bg-blue-100 text-blue-700', vendedora: 'bg-green-100 text-green-700' };

const schema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6).optional().or(z.literal('')),
  perfil: z.enum(['admin', 'gerente', 'vendedora']),
  ativo: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

function FormModal({ inicial, onClose, onSalvo }: { inicial?: any; onClose: () => void; onSalvo: () => void }) {
  const queryClient = useQueryClient();
  const isEdit = !!inicial;
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: inicial ? { nome: inicial.nome, email: inicial.email, perfil: inicial.perfil, ativo: inicial.ativo } : { perfil: 'vendedora', ativo: true },
  });
  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = { ...data, senha: data.senha || undefined };
      return isEdit ? api.put(`/usuarios/${inicial.id}`, payload).then((r) => r.data) : api.post('/usuarios', payload).then((r) => r.data);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['usuarios'] }); onSalvo(); },
  });
  const ic = 'w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';
  const lc = 'block text-sm font-medium text-foreground mb-1';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-lg">{isEdit ? 'Editar Usuário' : 'Novo Usuário'}</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-5 space-y-4">
          <div><label className={lc}>Nome *</label><input {...register('nome')} className={ic} />{errors.nome && <p className="text-xs text-destructive mt-1">{errors.nome.message}</p>}</div>
          <div><label className={lc}>E-mail *</label><input {...register('email')} type="email" className={ic} />{errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}</div>
          <div><label className={lc}>{isEdit ? 'Nova senha (deixe em branco para não alterar)' : 'Senha *'}</label><input {...register('senha')} type="password" className={ic} placeholder="••••••" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={lc}>Perfil *</label>
              <select {...register('perfil')} className={ic}>
                <option value="vendedora">Vendedora</option>
                <option value="gerente">Gerente</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex items-end pb-0.5"><label className="flex items-center gap-2 cursor-pointer"><input {...register('ativo')} type="checkbox" className="w-4 h-4 rounded" /><span className="text-sm font-medium">Ativo</span></label></div>
          </div>
          {mutation.isError && <p className="text-sm text-destructive">Erro ao salvar usuário.</p>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={mutation.isPending} className="flex-1 bg-primary text-primary-foreground py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {mutation.isPending ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Usuário'}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 border border-input rounded-md text-sm hover:bg-muted">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminUsuarios() {
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const queryClient = useQueryClient();
  const { data: usuarios = [], isLoading } = useQuery<any[]>({ queryKey: ['usuarios'], queryFn: () => api.get('/usuarios').then((r) => r.data) });
  const toggleAtivo = useMutation({ mutationFn: (id: string) => api.patch(`/usuarios/${id}/toggle-ativo`).then((r) => r.data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }) });
  function handleClose() { setShowForm(false); setEditando(null); }
  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-xl md:text-2xl font-bold">Usuários</h1><p className="text-muted-foreground text-sm mt-1">{usuarios.length} usuários cadastrados</p></div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus size={16} /><span className="hidden sm:inline">Novo Usuário</span><span className="sm:hidden">Novo</span>
        </button>
      </div>
      {showForm && <FormModal inicial={editando} onClose={handleClose} onSalvo={handleClose} />}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        {isLoading ? <div className="p-8 text-center text-muted-foreground text-sm">Carregando...</div> : usuarios.length === 0 ? (
          <div className="p-8 text-center"><UserCog size={40} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-muted-foreground text-sm">Nenhum usuário cadastrado</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Nome</th><th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Perfil</th><th className="px-4 py-3 font-medium hidden md:table-cell">Último acesso</th>
                <th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Ações</th>
              </tr></thead>
              <tbody>
                {usuarios.map((u: any) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{u.nome}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${PERFIL_COLORS[u.perfil]}`}>{PERFIL_LABELS[u.perfil]}</span></td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{u.ultimoAcesso ? new Date(u.ultimoAcesso).toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="px-4 py-3"><button onClick={() => toggleAtivo.mutate(u.id)} className={`flex items-center gap-1 text-xs ${u.ativo ? 'text-green-600' : 'text-gray-400'}`}>{u.ativo ? <><CheckCircle size={14} /> Ativo</> : <><XCircle size={14} /> Inativo</>}</button></td>
                    <td className="px-4 py-3"><button onClick={() => { setEditando(u); setShowForm(true); }} className="text-xs text-primary hover:underline">Editar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Store, Lock } from 'lucide-react';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';

const schema = z.object({
  senha: z.string().min(1, 'Digite a senha'),
});

type FormData = z.infer<typeof schema>;

export function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      api.post('/auth/login', data).then((r) => r.data),
    onSuccess: (data) => {
      setAuth(data.accessToken, data.refreshToken, data.usuario);
      navigate('/dashboard');
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="w-full max-w-xs bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 rounded-full p-3 mb-3">
            <Store className="text-primary" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Moda CRM</h1>
          <p className="text-sm text-muted-foreground mt-1">Digite a senha para entrar</p>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                {...register('senha')}
                type="password"
                className="w-full border border-input rounded-md pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Senha de acesso"
                autoFocus
              />
            </div>
            {errors.senha && (
              <p className="text-xs text-destructive mt-1">{errors.senha.message}</p>
            )}
          </div>

          {mutation.isError && (
            <p className="text-xs text-destructive text-center">Senha incorreta.</p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-primary text-primary-foreground rounded-md py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

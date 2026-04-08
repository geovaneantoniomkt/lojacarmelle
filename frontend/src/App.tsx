import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { AppShell } from '@/components/layout/AppShell';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { ClientesLista } from '@/pages/Clientes/Lista';
import { ClientePerfil } from '@/pages/Clientes/Perfil';
import { ClienteCadastro } from '@/pages/Clientes/Cadastro';
import { HistoricoVendas } from '@/pages/Vendas/HistoricoVendas';
import { NovaVenda } from '@/pages/Vendas/NovaVenda';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppShell />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clientes" element={<ClientesLista />} />
          <Route path="clientes/novo" element={<ClienteCadastro />} />
          <Route path="clientes/:id" element={<ClientePerfil />} />
          <Route path="vendas" element={<HistoricoVendas />} />
          <Route path="vendas/nova" element={<NovaVenda />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

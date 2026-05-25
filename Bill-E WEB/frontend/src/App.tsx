import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Gestion from './pages/Gestion';
import Radicacion from './pages/Radicacion';
import Usuarios from './pages/Usuarios';
import Reportes from './pages/Reportes';
import Auditoria from './pages/Auditoria';

function RequireRole({
  roles,
  children,
  blockedEmails = [],
}: {
  roles: string[];
  children: ReactElement;
  blockedEmails?: string[];
}) {
  const rawUser = localStorage.getItem('billee_user');
  const user = rawUser ? JSON.parse(rawUser) : null;
  return roles.includes(user?.role) && !blockedEmails.includes(user?.email)
    ? children
    : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="gestion" element={<Gestion />} />
          <Route path="radicacion" element={<Radicacion />} />
          <Route path="usuarios" element={<RequireRole roles={['admin']}><Usuarios /></RequireRole>} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="auditoria" element={<RequireRole roles={['admin']}><Auditoria /></RequireRole>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

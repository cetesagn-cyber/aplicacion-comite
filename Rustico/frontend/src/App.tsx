import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Agenda from './pages/Agenda';
import Clientes from './pages/Clientes';
import Barberos from './pages/Barberos';

export default function App() {
  const cargarPerfil = useAuthStore(s => s.cargarPerfil);

  useEffect(() => { cargarPerfil(); }, [cargarPerfil]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="agenda"   element={<Agenda />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="barberos" element={<Barberos />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

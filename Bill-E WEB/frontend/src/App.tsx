import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Gestion from './pages/Gestion';
import Radicacion from './pages/Radicacion';
import Usuarios from './pages/Usuarios';
import Reportes from './pages/Reportes';
import Auditoria from './pages/Auditoria';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="gestion" element={<Gestion />} />
          <Route path="radicacion" element={<Radicacion />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="auditoria" element={<Auditoria />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

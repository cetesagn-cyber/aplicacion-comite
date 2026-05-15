import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus, Edit3, Trash2, X, Save, AlertTriangle,
  Shield, User, Eye, EyeOff, RefreshCw, CheckCircle, XCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface UsuarioData {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const ROLES: Record<string, { label: string; color: string }> = {
  admin:    { label: 'Administrador', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  operador: { label: 'Operador',      color: 'bg-blue-100   text-blue-800   border-blue-200'   },
  auditor:  { label: 'Auditor',       color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  visor:    { label: 'Visor',         color: 'bg-gray-100   text-gray-600   border-gray-200'   },
};

const authHeader = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('billee_token')}`,
});

// ── Modal Crear / Editar ─────────────────────────────────────────────────────
function UserModal({
  usuario, onSave, onClose,
}: { usuario: UsuarioData | null; onSave: () => void; onClose: () => void }) {
  const isNew = !usuario;
  const [form, setForm] = useState({
    full_name: usuario?.full_name || '',
    email:     usuario?.email     || '',
    role:      usuario?.role      || 'operador',
    is_active: usuario?.is_active ?? true,
    password:  '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  const handleSave = async () => {
    setError('');
    if (!form.full_name || !form.email || (!usuario && !form.password))
      return setError('Nombre, correo y contraseña son requeridos');

    setSaving(true);
    try {
      const body: any = { full_name: form.full_name, role: form.role, is_active: form.is_active };
      if (isNew) { body.email = form.email; body.password = form.password; }
      if (!isNew && form.password) body.password = form.password;

      const url    = isNew ? '/api/users' : `/api/users/${usuario!.id}`;
      const method = isNew ? 'POST' : 'PATCH';
      const res    = await fetch(url, { method, headers: authHeader(), body: JSON.stringify(body) });
      const data   = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSave();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const inp = 'w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none bg-gray-50 focus:bg-white transition-all';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{isNew ? 'Crear usuario' : 'Editar usuario'}</h2>
            {!isNew && <p className="text-xs text-gray-400 mt-0.5">{usuario!.email}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                 style={{ background: '#fff1f2', color: '#b21f2d', border: '1px solid #ffc7cc' }}>
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nombre completo</label>
            <input className={inp} value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Nombre completo" />
          </div>

          {isNew && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Correo corporativo</label>
              <input className={inp} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="usuario@cetesa.com.co" />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              {isNew ? 'Contraseña' : 'Nueva contraseña (dejar vacío para no cambiar)'}
            </label>
            <div className="relative">
              <input className={cn(inp, 'pr-10')} type={showPwd ? 'text' : 'password'}
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder={isNew ? 'Mínimo 8 caracteres' : '••••••••'} />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Rol</label>
              <select className={inp} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                {Object.entries(ROLES).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Estado</label>
              <select className={inp} value={String(form.is_active)} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'true' }))}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-5 pb-5">
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#e8394a,#b21f2d)' }}>
            <Save size={15} />{saving ? 'Guardando…' : isNew ? 'Crear usuario' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal Eliminar ────────────────────────────────────────────────────────────
function DeleteModal({ usuario, onConfirm, onClose }: { usuario: UsuarioData; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-red-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Eliminar usuario</h2>
        <p className="text-sm text-gray-500 mb-6">
          ¿Seguro que desea eliminar a <span className="font-semibold text-gray-800">{usuario.full_name}</span>?<br />
          <span className="text-xs text-gray-400">{usuario.email}</span>
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold">Eliminar</button>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Usuarios() {
  const [usuarios,  setUsuarios]  = useState<UsuarioData[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [modalUser, setModalUser] = useState<UsuarioData | null | 'new'>('new' as any);
  const [showModal, setShowModal] = useState(false);
  const [deleting,  setDeleting]  = useState<UsuarioData | null>(null);

  const meId = JSON.parse(localStorage.getItem('billee_user') || '{}').id;

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/users', { headers: authHeader() });
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);

  const handleDelete = async () => {
    if (!deleting) return;
    await fetch(`/api/users/${deleting.id}`, { method: 'DELETE', headers: authHeader() });
    setDeleting(null);
    fetchUsuarios();
  };

  const openNew  = () => { setModalUser(null); setShowModal(true); };
  const openEdit = (u: UsuarioData) => { setModalUser(u); setShowModal(true); };

  return (
    <div className="space-y-5">
      {showModal && (
        <UserModal
          usuario={modalUser as UsuarioData | null}
          onSave={() => { setShowModal(false); fetchUsuarios(); }}
          onClose={() => setShowModal(false)}
        />
      )}
      {deleting && <DeleteModal usuario={deleting} onConfirm={handleDelete} onClose={() => setDeleting(null)} />}

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-heading">Gestión de Usuarios</h1>
          <p className="text-gray-500 text-sm mt-1">Administra los accesos al portal Bill-e.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchUsuarios}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-600 rounded-xl hover:bg-gray-50 text-sm font-semibold">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={openNew}
            className="flex items-center gap-2 px-5 py-2 text-white rounded-xl text-sm font-bold shadow-sm"
            style={{ background: 'linear-gradient(135deg,#e8394a,#b21f2d)' }}>
            <UserPlus size={16} /> Nuevo usuario
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Usuario', 'Correo', 'Rol', 'Estado', 'Creado', 'Acciones'].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                  <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                ))}</tr>
              ))
            ) : usuarios.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">No hay usuarios registrados.</td></tr>
            ) : (
              usuarios.map(u => (
                <tr key={u.id} className={cn('transition-colors', u.id === meId ? 'bg-red-50/40' : 'hover:bg-gray-50/60')}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                           style={{ background: 'linear-gradient(135deg,#e8394a,#b21f2d)' }}>
                        {u.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{u.full_name}</p>
                        {u.id === meId && <p className="text-[10px] text-red-500 font-medium">Tú</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-sm">{u.email}</td>
                  <td className="px-5 py-4">
                    <span className={cn('px-2.5 py-1 text-[11px] font-bold rounded-full border', ROLES[u.role]?.color)}>
                      {ROLES[u.role]?.label ?? u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {u.is_active
                      ? <span className="flex items-center gap-1.5 text-green-700 text-xs font-semibold"><CheckCircle size={14} /> Activo</span>
                      : <span className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold"><XCircle size={14} /> Inactivo</span>
                    }
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs">
                    {new Date(u.created_at).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(u)} title="Editar"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => u.id !== meId && setDeleting(u)} title="Eliminar"
                        className={cn('p-1.5 rounded-lg transition-colors',
                          u.id === meId ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-red-600 hover:bg-red-50')}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Leyenda de roles */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(ROLES).map(([, { label, color }]) => (
          <span key={label} className={cn('px-3 py-1 text-[11px] font-bold rounded-full border', color)}>{label}</span>
        ))}
        <span className="text-xs text-gray-400 self-center ml-1">— roles disponibles</span>
      </div>
    </div>
  );
}

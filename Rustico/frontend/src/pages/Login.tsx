import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export default function Login() {
  const [email, setEmail]       = useState('admin@rustico.co');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const { login, cargando }     = useAuthStore();
  const navigate                = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--fondo)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Marca */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 11, color: 'var(--texto-suave)', letterSpacing: '0.2em', marginBottom: 4 }}>
            BARBER & CONCEPT SHOP
          </div>
          <div style={{ fontSize: 42, fontWeight: 800, color: 'var(--blanco)', letterSpacing: '0.08em', lineHeight: 1 }}>
            RÚSTICO
          </div>
          <div style={{ width: 48, height: 2, background: 'var(--cobre)', margin: '12px auto 0' }} />
          <div style={{ marginTop: 10, fontSize: 13, color: 'var(--texto-suave)' }}>
            Panel de administración
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--superficie)',
          border: '1px solid var(--borde)',
          borderRadius: 12,
          padding: '32px 28px',
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--texto-suave)', marginBottom: 6, letterSpacing: '0.05em' }}>
                CORREO ELECTRÓNICO
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'var(--superficie2)', border: '1px solid var(--borde)',
                  borderRadius: 8, color: 'var(--texto)', fontSize: 14, outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--texto-suave)', marginBottom: 6, letterSpacing: '0.05em' }}>
                CONTRASEÑA
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'var(--superficie2)', border: '1px solid var(--borde)',
                  borderRadius: 8, color: 'var(--texto)', fontSize: 14, outline: 'none',
                }}
              />
            </div>

            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 8, marginBottom: 16,
                background: '#2e1a1a', border: '1px solid #5a2020', color: 'var(--error)', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              style={{
                width: '100%', padding: '12px',
                background: cargando ? 'var(--borde)' : 'var(--verde)',
                border: 'none', borderRadius: 8,
                color: 'var(--blanco)', fontSize: 15, fontWeight: 600,
                letterSpacing: '0.05em', transition: 'background 0.15s',
                cursor: cargando ? 'not-allowed' : 'pointer',
              }}
            >
              {cargando ? 'Ingresando…' : 'INGRESAR'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--texto-suave)' }}>
          Cra. 13 #78-17, Bogotá · Est. 2018
        </div>
      </div>
    </div>
  );
}

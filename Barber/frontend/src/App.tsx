import { useState } from 'react';
import LandingPage from './pages/landing/LandingPage';
import AdminPanel from './pages/admin/AdminPanel';
import Cart from './components/Cart';
import './App.css';

type View = 'landing' | 'admin';

export default function App() {
  const [view, setView] = useState<View>('landing');

  return (
    <>
      {view === 'landing' && (
        <LandingPage onAdminClick={() => setView('admin')} />
      )}
      {view === 'admin' && (
        <AdminPanel onBack={() => setView('landing')} />
      )}
      <Cart />
    </>
  );
}

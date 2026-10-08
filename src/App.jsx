import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Hero from './pages/Hero';
import ProductsAdmin from './pages/ProductsAdmin';
import FeaturesAdmin from './pages/FeaturesAdmin';
import ContactAdmin from './pages/ContactAdmin';
import SettingsAdmin from './pages/SettingsAdmin';
import FooterAdmin from './pages/FooterAdmin';
import SocialAdmin from './pages/SocialAdmin';
import Users from './pages/Users';
import UserPermissions from './pages/UserPermissions';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('admin_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - parsed.loginTime < sevenDays) setUser(parsed);
        else localStorage.removeItem('admin_user');
      } catch { localStorage.removeItem('admin_user'); }
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    const saved = localStorage.getItem('admin_user');
    if (saved) setUser(JSON.parse(saved));
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    setUser(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500">جاري التحميل...</p></div>;
  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <BrowserRouter>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/hero" element={<Hero />} />
          <Route path="/products" element={<ProductsAdmin />} />
          <Route path="/features" element={<FeaturesAdmin />} />
          <Route path="/contact" element={<ContactAdmin />} />
          <Route path="/settings" element={<SettingsAdmin />} />
          <Route path="/footer" element={<FooterAdmin />} />
          <Route path="/social" element={<SocialAdmin />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id/permissions" element={<UserPermissions />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

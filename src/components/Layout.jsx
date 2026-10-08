import { Link, useLocation } from 'react-router-dom';
import { Home, Palette, Droplet, Star, Phone, Settings, Users, LogOut, Menu, X, FileText, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { tursoQuery } from '../lib/turso';

export default function Layout({ user, onLogout, children }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logo, setLogo] = useState(null);
  const [siteName, setSiteName] = useState('مياه أنهار الطبيعة');

  useEffect(() => {
    tursoQuery('SELECT site_name, logo_image FROM settings WHERE id = 1')
      .then(rows => {
        if (rows && rows[0]) {
          if (rows[0].site_name) setSiteName(rows[0].site_name);
          if (rows[0].logo_image) setLogo(rows[0].logo_image);
        }
      })
      .catch(console.error);
  }, []);

  const menuItems = [
    { path: '/', label: 'الرئيسية', icon: Home },
    { path: '/hero', label: 'الصفحة الرئيسية', icon: Palette },
    { path: '/products', label: 'المنتجات', icon: Droplet },
    { path: '/features', label: 'لماذا نحن', icon: Star },
    { path: '/contact', label: 'التواصل', icon: Phone },
    { path: '/settings', label: 'الإعدادات', icon: Settings },
    { path: '/users', label: 'المستخدمين', icon: Users },
    { path: '/footer', label: 'التذييل', icon: FileText },
    { path: '/social', label: 'وسائل التواصل', icon: Share2 },
  ];

  const LogoDisplay = ({ size = 'md' }) => {
    const sizeClasses = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
    if (logo) {
      return <img src={logo} alt="Logo" className={sizeClasses + ' object-contain rounded-full bg-white p-1'} />;
    }
    return (
      <div className={sizeClasses + ' bg-white rounded-full flex items-center justify-center'}>
        <Droplet className="w-5 h-5 text-brand-blue" fill="currentColor" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-brand-dark text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <LogoDisplay />
            <div>
              <h1 className="font-bold text-sm">{siteName}</h1>
              <p className="text-xs text-gray-300">لوحة التحكم</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ' + (isActive ? 'bg-brand-blue text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white')}>
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="mb-3 flex items-center gap-2 text-xs text-gray-400">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-gray-400">مسجل الدخول</div>
              <div className="text-white font-bold">{user?.username}</div>
            </div>
          </div>
          <button onClick={onLogout} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" /> تسجيل خروج
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 right-0 left-0 bg-brand-dark text-white p-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          <LogoDisplay size="sm" />
          <h1 className="font-bold text-sm">{siteName}</h1>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-brand-dark z-30 pt-16">
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)} className={'flex items-center gap-3 px-4 py-3 rounded-lg ' + (isActive ? 'bg-brand-blue text-white' : 'text-gray-300')}>
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
            <button onClick={onLogout} className="w-full bg-red-600 text-white py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 mt-4">
              <LogOut className="w-4 h-4" /> تسجيل خروج
            </button>
          </nav>
        </div>
      )}

      <main className="flex-1 overflow-x-hidden md:pt-0 pt-16">
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}

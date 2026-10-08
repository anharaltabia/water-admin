import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Star, Users, Settings, Palette, Phone, Share2, FileText } from 'lucide-react';
import { tursoQuery } from '../lib/turso';

export default function Dashboard({ user }) {
  const [stats, setStats] = useState({ products: 0, features: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [products, features, users] = await Promise.all([
          tursoQuery('SELECT COUNT(*) as count FROM products'),
          tursoQuery('SELECT COUNT(*) as count FROM features'),
          tursoQuery('SELECT COUNT(*) as count FROM admin_users'),
        ]);
        setStats({
          products: parseInt(products[0].count) || 0,
          features: parseInt(features[0].count) || 0,
          users: parseInt(users[0].count) || 0,
        });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    loadStats();
  }, []);

  const statCards = [
    { icon: Droplet, label: 'المنتجات', value: stats.products, color: 'bg-blue-100 text-blue-700', iconBg: 'bg-blue-500', path: '/products' },
    { icon: Star, label: 'الميزات', value: stats.features, color: 'bg-yellow-100 text-yellow-700', iconBg: 'bg-yellow-500', path: '/features' },
    { icon: Users, label: 'المستخدمين', value: stats.users, color: 'bg-green-100 text-green-700', iconBg: 'bg-green-500', path: '/users' },
  ];

  const quickLinks = [
    { path: '/products', label: 'المنتجات', icon: Droplet, color: 'bg-blue-50 hover:bg-blue-100 text-blue-700' },
    { path: '/features', label: 'الميزات', icon: Star, color: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700' },
    { path: '/hero', label: 'Hero', icon: Palette, color: 'bg-purple-50 hover:bg-purple-100 text-purple-700' },
    { path: '/contact', label: 'التواصل', icon: Phone, color: 'bg-pink-50 hover:bg-pink-100 text-pink-700' },
    { path: '/social', label: 'وسائل التواصل', icon: Share2, color: 'bg-orange-50 hover:bg-orange-100 text-orange-700' },
    { path: '/footer', label: 'التذييل', icon: FileText, color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700' },
    { path: '/settings', label: 'الإعدادات', icon: Settings, color: 'bg-gray-100 hover:bg-gray-200 text-gray-700' },
    { path: '/users', label: 'المستخدمين', icon: Users, color: 'bg-green-50 hover:bg-green-100 text-green-700' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-dark mb-2">مرحباً بك 👋</h1>
        <p className="text-gray-600">
          أنت مسجل الدخول كـ <strong className="text-brand-blue">{user?.username}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} to={stat.path} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`${stat.color} text-xs font-bold px-3 py-1 rounded-full`}>{stat.label}</span>
              </div>
              <h3 className="text-3xl font-bold text-brand-dark">{loading ? '...' : stat.value}</h3>
            </Link>
          );
        })}
      </div>

      <div className="card">
        <h2 className="text-lg font-bold text-brand-dark mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" /> الروابط السريعة
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.path} to={link.path} className={`${link.color} p-4 rounded-xl text-center transition flex flex-col items-center gap-2`}>
                <Icon className="w-6 h-6" />
                <span className="text-sm font-bold">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

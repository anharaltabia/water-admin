import { useState } from 'react';
import { tursoQuery } from '../lib/turso';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const rows = await tursoQuery(
        'SELECT * FROM admin_users WHERE username = ?',
        [username]
      );

      if (!rows || rows.length === 0) {
        setError('اسم المستخدم غير صحيح');
        setLoading(false);
        return;
      }

      const user = rows[0];

      // ⚠️ مقارنة مباشرة (مؤقتاً) — سنستخدم bcrypt لاحقاً
      if (user.password_hash !== password) {
        setError('كلمة المرور غير صحيحة');
        setLoading(false);
        return;
      }

      // حفظ الجلسة
      localStorage.setItem('admin_user', JSON.stringify({
        id: user.id,
        username: user.username,
        loginTime: Date.now(),
      }));

      onLogin();
    } catch (err) {
      console.error(err);
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue to-brand-dark flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-brand-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C12 2 5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-brand-dark">لوحة التحكم</h1>
          <p className="text-gray-500 text-sm mt-1">مياه أنهار الطبيعة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-brand-dark mb-2">
              اسم المستخدم
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="input-field"
              placeholder="أدخل اسم المستخدم"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-brand-dark mb-2">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
              placeholder="أدخل كلمة المرور"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          © 2016 مياه أنهار الطبيعة
        </p>
      </div>
    </div>
  );
}

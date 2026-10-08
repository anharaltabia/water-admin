import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Trash2, Plus, UserPlus, X, Loader2 } from 'lucide-react';
import { tursoQuery } from '../lib/turso';

export default function Users({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'admin';
  const permissions = user?.permissions || [];
  const can = (code) => isAdmin || permissions.includes(code);

  const loadUsers = async () => {
    try {
      const data = await tursoQuery('SELECT id, username, role, created_at FROM admin_users ORDER BY id');
      setUsers(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!can('users.create')) return;
    setError('');
    if (!newUser.username || !newUser.password) { setError('يرجى ملء جميع الحقول'); return; }
    try {
      const existing = await tursoQuery('SELECT id FROM admin_users WHERE username = ?', [newUser.username]);
      if (existing && existing.length > 0) { setError('اسم المستخدم موجود'); return; }
      await tursoQuery('INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)', [newUser.username, newUser.password, 'editor']);
      setNewUser({ username: '', password: '' });
      setShowAddModal(false);
      loadUsers();
    } catch (err) { console.error(err); setError('حدث خطأ'); }
  };

  const handleDelete = async (id, username) => {
    if (!can('users.delete')) return;
    if (username === 'admin') { alert('لا يمكن حذف admin'); return; }
    if (!confirm('حذف "' + username + '"؟')) return;
    try {
      await tursoQuery('DELETE FROM user_permissions WHERE user_id = ?', [id]);
      await tursoQuery('DELETE FROM admin_users WHERE id = ?', [id]);
      loadUsers();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">إدارة المستخدمين</h1>
          <p className="text-gray-500 text-sm mt-1">{can('users.edit') ? 'إضافة وحذف المستخدمين' : 'عرض فقط'}</p>
        </div>
        {can('users.create') && (
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2"><UserPlus className="w-4 h-4" /> <span>إضافة مستخدم</span></button>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-right p-4 text-sm font-bold text-gray-700">#</th>
                <th className="text-right p-4 text-sm font-bold text-gray-700">اسم المستخدم</th>
                <th className="text-right p-4 text-sm font-bold text-gray-700">الدور</th>
                <th className="text-right p-4 text-sm font-bold text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-sm">{u.id}</td>
                  <td className="p-4 font-bold text-brand-dark">
                    {u.username}
                    {u.username === 'admin' && <span className="mr-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">رئيسي</span>}
                  </td>
                  <td className="p-4 text-sm">
                    <span className={'px-3 py-1 rounded-full text-xs font-bold ' + (u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700')}>{u.role === 'admin' ? 'مدير' : 'محرر'}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {can('users.permissions') && (
                        <Link to={'/users/' + u.id + '/permissions'} className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-bold transition flex items-center gap-1"><Shield className="w-4 h-4" /> <span className="hidden sm:inline">الصلاحيات</span></Link>
                      )}
                      {can('users.delete') && u.username !== 'admin' && (
                        <button onClick={() => handleDelete(u.id, u.username)} className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2"><UserPlus className="w-5 h-5" /> إضافة مستخدم</h2>
              <button onClick={() => { setShowAddModal(false); setError(''); setNewUser({ username: '', password: '' }); }} className="text-gray-400"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-brand-dark mb-2">اسم المستخدم</label>
                <input type="text" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-brand-dark mb-2">كلمة المرور</label>
                <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="input-field" required />
              </div>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">⚠️ {error}</div>}
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> إضافة</button>
                <button type="button" onClick={() => { setShowAddModal(false); setError(''); }} className="btn-outline">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tursoQuery } from '../lib/turso';

export default function UserPermissions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [userPermissions, setUserPermissions] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      // جلب المستخدم
      const users = await tursoQuery('SELECT * FROM admin_users WHERE id = ?', [id]);
      if (!users || users.length === 0) {
        navigate('/users');
        return;
      }
      setUser(users[0]);

      // جلب كل الصلاحيات
      const perms = await tursoQuery('SELECT * FROM permissions ORDER BY sort_order');
      setPermissions(perms || []);

      // جلب صلاحيات المستخدم
      const userPerms = await tursoQuery(
        'SELECT permission_id FROM user_permissions WHERE user_id = ?',
        [id]
      );
      setUserPermissions(new Set(userPerms.map(p => Number(p.permission_id))));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permId) => {
    const newSet = new Set(userPermissions);
    if (newSet.has(permId)) {
      newSet.delete(permId);
    } else {
      newSet.add(permId);
    }
    setUserPermissions(newSet);
    setSaved(false);
  };

  const toggleScreen = (screen, checked) => {
    const newSet = new Set(userPermissions);
    const screenPerms = permissions.filter(p => p.screen === screen);
    screenPerms.forEach(p => {
      if (checked) {
        newSet.add(Number(p.id));
      } else {
        newSet.delete(Number(p.id));
      }
    });
    setUserPermissions(newSet);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // حذف كل الصلاحيات القديمة
      await tursoQuery('DELETE FROM user_permissions WHERE user_id = ?', [id]);

      // إضافة الصلاحيات الجديدة
      for (const permId of userPermissions) {
        await tursoQuery(
          'INSERT INTO user_permissions (user_id, permission_id) VALUES (?, ?)',
          [id, permId]
        );
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">جاري التحميل...</div>;
  }

  // تجميع الصلاحيات حسب الشاشة
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.screen]) {
      acc[perm.screen] = {
        label: perm.screen_label,
        items: [],
      };
    }
    acc[perm.screen].items.push(perm);
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/users" className="text-gray-500 hover:text-brand-blue text-2xl">
            ←
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-dark">
              صلاحيات: {user?.username}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              حدد ما يمكن لهذا المستخدم فعله في كل شاشة
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? 'جاري الحفظ...' : saved ? '✅ تم الحفظ' : '💾 حفظ الصلاحيات'}
        </button>
      </div>

      {/* Permissions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(groupedPermissions).map(([screen, data]) => {
          const allChecked = data.items.every(p => userPermissions.has(Number(p.id)));
          const someChecked = data.items.some(p => userPermissions.has(Number(p.id)));

          return (
            <div key={screen} className="card">
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <h3 className="font-bold text-brand-dark text-lg">
                  {data.label}
                </h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={el => {
                      if (el) el.indeterminate = someChecked && !allChecked;
                    }}
                    onChange={(e) => toggleScreen(screen, e.target.checked)}
                    className="w-4 h-4 accent-brand-blue"
                  />
                  <span className="text-xs text-gray-500">الكل</span>
                </label>
              </div>

              <div className="space-y-3">
                {data.items.map((perm) => (
                  <label
                    key={perm.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={userPermissions.has(Number(perm.id))}
                      onChange={() => togglePermission(Number(perm.id))}
                      className="w-5 h-5 accent-brand-blue cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* زر الحفظ في الأسفل */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary disabled:opacity-50"
        >
          {saving ? 'جاري الحفظ...' : saved ? '✅ تم الحفظ' : '💾 حفظ الصلاحيات'}
        </button>
      </div>
    </div>
  );
}

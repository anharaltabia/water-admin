import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tursoQuery } from '../lib/turso';
import { Loader2, Save } from 'lucide-react';

export default function UserPermissions({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [targetUser, setTargetUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [userPermissions, setUserPermissions] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isAdmin = user?.role === 'admin';
  const myPermissions = user?.permissions || [];
  const canEdit = isAdmin || myPermissions.includes('users.permissions');

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      const users = await tursoQuery('SELECT * FROM admin_users WHERE id = ?', [id]);
      if (!users || users.length === 0) { navigate('/users'); return; }
      setTargetUser(users[0]);
      const perms = await tursoQuery('SELECT * FROM permissions ORDER BY sort_order');
      setPermissions(perms || []);
      const userPerms = await tursoQuery('SELECT permission_id FROM user_permissions WHERE user_id = ?', [id]);
      setUserPermissions(new Set(userPerms.map(p => Number(p.permission_id))));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const togglePermission = (permId) => {
    if (!canEdit) return;
    const newSet = new Set(userPermissions);
    if (newSet.has(permId)) newSet.delete(permId); else newSet.add(permId);
    setUserPermissions(newSet);
    setSaved(false);
  };

  const toggleScreen = (screen, checked) => {
    if (!canEdit) return;
    const newSet = new Set(userPermissions);
    permissions.filter(p => p.screen === screen).forEach(p => {
      if (checked) newSet.add(Number(p.id)); else newSet.delete(Number(p.id));
    });
    setUserPermissions(newSet);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!canEdit) return;
    setSaving(true);
    try {
      await tursoQuery('DELETE FROM user_permissions WHERE user_id = ?', [id]);
      for (const permId of userPermissions) {
        await tursoQuery('INSERT INTO user_permissions (user_id, permission_id) VALUES (?, ?)', [id, permId]);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(err); alert('حدث خطأ'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>;

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.screen]) acc[perm.screen] = { label: perm.screen_label, items: [] };
    acc[perm.screen].items.push(perm);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/users" className="text-gray-500 hover:text-brand-blue text-2xl">←</Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-dark">صلاحيات: {targetUser?.username}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {canEdit ? 'حدد ما يمكن لهذا المستخدم فعله في كل شاشة' : 'عرض فقط'}
            </p>
          </div>
        </div>
        {canEdit && (
          <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50 flex items-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...</> : saved ? <>✅ تم الحفظ</> : <><Save className="w-4 h-4" /> حفظ الصلاحيات</>}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(groupedPermissions).map(([screen, data]) => {
          const allChecked = data.items.every(p => userPermissions.has(Number(p.id)));
          return (
            <div key={screen} className="card">
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <h3 className="font-bold text-brand-dark text-lg">{data.label}</h3>
                {canEdit && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={allChecked} onChange={(e) => toggleScreen(screen, e.target.checked)} className="w-4 h-4 accent-brand-blue" />
                    <span className="text-xs text-gray-500">الكل</span>
                  </label>
                )}
              </div>
              <div className="space-y-3">
                {data.items.map((perm) => (
                  <label key={perm.id} className={'flex items-center gap-3 p-2 rounded-lg ' + (canEdit ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default')}>
                    <input type="checkbox" checked={userPermissions.has(Number(perm.id))} onChange={() => togglePermission(Number(perm.id))} disabled={!canEdit} className="w-5 h-5 accent-brand-blue cursor-pointer disabled:cursor-not-allowed" />
                    <span className="text-sm text-gray-700">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {canEdit && (
        <div className="mt-8 flex justify-end">
          <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50 flex items-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...</> : saved ? <>✅ تم الحفظ</> : <><Save className="w-4 h-4" /> حفظ الصلاحيات</>}
          </button>
        </div>
      )}
    </div>
  );
}

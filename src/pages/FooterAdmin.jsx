import { useState, useEffect } from 'react';
import { FileText, Save, Loader2 } from 'lucide-react';
import { tursoQuery } from '../lib/turso';

export default function FooterAdmin({ user }) {
  const [form, setForm] = useState({ footer_about: '', footer_copyright: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isAdmin = user?.role === 'admin';
  const permissions = user?.permissions || [];
  const canEdit = isAdmin || permissions.includes('footer.edit');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const rows = await tursoQuery('SELECT footer_about, footer_copyright FROM settings WHERE id = 1');
      if (rows && rows.length > 0) {
        setForm({ footer_about: rows[0].footer_about || '', footer_copyright: rows[0].footer_copyright || '' });
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) return;
    setSaving(true);
    try {
      await tursoQuery('UPDATE settings SET footer_about = ?, footer_copyright = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1', [form.footer_about, form.footer_copyright]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-dark flex items-center gap-2"><FileText className="w-6 h-6" /> التذييل (Footer)</h1>
        <p className="text-gray-500 text-sm mt-1">{canEdit ? 'تعديل نصوص أسفل الموقع' : 'عرض فقط'}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-brand-dark mb-2">نبذة عن الشركة</label>
              <textarea value={form.footer_about} onChange={(e) => setForm({ ...form, footer_about: e.target.value })} disabled={!canEdit} className="input-field resize-none disabled:opacity-70 disabled:cursor-not-allowed" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-dark mb-2">نص حقوق النشر</label>
              <input type="text" value={form.footer_copyright} onChange={(e) => setForm({ ...form, footer_copyright: e.target.value })} disabled={!canEdit} className="input-field disabled:opacity-70 disabled:cursor-not-allowed" />
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...</> : saved ? <>✅ تم الحفظ</> : <><Save className="w-4 h-4" /> حفظ التغييرات</>}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

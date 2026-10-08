import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Save, Loader2 } from 'lucide-react';
import { tursoQuery } from '../lib/turso';

export default function ContactAdmin({ user }) {
  const [form, setForm] = useState({ phone1: '', email: '', whatsapp: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isAdmin = user?.role === 'admin';
  const permissions = user?.permissions || [];
  const canEdit = isAdmin || permissions.includes('contact.edit');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const rows = await tursoQuery('SELECT * FROM contact WHERE id = 1');
      if (rows && rows.length > 0) {
        setForm({ phone1: rows[0].phone1 || '', email: rows[0].phone2 || '', whatsapp: rows[0].whatsapp || '', address: rows[0].address || '' });
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) return;
    setSaving(true);
    try {
      await tursoQuery('UPDATE contact SET phone1 = ?, phone2 = ?, whatsapp = ?, address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1', [form.phone1, form.email, form.whatsapp, form.address]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-dark flex items-center gap-2">
          <Phone className="w-6 h-6" /> معلومات التواصل
        </h1>
        <p className="text-gray-500 text-sm mt-1">{canEdit ? 'تعديل أرقام الهاتف والعنوان' : 'عرض فقط'}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-brand-dark mb-2 flex items-center gap-2"><Phone className="w-4 h-4" /> رقم الهاتف</label>
              <input type="text" value={form.phone1} onChange={(e) => setForm({ ...form, phone1: e.target.value })} disabled={!canEdit} className="input-field disabled:opacity-70 disabled:cursor-not-allowed" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-dark mb-2 flex items-center gap-2"><Mail className="w-4 h-4" /> البريد الإلكتروني</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={!canEdit} className="input-field disabled:opacity-70 disabled:cursor-not-allowed" dir="ltr" placeholder="example@gmail.com" />
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-dark mb-2 flex items-center gap-2"><MessageCircle className="w-4 h-4" /> رقم واتساب</label>
              <input type="text" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} disabled={!canEdit} className="input-field disabled:opacity-70 disabled:cursor-not-allowed" placeholder="967779322241" dir="ltr" />
              <p className="text-xs text-gray-500 mt-1">مثال: 967779322241 (بدون + أو مسافات)</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-dark mb-2 flex items-center gap-2"><MapPin className="w-4 h-4" /> العنوان</label>
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} disabled={!canEdit} className="input-field disabled:opacity-70 disabled:cursor-not-allowed" />
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

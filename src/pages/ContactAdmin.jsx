import { useState, useEffect } from 'react';
import { Phone, Save, Loader2 } from 'lucide-react';
import { tursoQuery } from '../lib/turso';

export default function ContactAdmin() {
  const [form, setForm] = useState({ phone1: '', phone2: '', address: '', whatsapp: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const rows = await tursoQuery('SELECT * FROM contact WHERE id = 1');
      if (rows && rows.length > 0) {
        setForm({
          phone1: rows[0].phone1 || '',
          phone2: rows[0].phone2 || '',
          address: rows[0].address || '',
          whatsapp: rows[0].whatsapp || '',
        });
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await tursoQuery(
        'UPDATE contact SET phone1 = ?, phone2 = ?, address = ?, whatsapp = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
        [form.phone1, form.phone2, form.address, form.whatsapp]
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      setError('حدث خطأ');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-dark flex items-center gap-2">
          <Phone className="w-6 h-6" /> معلومات التواصل
        </h1>
        <p className="text-gray-500 text-sm mt-1">تعديل أرقام الهاتف والعنوان</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-brand-dark mb-2">رقم الهاتف 1</label>
              <input type="text" value={form.phone1} onChange={(e) => setForm({ ...form, phone1: e.target.value })} className="input-field" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-dark mb-2">رقم الهاتف 2</label>
              <input type="text" value={form.phone2} onChange={(e) => setForm({ ...form, phone2: e.target.value })} className="input-field" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-dark mb-2">رقم واتساب (بصيغة دولية)</label>
              <input type="text" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="input-field" placeholder="967779322241" dir="ltr" />
              <p className="text-xs text-gray-500 mt-1">مثال: 967779322241 (بدون + أو مسافات)</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-dark mb-2">العنوان</label>
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" />
            </div>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">⚠️ {error}</div>}

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...</> : saved ? <>✅ تم الحفظ</> : <><Save className="w-4 h-4" /> حفظ التغييرات</>}
          </button>
        </div>
      </form>
    </div>
  );
}

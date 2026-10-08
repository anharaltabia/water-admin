import { useState, useEffect } from 'react';
import { Palette, Save, Loader2 } from 'lucide-react';
import { tursoQuery } from '../lib/turso';
import ImageUploader from '../components/ImageUploader';

export default function Hero({ user }) {
  const [form, setForm] = useState({ title: '', subtitle: '', description: '', ph_value: '', ph_label: '', image_url: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'admin';
  const permissions = user?.permissions || [];
  const can = (code) => isAdmin || permissions.includes(code);
  const canEdit = can('hero.edit');

  useEffect(() => { loadHero(); }, []);

  const loadHero = async () => {
    try {
      const rows = await tursoQuery('SELECT * FROM hero WHERE id = 1');
      if (rows && rows.length > 0) {
        setForm({
          title: rows[0].title || '',
          subtitle: rows[0].subtitle || '',
          description: rows[0].description || '',
          ph_value: rows[0].ph_value || '',
          ph_label: rows[0].ph_label || '',
          image_url: rows[0].image_url || '',
        });
      }
    } catch (err) { console.error(err); setError('حدث خطأ'); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => {
    if (!canEdit) return;
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) return;
    setSaving(true);
    setError('');
    try {
      await tursoQuery(
        'UPDATE hero SET title = ?, subtitle = ?, description = ?, ph_value = ?, ph_label = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
        [form.title, form.subtitle, form.description, form.ph_value, form.ph_label, form.image_url]
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(err); setError('حدث خطأ'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-dark flex items-center gap-2">
          <Palette className="w-6 h-6" /> الصفحة الرئيسية (Hero)
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {canEdit ? 'تعديل العنوان والوصف والصورة الرئيسية' : 'عرض فقط'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="font-bold text-brand-dark mb-4 pb-3 border-b">المحتوى</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-brand-dark mb-2">العنوان الرئيسي</label>
              <input type="text" name="title" value={form.title} onChange={handleChange} disabled={!canEdit} className="input-field disabled:opacity-70 disabled:cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-dark mb-2">العنوان الفرعي</label>
              <input type="text" name="subtitle" value={form.subtitle} onChange={handleChange} disabled={!canEdit} className="input-field disabled:opacity-70 disabled:cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-dark mb-2">الوصف</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} disabled={!canEdit} className="input-field resize-none disabled:opacity-70 disabled:cursor-not-allowed" />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-bold text-brand-dark mb-4 pb-3 border-b">بطاقة PH</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-brand-dark mb-2">قيمة PH</label>
              <input type="text" name="ph_value" value={form.ph_value} onChange={handleChange} disabled={!canEdit} className="input-field disabled:opacity-70 disabled:cursor-not-allowed" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-dark mb-2">نص PH</label>
              <input type="text" name="ph_label" value={form.ph_label} onChange={handleChange} disabled={!canEdit} className="input-field disabled:opacity-70 disabled:cursor-not-allowed" />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-bold text-brand-dark mb-4 pb-3 border-b">الصورة الرئيسية</h2>
          {canEdit ? (
            <ImageUploader value={form.image_url} onChange={(url) => { setForm({ ...form, image_url: url }); setSaved(false); }} label="صورة الـ Hero" />
          ) : (
            form.image_url ? <img src={form.image_url} alt="Hero" className="w-40 h-40 object-cover rounded-xl border-2 border-gray-200" /> : <p className="text-gray-400 text-sm">لا توجد صورة</p>
          )}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">⚠️ {error}</div>}

        {canEdit && (
          <div className="flex justify-end gap-3">
            <button type="button" onClick={loadHero} className="btn-outline">إلغاء</button>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...</> : saved ? <>✅ تم الحفظ</> : <><Save className="w-4 h-4" /> حفظ التغييرات</>}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

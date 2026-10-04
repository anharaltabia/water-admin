import { useState, useEffect } from 'react';
import { Settings, Save, Loader2 } from 'lucide-react';
import { tursoQuery } from '../lib/turso';
import ImageUploader from '../components/ImageUploader';

export default function SettingsAdmin() {
  const [form, setForm] = useState({ site_name: '', site_tagline: '', logo_image: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const rows = await tursoQuery('SELECT * FROM settings WHERE id = 1');
      if (rows && rows.length > 0) {
        setForm({
          site_name: rows[0].site_name || '',
          site_tagline: rows[0].site_tagline || '',
          logo_image: rows[0].logo_image || '',
        });
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await tursoQuery(
        'UPDATE settings SET site_name = ?, site_tagline = ?, logo_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
        [form.site_name, form.site_tagline, form.logo_image]
      );
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
          <Settings className="w-6 h-6" /> الإعدادات
        </h1>
        <p className="text-gray-500 text-sm mt-1">تعديل اسم الموقع والشعار</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="font-bold text-brand-dark mb-4 pb-3 border-b">الهوية</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-brand-dark mb-2">اسم الموقع</label>
              <input type="text" value={form.site_name} onChange={(e) => setForm({ ...form, site_name: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-dark mb-2">الشعار النصي (Tagline)</label>
              <input type="text" value={form.site_tagline} onChange={(e) => setForm({ ...form, site_tagline: e.target.value })} className="input-field" />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-bold text-brand-dark mb-4 pb-3 border-b">الشعار (Logo)</h2>
          <ImageUploader
            value={form.logo_image}
            onChange={(url) => setForm({ ...form, logo_image: url })}
            label="صورة الشعار"
          />
          <p className="text-xs text-gray-500 mt-2">💡 ارفع شعار الشركة (PNG بخلفية شفافة مفضل)</p>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...</> : saved ? <>✅ تم الحفظ</> : <><Save className="w-4 h-4" /> حفظ التغييرات</>}
          </button>
        </div>
      </form>
    </div>
  );
}

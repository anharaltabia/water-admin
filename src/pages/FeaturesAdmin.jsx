import { useState, useEffect } from 'react';
import { Star, Plus, Edit2, Trash2, X, Save, Loader2 } from 'lucide-react';
import { tursoQuery } from '../lib/turso';

const ICONS = [
  { value: 'beaker', label: 'مختبر' },
  { value: 'shield', label: 'درع' },
  { value: 'badge', label: 'شارة' },
  { value: 'home', label: 'منزل' },
];

export default function FeaturesAdmin() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', icon_name: 'shield', sort_order: 0 });

  const loadFeatures = async () => {
    try {
      const data = await tursoQuery('SELECT * FROM features ORDER BY sort_order ASC');
      setFeatures(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadFeatures(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ title: '', description: '', icon_name: 'shield', sort_order: features.length + 1 });
    setError('');
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title || '',
      description: item.description || '',
      icon_name: item.icon_name || 'shield',
      sort_order: item.sort_order || 0,
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    if (!form.title) { setError('العنوان مطلوب'); setSaving(false); return; }

    try {
      if (editing) {
        await tursoQuery(
          'UPDATE features SET title = ?, description = ?, icon_name = ?, sort_order = ? WHERE id = ?',
          [form.title, form.description, form.icon_name, form.sort_order, editing.id]
        );
      } else {
        await tursoQuery(
          'INSERT INTO features (title, description, icon_name, sort_order) VALUES (?, ?, ?, ?)',
          [form.title, form.description, form.icon_name, form.sort_order]
        );
      }
      setShowModal(false);
      loadFeatures();
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء الحفظ');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, title) => {
    if (!confirm('حذف "' + title + '"؟')) return;
    try {
      await tursoQuery('DELETE FROM features WHERE id = ?', [id]);
      loadFeatures();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark flex items-center gap-2">
            <Star className="w-6 h-6" />
            إدارة "لماذا نحن"
          </h1>
          <p className="text-gray-500 text-sm mt-1">إضافة وتعديل الميزات</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>إضافة ميزة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((item) => (
          <div key={item.id} className="card flex items-start gap-4">
            <div className="w-12 h-12 bg-brand-blue rounded-xl flex items-center justify-center flex-shrink-0">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-brand-dark mb-1">{item.title}</h3>
              <p className="text-gray-500 text-sm mb-3">{item.description}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(item)} className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1">
                  <Edit2 className="w-3 h-3" /> تعديل
                </button>
                <button onClick={() => handleDelete(item.id, item.title)} className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs transition">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {features.length === 0 && (
        <div className="card text-center py-12 text-gray-500">لا توجد ميزات بعد.</div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-brand-dark">{editing ? 'تعديل ميزة' : 'إضافة ميزة'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-brand-dark mb-2">العنوان *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-brand-dark mb-2">الوصف</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-brand-dark mb-2">الأيقونة</label>
                  <select value={form.icon_name} onChange={(e) => setForm({ ...form, icon_name: e.target.value })} className="input-field">
                    {ICONS.map((ic) => <option key={ic.value} value={ic.value}>{ic.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-brand-dark mb-2">ترتيب</label>
                  <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="input-field" dir="ltr" />
                </div>
              </div>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">⚠️ {error}</div>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...</> : <><Save className="w-4 h-4" /> {editing ? 'حفظ' : 'إضافة'}</>}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Share2, Plus, Trash2, Save, Loader2, Edit2, X } from 'lucide-react';
import { tursoQuery } from '../lib/turso';

const PLATFORMS = [
  { value: 'facebook', label: 'فيسبوك' }, { value: 'whatsapp', label: 'واتساب' },
  { value: 'instagram', label: 'إنستغرام' }, { value: 'twitter', label: 'تويتر (X)' },
  { value: 'youtube', label: 'يوتيوب' }, { value: 'tiktok', label: 'تيك توك' },
  { value: 'telegram', label: 'تيليجرام' }, { value: 'linkedin', label: 'لينكد إن' },
  { value: 'email', label: 'البريد الإلكتروني' }, { value: 'website', label: 'موقع إلكتروني' },
];

export default function SocialAdmin({ user }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ platform: 'facebook', url: '', sort_order: 0 });

  const isAdmin = user?.role === 'admin';
  const permissions = user?.permissions || [];
  const can = (code) => isAdmin || permissions.includes(code);

  const loadLinks = async () => {
    try {
      const data = await tursoQuery('SELECT * FROM social_links ORDER BY sort_order');
      setLinks(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadLinks(); }, []);

  const openAdd = () => {
    if (!can('social.create')) return;
    setEditing(null);
    setForm({ platform: 'facebook', url: '', sort_order: links.length + 1 });
    setShowModal(true);
  };

  const openEdit = (link) => {
    if (!can('social.edit')) return;
    setEditing(link);
    setForm({ platform: link.platform || 'facebook', url: link.url || '', sort_order: link.sort_order || 0 });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.url) return;
    try {
      if (editing) {
        await tursoQuery('UPDATE social_links SET platform = ?, url = ?, sort_order = ? WHERE id = ?', [form.platform, form.url, form.sort_order, editing.id]);
      } else {
        await tursoQuery('INSERT INTO social_links (platform, url, sort_order) VALUES (?, ?, ?)', [form.platform, form.url, form.sort_order]);
      }
      setShowModal(false);
      loadLinks();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id, platform) => {
    if (!can('social.delete')) return;
    if (!confirm('حذف ' + platform + '؟')) return;
    try {
      await tursoQuery('DELETE FROM social_links WHERE id = ?', [id]);
      loadLinks();
    } catch (err) { console.error(err); }
  };

  const toggleActive = async (link) => {
    if (!can('social.edit')) return;
    try {
      await tursoQuery('UPDATE social_links SET is_active = ? WHERE id = ?', [link.is_active ? 0 : 1, link.id]);
      loadLinks();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark flex items-center gap-2"><Share2 className="w-6 h-6" /> وسائل التواصل</h1>
          <p className="text-gray-500 text-sm mt-1">{can('social.edit') ? 'إدارة وسائل التواصل' : 'عرض فقط'}</p>
        </div>
        {can('social.create') && (
          <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> <span>إضافة</span></button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {links.map((link) => (
          <div key={link.id} className="card flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-brand-dark">{link.platform}</h3>
                <span className={'text-xs px-2 py-0.5 rounded-full ' + (link.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>{link.is_active ? 'نشط' : 'معطل'}</span>
              </div>
              <p className="text-gray-500 text-xs truncate" dir="ltr">{link.url}</p>
            </div>
            {(can('social.edit') || can('social.delete')) && (
              <div className="flex items-center gap-1">
                {can('social.edit') && (
                  <>
                    <button onClick={() => openEdit(link)} className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => toggleActive(link)} className={'p-2 rounded-lg transition ' + (link.is_active ? 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700' : 'bg-green-50 hover:bg-green-100 text-green-700')}>{link.is_active ? '⏸' : '▶'}</button>
                  </>
                )}
                {can('social.delete') && (
                  <button onClick={() => handleDelete(link.id, link.platform)} className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {links.length === 0 && <div className="card text-center py-12 text-gray-500">لا توجد وسائل تواصل.</div>}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-brand-dark">{editing ? 'تعديل' : 'إضافة وسيلة'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-brand-dark mb-2">المنصة</label>
                <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="input-field">
                  {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-brand-dark mb-2">الرابط</label>
                <input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="input-field" placeholder="https://..." dir="ltr" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-brand-dark mb-2">ترتيب</label>
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="input-field" dir="ltr" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2"><Save className="w-4 h-4" /> {editing ? 'حفظ' : 'إضافة'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

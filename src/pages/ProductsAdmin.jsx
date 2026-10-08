import { useState, useEffect } from 'react';
import { Droplet, Plus, Edit2, Trash2, X, Save, Loader2 } from 'lucide-react';
import { tursoQuery } from '../lib/turso';
import ImageUploader from '../components/ImageUploader';

export default function ProductsAdmin({ user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ size_label: '', name: '', description: '', image_url: '', sort_order: 0 });

  const isAdmin = user?.role === 'admin';
  const permissions = user?.permissions || [];
  const can = (code) => isAdmin || permissions.includes(code);

  const loadProducts = async () => {
    try {
      const data = await tursoQuery('SELECT * FROM products ORDER BY sort_order ASC');
      setProducts(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadProducts(); }, []);

  const openAddModal = () => {
    if (!can('products.create')) return;
    setEditingProduct(null);
    setForm({ size_label: '', name: '', description: '', image_url: '', sort_order: products.length + 1 });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (product) => {
    if (!can('products.edit')) return;
    setEditingProduct(product);
    setForm({
      size_label: product.size_label || '',
      name: product.name || '',
      description: product.description || '',
      image_url: product.image_url || '',
      sort_order: product.sort_order || 0,
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (!form.name || !form.size_label) {
      setError('يرجى ملء الحقول المطلوبة');
      setSaving(false);
      return;
    }

    try {
      if (editingProduct) {
        await tursoQuery(
          'UPDATE products SET size_label = ?, name = ?, description = ?, image_url = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [form.size_label, form.name, form.description, form.image_url, form.sort_order, editingProduct.id]
        );
      } else {
        await tursoQuery(
          'INSERT INTO products (size_label, name, description, image_url, sort_order) VALUES (?, ?, ?, ?, ?)',
          [form.size_label, form.name, form.description, form.image_url, form.sort_order]
        );
      }
      setShowModal(false);
      loadProducts();
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء الحفظ');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!can('products.delete')) return;
    if (!confirm('هل أنت متأكد من حذف "' + name + '"؟')) return;
    try {
      await tursoQuery('DELETE FROM products WHERE id = ?', [id]);
      loadProducts();
    } catch (err) { console.error(err); }
  };

  const toggleActive = async (product) => {
    if (!can('products.edit')) return;
    try {
      await tursoQuery('UPDATE products SET is_active = ? WHERE id = ?', [product.is_active ? 0 : 1, product.id]);
      loadProducts();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark flex items-center gap-2">
            <Droplet className="w-6 h-6" /> إدارة المنتجات
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {can('products.edit') ? 'إضافة وتعديل وحذف المنتجات مع رفع الصور' : 'عرض المنتجات فقط'}
          </p>
        </div>
        {can('products.create') && (
          <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> <span>إضافة منتج</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="card p-0 overflow-hidden">
            <div className="h-40 bg-gradient-to-br from-brand-blue to-brand-sky flex items-center justify-center relative">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <Droplet className="w-16 h-16 text-white opacity-80" />
              )}
              <span className="absolute top-3 right-3 bg-white/95 text-brand-dark text-xs font-bold px-3 py-1 rounded-full">{product.size_label}</span>
              <span className={'absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded-full ' + (product.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white')}>
                {product.is_active ? 'نشط' : 'معطل'}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-brand-dark text-lg mb-1">{product.name}</h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>

              {(can('products.edit') || can('products.delete')) && (
                <div className="flex items-center gap-2">
                  {can('products.edit') && (
                    <>
                      <button onClick={() => openEditModal(product)} className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-1">
                        <Edit2 className="w-4 h-4" /> تعديل
                      </button>
                      <button onClick={() => toggleActive(product)} className={'px-3 py-2 rounded-lg text-sm font-bold transition ' + (product.is_active ? 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700' : 'bg-green-50 hover:bg-green-100 text-green-700')}>
                        {product.is_active ? '⏸' : '▶'}
                      </button>
                    </>
                  )}
                  {can('products.delete') && (
                    <button onClick={() => handleDelete(product.id, product.name)} className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && <div className="card text-center py-12 text-gray-500">لا توجد منتجات بعد.</div>}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2">
                {editingProduct ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-brand-dark mb-2">اسم الحجم *</label>
                <input type="text" value={form.size_label} onChange={(e) => setForm({ ...form, size_label: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-brand-dark mb-2">اسم المنتج *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-brand-dark mb-2">الوصف</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-bold text-brand-dark mb-2">ترتيب العرض</label>
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="input-field" dir="ltr" />
              </div>
              <ImageUploader value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} label="صورة المنتج" />
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">⚠️ {error}</div>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...</> : <><Save className="w-4 h-4" /> {editingProduct ? 'حفظ التعديلات' : 'إضافة'}</>}
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

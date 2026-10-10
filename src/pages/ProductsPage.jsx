import { useState } from 'react';
import { Plus, Search, Edit3, Trash2, Filter, Star, Package } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import Modal from '../components/Modal';

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    category: 'serums',
    price: '',
    originalPrice: '',
    stock: '25',
    thumbnail: '',
    description: '',
  });

  const categories = ['All', 'serums', 'toners', 'creams', 'sunscreens', 'cleansers', 'masks'];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price) return;
    setSubmitting(true);
    try {
      await addProduct({
        ...form,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : parseFloat(form.price) * 1.2,
        stock: parseInt(form.stock) || 20,
        thumbnail: form.thumbnail || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80',
        origin: 'Made in Korea',
      });
      setIsAddOpen(false);
      setForm({ title: '', category: 'serums', price: '', originalPrice: '', stock: '25', thumbnail: '', description: '' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSubmitting(true);
    try {
      const targetId = editingProduct._id || editingProduct.id;
      await updateProduct(targetId, {
        title: editingProduct.title,
        category: editingProduct.category,
        price: parseFloat(editingProduct.price),
        originalPrice: editingProduct.originalPrice ? parseFloat(editingProduct.originalPrice) : undefined,
        stock: parseInt(editingProduct.stock),
        thumbnail: editingProduct.thumbnail,
        description: editingProduct.description,
      });
      setEditingProduct(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (prod) => {
    setDeletingProduct(prod);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setSubmitting(true);
    try {
      const targetId = deletingProduct._id || deletingProduct.id;
      await deleteProduct(targetId);
      setDeletingProduct(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
            Products Catalog ({filteredProducts.length})
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage live Korean skincare formulas, stock inventory, and pricing
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add New Product
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card-admin p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product title or brand..."
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field py-2.5 text-xs w-full md:w-44"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop / Tablet Table View */}
      <div className="card-admin p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/70">
                <th className="py-3 px-5">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Origin</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No products match your search or filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const id = p._id || p.id;
                  return (
                    <tr key={id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.thumbnail || p.images?.[0] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=120'}
                            alt={p.title}
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=120&auto=format&fit=crop&q=80';
                            }}
                            className="w-11 h-11 object-cover rounded-xl border border-slate-200 shrink-0 bg-slate-100"
                          />
                          <div>
                            <div className="font-bold text-slate-900 line-clamp-1">{p.title}</div>
                            <div className="text-[11px] text-slate-400">{p.brand || 'SEORA Seoul'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 capitalize border border-slate-200">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">${Number(p.price || 0).toFixed(2)}</div>
                        {p.originalPrice && (
                          <div className="text-[10px] text-slate-400 line-through">${Number(p.originalPrice).toFixed(2)}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-semibold ${(p.stock || 0) < 10 ? 'text-rose-600' : 'text-slate-700'}`}>
                          {p.stock ?? 25} units
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {p.origin || 'Made in Korea'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingProduct({ ...p })}
                            className="btn-secondary py-1.5 px-2.5 text-xs"
                            title="Edit Product"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            className="btn-danger py-1.5 px-2.5 text-xs"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Skincare Product">
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Product Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. SEORA Centella Calming Relief Ampoule"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input-field"
              >
                {categories.filter(c => c !== 'All').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="28.00"
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Original Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.originalPrice}
                onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                placeholder="35.00"
                className="input-field"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Stock Units</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="25"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Image Thumbnail URL</label>
            <input
              type="url"
              value={form.thumbnail}
              onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="input-field"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows="3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Korean botanical formulation details..."
              className="input-field"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Saving to Atlas...' : 'Save to Atlas'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal isOpen={!!editingProduct} onClose={() => setEditingProduct(null)} title="Edit Skincare Product">
        {editingProduct && (
          <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Product Title</label>
              <input
                type="text"
                required
                value={editingProduct.title}
                onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  className="input-field"
                >
                  {categories.filter(c => c !== 'All').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Stock Units</label>
                <input
                  type="number"
                  value={editingProduct.stock}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Thumbnail URL</label>
                <input
                  type="text"
                  value={editingProduct.thumbnail || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, thumbnail: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows="3"
                value={editingProduct.description || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? 'Updating...' : 'Update Product'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        title="Confirm Removal"
        maxWidth="max-w-md"
      >
        {deletingProduct && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 text-sm">
              Are you sure you want to remove <strong className="text-slate-900 font-semibold">{deletingProduct.title}</strong> from the active MongoDB Atlas catalog?
            </p>
            <p className="text-slate-400 text-xs">
              This action cannot be undone. Product stock and catalog entries will be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="btn-secondary py-2 px-4 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmDelete}
                className="btn-primary bg-rose-600 hover:bg-rose-700 py-2 px-4 text-xs font-semibold"
              >
                {submitting ? 'Removing...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

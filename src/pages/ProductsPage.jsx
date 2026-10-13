import { useState } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Filter,
  Star,
  Package,
  UploadCloud,
  Link as LinkIcon,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import Modal from '../components/Modal';

// Helper to optimize and convert device images to Data URL
const processImageFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file selected'));
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1200;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Image mode states
  const [addImageMode, setAddImageMode] = useState('upload'); // 'upload' | 'url'
  const [editImageMode, setEditImageMode] = useState('url'); // 'upload' | 'url'
  const [imageProcessing, setImageProcessing] = useState(false);

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
      setAddImageMode('upload');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageProcessing(true);
    try {
      const dataUrl = await processImageFile(file);
      setForm((prev) => ({ ...prev, thumbnail: dataUrl }));
    } catch (err) {
      console.error(err);
    } finally {
      setImageProcessing(false);
    }
  };

  const handleEditFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageProcessing(true);
    try {
      const dataUrl = await processImageFile(file);
      setEditingProduct((prev) => (prev ? { ...prev, thumbnail: dataUrl } : null));
    } catch (err) {
      console.error(err);
    } finally {
      setImageProcessing(false);
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
                            onClick={() => {
                              setEditingProduct({ ...p });
                              setEditImageMode(p.thumbnail?.startsWith('data:') ? 'upload' : 'url');
                            }}
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

          {/* Product Image Option: Device Upload or URL */}
          <div className="pt-1">
            <label className="block font-semibold text-slate-700 mb-1.5">Product Image *</label>

            {/* Toggle Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl mb-2.5 border border-slate-200/60">
              <button
                type="button"
                onClick={() => setAddImageMode('upload')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  addImageMode === 'upload'
                    ? 'bg-white text-primary-700 shadow-xs border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload from Device</span>
              </button>
              <button
                type="button"
                onClick={() => setAddImageMode('url')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  addImageMode === 'url'
                    ? 'bg-white text-primary-700 shadow-xs border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Image URL</span>
              </button>
            </div>

            {/* Device Upload Mode */}
            {addImageMode === 'upload' && (
              <div>
                <input
                  type="file"
                  id="add-product-image-file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAddFileChange}
                />
                {form.thumbnail && form.thumbnail.startsWith('data:') ? (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <img
                      src={form.thumbnail}
                      alt="Uploaded Preview"
                      className="w-16 h-16 object-cover rounded-lg border border-slate-200 bg-white shrink-0 shadow-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-800">Image Ready</div>
                      <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                        Uploaded from your device
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <label
                          htmlFor="add-product-image-file"
                          className="cursor-pointer text-xs font-semibold text-primary-700 hover:text-primary-800 hover:underline"
                        >
                          Change Image
                        </label>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, thumbnail: '' })}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="add-product-image-file"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={async (e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (!file) return;
                      setImageProcessing(true);
                      try {
                        const dataUrl = await processImageFile(file);
                        setForm((prev) => ({ ...prev, thumbnail: dataUrl }));
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setImageProcessing(false);
                      }
                    }}
                    className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-300 hover:border-primary-500 bg-slate-50/70 hover:bg-primary-50/30 rounded-xl cursor-pointer transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-primary-100 flex items-center justify-center text-slate-500 group-hover:text-primary-700 mb-2 transition-colors">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-primary-800">
                      {imageProcessing ? 'Processing image...' : 'Click to upload from device'}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      or drag and drop image file (PNG, JPG, WEBP)
                    </span>
                  </label>
                )}
              </div>
            )}

            {/* URL Mode */}
            {addImageMode === 'url' && (
              <div className="space-y-2">
                <input
                  type="url"
                  value={form.thumbnail.startsWith('data:') ? '' : form.thumbnail}
                  onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="input-field"
                />
                {form.thumbnail && !form.thumbnail.startsWith('data:') && (
                  <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <img
                      src={form.thumbnail}
                      alt="URL Preview"
                      className="w-12 h-12 object-cover rounded-lg border border-slate-200 bg-white shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-800">URL Preview</div>
                      <div className="text-[11px] text-slate-400 truncate">{form.thumbnail}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, thumbnail: '' })}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100"
                      title="Clear image URL"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
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
              disabled={submitting || imageProcessing}
              className="btn-primary"
            >
              {submitting ? 'Saving...' : 'Save Product'}
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
              <label className="block font-semibold text-slate-700 mb-1.5">Product Image</label>

              {/* Edit Image Switcher */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl mb-2.5 border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setEditImageMode('upload')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    editImageMode === 'upload'
                      ? 'bg-white text-primary-700 shadow-xs border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload from Device</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditImageMode('url')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    editImageMode === 'url'
                      ? 'bg-white text-primary-700 shadow-xs border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Image URL</span>
                </button>
              </div>

              {/* Edit: Upload Mode */}
              {editImageMode === 'upload' && (
                <div>
                  <input
                    type="file"
                    id="edit-product-image-file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleEditFileChange}
                  />
                  {editingProduct.thumbnail && editingProduct.thumbnail.startsWith('data:') ? (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <img
                        src={editingProduct.thumbnail}
                        alt="Uploaded Preview"
                        className="w-16 h-16 object-cover rounded-lg border border-slate-200 bg-white shrink-0 shadow-xs"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-800">New Image Loaded</div>
                        <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Ready to save</div>
                        <div className="flex items-center gap-2 mt-2">
                          <label
                            htmlFor="edit-product-image-file"
                            className="cursor-pointer text-xs font-semibold text-primary-700 hover:text-primary-800 hover:underline"
                          >
                            Change Image
                          </label>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={() => setEditingProduct({ ...editingProduct, thumbnail: '' })}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="edit-product-image-file"
                      className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-primary-500 bg-slate-50/70 hover:bg-primary-50/30 rounded-xl cursor-pointer transition-colors group"
                    >
                      <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-primary-700 mb-1" />
                      <span className="text-xs font-semibold text-slate-700 group-hover:text-primary-800">
                        {imageProcessing ? 'Processing image...' : 'Click to select new image from device'}
                      </span>
                    </label>
                  )}
                </div>
              )}

              {/* Edit: URL Mode */}
              {editImageMode === 'url' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editingProduct.thumbnail?.startsWith('data:') ? '' : editingProduct.thumbnail || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, thumbnail: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="input-field"
                  />
                  {editingProduct.thumbnail && !editingProduct.thumbnail.startsWith('data:') && (
                    <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                      <img
                        src={editingProduct.thumbnail}
                        alt="Preview"
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200 bg-white shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100';
                        }}
                      />
                      <span className="text-[11px] text-slate-500 truncate flex-1">
                        {editingProduct.thumbnail}
                      </span>
                    </div>
                  )}
                </div>
              )}
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
              Are you sure you want to remove <strong className="text-slate-900 font-semibold">{deletingProduct.title}</strong> from the product catalog?
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

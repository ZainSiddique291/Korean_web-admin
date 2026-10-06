import { useState } from 'react';
import { Search, Eye, Filter, ShoppingBag, Clock } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import OrderStatusBadge from '../components/OrderStatusBadge';
import Modal from '../components/Modal';

export default function OrdersPage() {
  const { orders, updateOrderStatus } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statuses = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const filteredOrders = orders.filter((o) => {
    const idStr = String(o.orderId || o.id || o._id || '');
    const nameStr = o.customer?.name || '';
    const payment = o.paymentMethod || '';
    const matchesSearch =
      idStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
            Orders Management ({filteredOrders.length})
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track customer orders, process fulfillment stages, and update shipping records
          </p>
        </div>
      </div>

      {/* Search & Status Tabs */}
      <div className="card-admin p-4 space-y-3">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order ID, customer name, payment..."
            className="input-field pl-10"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="card-admin p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/70">
                <th className="py-3 px-5">Order ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No orders match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const id = ord.orderId || ord.id || ord._id;
                  const dateStr = ord.createdAt
                    ? new Date(ord.createdAt).toLocaleDateString()
                    : 'Recently';
                  return (
                    <tr key={id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-semibold text-slate-800">
                        {String(id).slice(-8).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{dateStr}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{ord.customer?.name}</div>
                        <div className="text-[11px] text-slate-400">{ord.customer?.phone || ord.customer?.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ${Number(ord.total || 0).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{ord.paymentMethod || 'COD'}</td>
                      <td className="py-3.5 px-4">
                        <OrderStatusBadge status={ord.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="btn-secondary py-1.5 px-3 text-xs inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Inspect Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order: #${String(selectedOrder?.orderId || selectedOrder?.id || selectedOrder?._id || '').slice(-8).toUpperCase()}`}
      >
        {selectedOrder && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Customer Info</span>
                <span className="font-semibold text-slate-800">{selectedOrder.customer?.name}</span>
                <span className="text-slate-500 block">{selectedOrder.customer?.email}</span>
                <span className="text-slate-500 block">{selectedOrder.customer?.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Delivery Address</span>
                <span className="font-semibold text-slate-800">{selectedOrder.customer?.city || 'Lahore'}</span>
                <span className="text-slate-500 block">{selectedOrder.customer?.address}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-2">Ordered Products</h4>
              <div className="space-y-2">
                {selectedOrder.products?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.thumbnail || item.images?.[0] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100'}
                        alt={item.title}
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                      />
                      <div>
                        <div className="font-semibold text-slate-800 line-clamp-1">{item.title}</div>
                        <div className="text-slate-400 text-[11px]">
                          Qty: {item.quantity || 1} × ${Number(item.price || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900">
                      ${((item.quantity || 1) * Number(item.price || 0)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <span className="font-bold text-slate-800">Grand Total:</span>
              <span className="text-base font-bold text-emerald-700">
                ${Number(selectedOrder.total || 0).toFixed(2)}
              </span>
            </div>

            <div className="pt-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Fulfillment Status (Live MongoDB Atlas)
              </label>
              <select
                value={selectedOrder.status}
                onChange={async (e) => {
                  const newStatus = e.target.value;
                  const targetId = selectedOrder._id || selectedOrder.id;
                  await updateOrderStatus(targetId, newStatus);
                  setSelectedOrder({ ...selectedOrder, status: newStatus });
                }}
                className="input-field text-xs"
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
